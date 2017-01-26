module.exports = [
  { method: 'GET',
    path: '/app',
    handler: function (request, reply) {
      reply.view('index', null, { layout: false })
    }
  },
  require('./home'),
  require('./public'),
  require('./schema')
]
