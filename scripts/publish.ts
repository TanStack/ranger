import {
  branchConfigs,
  examplesDir,
  latestBranch,
  packages,
  rootDir,
} from './config'
import { BranchConfig, Commit, Package } from './types'
import { getPackageDir } from './utils'

// Originally ported to TS from https://github.com/remix-run/react-router/tree/main/scripts/{version,publish}.js
import path from 'path'
import { exec, execSync } from 'child_process'
import fsp from 'fs/promises'
import chalk from 'chalk'
import jsonfile from 'jsonfile'
import semver from 'semver'
import currentGitBranch from 'current-git-branch'
import parseCommit from '@commitlint/parse'
import log from 'git-log-parser'
import streamToArray from 'stream-to-array'
import axios from 'axios'
import { DateTime } from 'luxon'

import { PackageJson } from 'type-fest'

const releaseCommitMsg = (version: string) => `release: v${version}`

async function run() {
  let branchName: string =
    process.env.BRANCH ??
    (process.env.PR_NUMBER ? `pr-${process.env.PR_NUMBER}` : currentGitBranch())

  const branchConfig: BranchConfig = branchConfigs[branchName] || {
    prerelease: true,
    ghRelease: false,
  }

  const isLatestBranch = branchName === latestBranch
  const npmTag = isLatestBranch ? 'latest' : branchName

  let remoteURL = execSync('git config --get remote.origin.url').toString()

  remoteURL = remoteURL.substring(0, remoteURL.indexOf('.git'))

  // Get tags
  let tags: string[] = execSync('git tag').toString().split('\n')

  // Filter tags to our branch/pre-release combo
  tags = tags
    .filter(semver.valid)
    .filter(tag => {
      if (isLatestBranch) {
        return semver.prerelease(tag) == null
      }

      return tag.includes(`-${branchName}`)
    })
    // sort by latest
    .sort(semver.compare)

  // Get the latest tag
  let latestTag = [...tags].pop()

  let range = `${latestTag}..HEAD`
  // let range = ``;

  // If RELEASE_ALL is set via a commit subject or body, all packages will be
  // released regardless if they have changed files matching the package srcDir.
  let RELEASE_ALL = false

  if (!latestTag || process.env.TAG) {
    if (process.env.TAG) {
      if (!process.env.TAG.startsWith('v')) {
        throw new Error(
          `process.env.TAG must start with "v", eg. v0.0.0. You supplied ${process.env.TAG}`
        )
      }
      console.log(
        chalk.yellow(
          `Tag is set to ${process.env.TAG}. This will force release all packages. Publishing...`
        )
      )
      RELEASE_ALL = true
      latestTag = process.env.TAG
      range = ''
    } else {
      throw new Error(
        'Could not find latest tag! To make a release tag of v0.0.1, run with TAG=v0.0.1'
      )
    }
  }

  // Get the commits since the latest tag
  let commitsSinceLatestTag = (
    await new Promise<Commit[]>((resolve, reject) => {
      const strm = log.parse({
        _: range,
      })

      streamToArray(strm, function (err: any, arr: any[]) {
        if (err) return reject(err)

        Promise.all(
          arr.map(async d => {
            const parsed = await parseCommit(d.subject)

            return { ...d, parsed }
          })
        ).then(res => resolve(res.filter(Boolean)))
      })
    })
  ).filter((commit: Commit) => {
    const exclude = [
      commit.subject.startsWith('Merge branch '), // No merge commits
      commit.subject.startsWith(releaseCommitMsg('')), // No example update commits
    ].some(Boolean)

    return !exclude
  })

  console.log(
    `Parsing ${commitsSinceLatestTag.length} commits since ${latestTag}...`
  )

  // Pares the commit messsages, log them, and determine the type of release needed
  const recommendedReleaseLevel: number = commitsSinceLatestTag.reduce(
    (releaseLevel, commit) => {
      if (['fix', 'refactor', 'perf'].includes(commit.parsed.type)) {
        releaseLevel = Math.max(releaseLevel, 0)
      }
      if (['feat'].includes(commit.parsed.type)) {
        releaseLevel = Math.max(releaseLevel, 1)
      }
      if (commit.body.includes('BREAKING CHANGE')) {
        releaseLevel = Math.max(releaseLevel, 2)
      }
      if (
        commit.subject.includes('RELEASE_ALL') ||
        commit.body.includes('RELEASE_ALL')
      ) {
        RELEASE_ALL = true
      }

      return releaseLevel
    },
    -1
  )

  const changedFiles: string[] = process.env.TAG
    ? []
    : execSync(`git diff ${latestTag} --name-only`)
        .toString()
        .split('\n')
        .filter(Boolean)

  let changedPackages = RELEASE_ALL
    ? packages
    : changedFiles.reduce((changedPackages, file) => {
        const pkg = packages.find(p => file.startsWith(p.srcDir))
        if (pkg && !changedPackages.find(d => d.name === pkg.name)) {
          changedPackages.push(pkg)
        }
        return changedPackages
      }, [] as Package[])

  // If a package has a dependency that has been updated, we need to update the
  // package that depends on it as well.
  packages.forEach(pkg => {
    if (
      pkg.dependencies?.find(dep =>
        changedPackages.find(d => d.name === dep)
      ) &&
      !changedPackages.find(d => d.name === pkg.name)
    ) {
      changedPackages.push(pkg)
    }
  })

  if (!process.env.TAG) {
    if (recommendedReleaseLevel === 2) {
      console.log(
        `Major versions releases must be tagged and released manually.`
      )
      return
    }

    if (recommendedReleaseLevel === -1) {
      console.log(
        `There have been no changes since the release of ${latestTag} that require a new version. You're good!`
      )
      return
    }
  }

  function getSorterFn<TItem>(sorters: ((d: TItem) => any)[]) {
    return (a: TItem, b: TItem) => {
      let i = 0

      sorters.some(sorter => {
        const sortedA = sorter(a)
        const sortedB = sorter(b)
        if (sortedA > sortedB) {
          i = 1
          return true
        }
        if (sortedA < sortedB) {
          i = -1
          return true
        }
        return false
      })

      return i
    }
  }

  const changelogCommitsMd = process.env.TAG
    ? `Manual Release: ${latestTag}`
    : await Promise.all(
        Object.entries(
          commitsSinceLatestTag.reduce((acc, next) => {
            const type = next.parsed.type?.toLowerCase() ?? 'other'

            return {
              ...acc,
              [type]: [...(acc[type] || []), next],
            }
          }, {} as Record<string, Commit[]>)
        )
          .sort(
            getSorterFn([
              ([d]) =>
                [
                  'other',
                  'examples',
                  'docs',
                  'chore',
                  'refactor',
                  'perf',
                  'fix',
                  'feat',
                ].indexOf(d),
            ])
          )
          .reverse()
          .map(async ([type, commits]) => {
            return Promise.all(
              commits.map(async commit => {
                let username = ''

                if (process.env.GH_TOKEN) {
                  const query = `${
                    commit.author.email ?? commit.committer.email
                  }`

                  const res = await axios.get(
                    'https://api.github.com/search/users',
                    {
                      params: {
                        q: query,
                      },
                      headers: {
                        Authorization: `token ${process.env.GH_TOKEN}`,
                      },
                    }
                  )

                  username = res.data.items[0]?.login
                }

                const scope = commit.parsed.scope
                  ? `(${commit.parsed.scope}): `
                  : ''
                const subject = commit.parsed.subject ?? commit.subject
                // const commitUrl = `${remoteURL}/commit/${commit.commit.long}`;

                return `- ${scope}${subject} (${commit.commit.short}) ${
                  username
                    ? `by @${username}`
                    : `by ${commit.author.name ?? commit.author.email}`
                }`
              })
            ).then(commits => [type, commits] as const)
          })
      ).then(groups => {
        return groups
          .map(([type, commits]) => {
            return [`### ${capitalize(type)}`, commits.join('\n')].join('\n\n')
          })
          .join('\n\n')
      })

  const releaseType = branchConfig.prerelease
    ? 'prerelease'
    : { 0: 'patch', 1: 'minor', 2: 'major' }[recommendedReleaseLevel]

  if (!releaseType) {
    throw new Error(`Invalid release level: ${recommendedReleaseLevel}`)
  }

  const version = process.env.TAG
    ? semver.parse(process.env.TAG)?.version
    : semver.inc(latestTag, releaseType, npmTag)

  if (!version) {
    throw new Error(
      `Invalid version increment from semver.inc(${[
        latestTag,
        recommendedReleaseLevel,
        branchConfig.prerelease,
      ].join(', ')}`
    )
  }

  const changelogMd = [
    `Version ${version} - ${DateTime.now().toLocaleString(
      DateTime.DATETIME_SHORT
    )}`,
    `## Changes`,
    changelogCommitsMd,
    `## Packages`,
    changedPackages.map(d => `- ${d.name}@${version}`).join('\n'),
  ].join('\n\n')

  console.log('Generating changelog...')
  console.log()
  console.log(changelogMd)
  console.log()

  console.log('Building packages...')
  execSync(`yarn build`, { encoding: 'utf8' })

  console.log('Linking packages...')
  execSync(`yarn linkAll`, { encoding: 'utf8' })

  console.log('Testing packages...')
  execSync(`yarn test:ci`, { encoding: 'utf8' })
  console.log('')

  console.log(
    `Updating all changed packages and their dependencies to version ${version}...`
  )
  // Update each package to the new version along with any dependencies
  for (const pkg of changedPackages) {
    console.log(`  Updating ${pkg.name} version to ${version}...`)

    await updatePackageConfig(pkg.name, config => {
      config.version = version

      pkg.dependencies?.forEach(dep => {
        if (config.dependencies?.[dep]) {
          console.log(
            `    Updating dependency on ${pkg.name} to version ${version}.`
          )
          config.dependencies[dep] = version
        }
      })

      pkg.peerDependencies?.forEach(peerDep => {
        if (config.peerDependencies?.[peerDep]) {
          console.log(
            `    Updating peerDependency on ${pkg.name} to version ${version}.`
          )
          config.peerDependencies[peerDep] = version
        }
      })
    })
  }

  console.log(`Updating examples dependencies...`)
  let examples = await fsp.readdir(examplesDir)
  for (const example of examples) {
    let stat = await fsp.stat(path.join(examplesDir, example))
    if (!stat.isDirectory()) continue

    console.log(`  Updating example ${example} to version ${version}...`)

    await updateExamplesPackageConfig(example, config => {
      changedPackages.forEach(pkg => {
        if (config.dependencies?.[pkg.name]) {
          console.log(
            `    Updating dependency ${pkg.name} to version ${version}...`
          )
          config.dependencies[pkg.name] = version
        }
      })
    })
  }

  if (!process.env.CI) {
    console.warn(
      `This is a dry run for version ${version}. Push to CI to publish for real or set CI=true to override!`
    )
    return
  }

  // Tag and commit
  console.log(`Creating new git tag v${version}`)
  execSync(`git tag -a -m "v${version}" v${version}`)

  let taggedVersion = getTaggedVersion()
  if (!taggedVersion) {
    throw new Error(
      'Missing the tagged release version. Something weird is afoot!'
    )
  }

  console.log()
  console.log(`Verifying packages are on version ${version}`)

  // Ensure packages are up to date and ready
  await Promise.all(
    changedPackages.map(async pkg => {
      let file = path.join(
        rootDir,
        'packages',
        getPackageDir(pkg.name),
        'package.json'
      )
      let json = (await jsonfile.readFile(file)) as PackageJson

      if (json.version !== version) {
        throw new Error(
          `Package ${pkg.name} is on version ${json.version}, but should be on ${version}`
        )
      }

      ;(pkg.dependencies ?? []).forEach(dependency => {
        if (json.dependencies?.[dependency]) {
          if (json.dependencies[dependency] !== version) {
            throw new Error(
              `Package ${pkg.name}'s dependency of ${dependency} is on version ${json.dependencies[dependency]}, but should be on ${version}`
            )
          }
        }
      })
      ;(pkg.dependencies ?? []).forEach(peerDependency => {
        if (json.peerDependencies?.[peerDependency]) {
          if (json.peerDependencies[peerDependency] !== version) {
            throw new Error(
              `Package ${pkg.name}'s peerDependency of ${peerDependency} is on version ${json.peerDependencies[peerDependency]}, but should be on ${version}`
            )
          }
        }
      })
    })
  )

  console.log()
  console.log(`Publishing all packages to npm with tag "${npmTag}"`)

  // Publish each package
  changedPackages.map(pkg => {
    let packageDir = path.join(rootDir, 'packages', getPackageDir(pkg.name))
    const cmd = `cd ${packageDir} && yarn publish --tag ${npmTag} --access=public`
    console.log(
      `  Publishing ${pkg.name}@${version} to npm with tag "${npmTag}"...`
    )
    execSync(`${cmd} --token ${process.env.NPM_TOKEN}`)
  })

  // Update example lock files to use new dependencies
  for (const example of examples) {
    let stat = await fsp.stat(path.join(examplesDir, example))
    if (!stat.isDirectory()) continue

    console.log(`  Updating example ${example} dependencies/lockfile...`)

    updateExampleLockfile(example)
  }

  console.log()

  console.log(`Pushing new tags to branch.`)
  execSync(`git push --tags`)
  console.log(`  Pushed tags to branch.`)

  if (branchConfig.ghRelease) {
    console.log(`Creating github release...`)
    // Stringify the markdown to excape any quotes
    execSync(
      `gh release create v${version} ${
        isLatestBranch ? '--prerelease' : ''
      } --notes '${changelogMd}'`
    )
    console.log(`  Github release created.`)

    console.log(`Committing changes...`)
    execSync(`git add -A && git commit -m "${releaseCommitMsg(version)}"`)
    console.log()
    console.log(`  Committed Changes.`)
    console.log(`Pushing changes...`)
    execSync(`git push`)
    console.log()
    console.log(`  Changes pushed.`)
  } else {
    console.log(`Skipping github release and change commit.`)
  }

  console.log(`Pushing tags...`)
  execSync(`git push --tags`)
  console.log()
  console.log(`  Tags pushed.`)
  console.log(`All done!`)
}

run().catch(err => {
  console.log(err)
  process.exit(1)
})

function capitalize(str: string) {
  return str.slice(0, 1).toUpperCase() + str.slice(1)
}

async function updatePackageConfig(
  packageName: string,
  transform: (json: PackageJson) => void
) {
  let file = packageJson(packageName)
  let json = await jsonfile.readFile(file)
  transform(json)
  await jsonfile.writeFile(file, json, { spaces: 2 })
}

async function updateExamplesPackageConfig(
  example: string,
  transform: (json: PackageJson) => void
) {
  let file = packageJson(example, 'examples')
  let json = await jsonfile.readFile(file)
  transform(json)
  await jsonfile.writeFile(file, json, { spaces: 2 })
}

function updateExampleLockfile(example: string) {
  // execute yarn to update lockfile, ignoring any stdout or stderr
  const exampleDir = path.join(rootDir, 'examples', example)
  execSync(`cd ${exampleDir} && yarn`, { stdio: 'ignore' })
}

function packageJson(packageName: string, directory = 'packages') {
  return path.join(
    rootDir,
    directory,
    getPackageDir(packageName),
    'package.json'
  )
}

function getTaggedVersion() {
  let output = execSync('git tag --list --points-at HEAD').toString()
  return output.replace(/^v|\n+$/g, '')
}
