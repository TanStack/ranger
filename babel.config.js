const { NODE_ENV, BABEL_ENV } = process.env
const cjs = NODE_ENV === 'test' || BABEL_ENV === 'commonjs'
const loose = true

module.exports = {
  targets: 'defaults, not ie 11, not ie_mob 11',
  presets: [
    [
      '@babel/preset-env',
      {
        loose,
        modules: false,
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [cjs && ['@babel/transform-modules-commonjs', { loose }]].filter(
    Boolean,
  ),
  overrides: [
    {
      include: ['./packages/react-ranger/**'],
      presets: ['@babel/preset-react'],
    },
  ],
}