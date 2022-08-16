const { NODE_ENV, BABEL_ENV } = process.env
const cjs = NODE_ENV === 'test' || BABEL_ENV === 'commonjs'
const loose = true

module.exports = {
  targets: 'defaults, not ie 11, not ie_mob 11',
  presets: [
    [
      '@babel/env',
      {
        loose,
        modules: false,
        // exclude: ['@babel/plugin-transform-regenerator'],
      },
    ],
    '@babel/react',
    '@babel/preset-typescript',
  ],
  plugins: [
    // 'babel-plugin-transform-async-to-promises',
    cjs && ['@babel/transform-modules-commonjs', { loose }],
    // [
    //   '@babel/transform-runtime',
    //   {
    //     useESModules: !cjs,
    //     version: require('./package.json').dependencies[
    //       '@babel/runtime'
    //     ].replace(/^[^0-9]*/, ''),
    //   },
    // ],
  ].filter(Boolean),
}
