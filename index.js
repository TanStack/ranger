if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/react-ranger.production.min.js')
} else {
  module.exports = require('./dist/react-ranger.development.js')
}
