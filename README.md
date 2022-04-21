![React Ranger Header](https://github.com/tannerlinsley/react-ranger/raw/master/media/header.png)

<img src='https://github.com/tannerlinsley/react-ranger/raw/master/media/logo.png' width='300'/>

Hooks for building range and multi-range sliders in React

<a href="https://twitter.com/search?q=%23TanStack" target="\_parent">
  <img alt="#TanStack" src="https://img.shields.io/twitter/url?color=%2308a0e9&label=%23TanStack&style=social&url=https%3A%2F%2Ftwitter.com%2Fintent%2Ftweet%3Fbutton_hashtag%3DTanStack">
</a><a href="https://github.com/tannerlinsley/react-ranger/actions?query=workflow%3A%22react-ranger+tests%22">
<img src="https://github.com/tannerlinsley/react-ranger/workflows/react-ranger%20tests/badge.svg" />
</a><a href="https://npmjs.com/package/react-ranger" target="\_parent">
  <img alt="" src="https://img.shields.io/npm/dm/react-ranger.svg" />
</a><a href="https://bundlephobia.com/result?p=react-ranger@latest" target="\_parent">
  <img alt="" src="https://badgen.net/bundlephobia/minzip/react-ranger@latest" />
</a><a href="#badge">
    <img alt="semantic-release" src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg">
  </a><a href="https://github.com/tannerlinsley/react-ranger/discussions">
  <img alt="Join the discussion on Github" src="https://img.shields.io/badge/Github%20Discussions%20%26%20Support-Chat%20now!-blue" />
</a><a href="https://github.com/tannerlinsley/react-ranger" target="\_parent">
  <img alt="" src="https://img.shields.io/github/stars/tannerlinsley/react-ranger.svg?style=social&label=Star" />
</a><a href="https://twitter.com/tannerlinsley" target="\_parent">
  <img alt="" src="https://img.shields.io/twitter/follow/tannerlinsley.svg?style=social&label=Follow" />
</a>

Enjoy this library? Try them all! [React Table](https://github.com/tannerlinsley/react-table), [React Query](https://github.com/tannerlinsley/react-query), [React Form](https://github.com/tannerlinsley/react-form), [React Charts](https://github.com/tannerlinsley/react-charts)

<p align="center">
  <img src='https://github.com/tannerlinsley/react-ranger/raw/master/media/screenshot.png' width="700"/>
</p>

## Quick Features

- Headless!
- Single or Multiple Handles
- Handle Devider Items
- Custom Steps or Step-Size
- Custom Ticks
- <a href="https://bundlephobia.com/result?p=react-ranger@latest" target="\_parent">
  <img alt="" src="https://badgen.net/bundlephobia/minzip/react-ranger@latest" />
  </a>

## Sponsors

This library is being built and maintained by me, @tannerlinsley and I am always in need of more support to keep projects like this afloat. If you would like to get premium support, add your logo or name on this README, or simply just contribute to my open source Sponsorship goal, [visit my Github Sponsors page!](https://github.com/sponsors/tannerlinsley/)

# Documentation

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
  - [Sample Usage](#sample-usage)
  - [Options](#options)
  - [Returns](#returns)
  - [Interpolation](#interpolation)
- [Contributors ✨](#contributors-)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Installation

```bash
$ npm i --save react-ranger
# or
$ yarn add react-ranger
```

## Sample Usage

The following is a very basic example of a single range input that looks similar to Chrome's default appearance.

```javascript
import ReactRanger from 'react-ranger'

function App() {
  const [values, setValues] = React.useState([10])

  const { getTrackProps, handles } = useRanger({
    values,
    onChange: setValues,
    min: 0,
    max: 100,
    stepSize: 5,
  })

  return (
    <>
      <div
        {...getTrackProps({
          style: {
            height: '4px',
            background: '#ddd',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,.6)',
            borderRadius: '2px',
          },
        })}
      >
        {handles.map(({ getHandleProps }) => (
          <div
            {...getHandleProps({
              style: {
                width: '12px',
                height: '12px',
                borderRadius: '100%',
                background: 'linear-gradient(to bottom, #eee 45%, #ddd 55%)',
                border: 'solid 1px #888',
              },
            })}
          />
        ))}
      </div>
    </>
  )
}
```

# Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://tannerlinsley.com"><img src="https://avatars0.githubusercontent.com/u/5580297?v=4" width="100px;" alt=""/><br /><sub><b>Tanner Linsley</b></sub></a><br /><a href="https://github.com/tannerlinsley/react-ranger/commits?author=tannerlinsley" title="Code">💻</a> <a href="#ideas-tannerlinsley" title="Ideas, Planning, & Feedback">🤔</a> <a href="#example-tannerlinsley" title="Examples">💡</a> <a href="#maintenance-tannerlinsley" title="Maintenance">🚧</a> <a href="https://github.com/tannerlinsley/react-ranger/pulls?q=is%3Apr+reviewed-by%3Atannerlinsley" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="http://everttimberg.io"><img src="https://avatars3.githubusercontent.com/u/6757853?v=4" width="100px;" alt=""/><br /><sub><b>Evert Timberg</b></sub></a><br /><a href="https://github.com/tannerlinsley/react-ranger/commits?author=etimberg" title="Code">💻</a> <a href="#ideas-etimberg" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

<!-- Force -->
