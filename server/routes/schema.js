module.exports = {
  method: 'GET',
  path: '/schema/{path*}',
  config: {
    handler: {
      directory: {
        path: [
          'server/public/schema'
        ],
        listing: true,
        index: true
      }
    },
    cache: {
      privacy: 'private',
      expiresIn: 60 * 1000 * 2880
    }
  }
}
