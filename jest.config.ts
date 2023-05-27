const path = require('path')
const { lstatSync, readdirSync } = require('fs')

// get listing of packages in the mono repo
const basePath = path.resolve(__dirname, 'packages')

const packages = readdirSync(basePath).filter((name) => {
  return lstatSync(path.join(basePath, name)).isDirectory()
})

const { namespace } = require('./package.json')

const moduleNameMapper = {
  ...packages.reduce(
    (acc, name) => ({
      ...acc,
      [`${namespace}/${name}(.*)$`]: `<rootDir>/packages/./${name}/src/$1`,
    }),
    {},
  ),
}

module.exports = {
  projects: [
    {
      displayName: 'ranger',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/packages/ranger/**/*.test.[jt]s?(x)'],
      setupFilesAfterEnv: [
        '<rootDir>/packages/ranger-core/__tests__/jest.setup.js',
      ],
      snapshotFormat: {
        printBasicPrototype: false,
      },
      moduleNameMapper,
    },
    {
      displayName: 'react-ranger',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/packages/react-ranger/**/*.test.[jt]s?(x)'],
      setupFilesAfterEnv: [
        '<rootDir>/packages/react-ranger/__tests__/jest.setup.js',
      ],
      snapshotFormat: {
        printBasicPrototype: false,
      },
      moduleNameMapper,
    },
  ],
}
