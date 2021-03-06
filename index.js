const config = require('./config')
const composeServer = require('./server')
const pkg = require('./package.json')
const appName = pkg.name
const appVersion = pkg.version

if (!module.parent) {
  // There's no callee so we're running
  // normally and will compose and start a server
  composeServer(function (err, server) {
    if (err) {
      throw err
    }

    /**
     * Start the server
     */
    server.start(function (err) {
      var details = {
        name: appName,
        version: appVersion,
        info: server.info
      }

      if (err) {
        details.error = err
        details.message = 'Failed to start ' + details.name
        server.log(['error', 'info'], details)
        throw err
      } else {
        details.config = config
        details.message = 'Started ' + details.name
        server.log('info', details)
        server.connections.forEach(function (connection) {
          console.log('Server started at: ' + connection.info.uri)
        })

        server.table().forEach(function (table) {
          console.log('Server started at: ' + table.info.uri)
          console.log('Labels: ' + table.labels)
          console.log(table.table.map(item => item.method.toUpperCase() + ' ' + item.path))
        })
      }
    })
  })
} else {
  // There's a callee so we're probably running a test.
  // In which case just export the compose server function
  module.exports = composeServer
}
