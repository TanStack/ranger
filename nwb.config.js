module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'ReactRanger',
      externals: {
        react: 'React',
        'prop-types': 'PropTypes',
      },
    },
  },
}
