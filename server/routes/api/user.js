const uuid = require('uuid/v4')
const Boom = require('boom')

module.exports = {
  find (request, reply) {
    const db = request.db

    db.user.find({}).toArray(function (err, result) {
      if (err) {
        return reply(Boom.badRequest('Find failed', err))
      }

      return reply(result)
    })
  },
  get (request, reply) {
    const db = request.db
    const id = request.params.id

    db.user.find({ id: id }).toArray(function (err, result) {
      if (err) {
        return reply(Boom.badRequest('Get failed', err))
      }
      if (!result || result.length !== 1) {
        return reply(Boom.notFound('Get failed', err))
      }

      return reply(result[0])
    })
  },
  post (request, reply) {
    const db = request.db
    request.payload.id = uuid()

    db.user.insertOne(request.payload, function (err, result) {
      if (err) {
        return reply(Boom.badRequest('Post failed', err))
      }
      if (!result) {
        return reply(Boom.notFound('Post failed', err))
      }

      return reply(result[0])
    })
  },
  put (request, reply) {
    const db = request.db
    const id = request.params.id

    db.user.updateOne({ id: id }, request.payload, function (err, doc) {
      if (err) {
        return reply(Boom.badRequest('Put failed', err))
      }
      if (!doc) {
        return reply(Boom.notFound('Put failed', err))
      }
      reply(doc)
    })
  },
  patch (request, reply) {
    const db = request.db
    const id = request.params.id

    db.user.find({ id: id }).toArray(function (err, result) {
      if (err) {
        return reply(Boom.badRequest('Patch failed', err))
      }
      if (!result || result.length !== 1) {
        return reply(Boom.notFound('Patch failed', err))
      }

      // patch obj
      result = result[0]
      Object.assign(result, request.payload)

      db.updateOne({ id: id }, result, function (err, doc) {
        if (err) {
          return reply(Boom.badRequest('Patch failed', err))
        }
        if (!doc) {
          return reply(Boom.notFound('Patch failed', err))
        }
        reply(doc)
      })
    })
  },
  delete (request, reply) {
    const db = request.db
    const id = request.params.id

    db.user.deleteOne({ id: id }, function (err, num) {
      if (err) {
        return reply(Boom.badRequest('Delete failed', err))
      }

      // num contains the number of deleted documents (here 0 or 1)
      if (num === 0) {
        return reply(Boom.notFound('Delete failed', err))
      }

      reply({ deleted: id })
    })
  }
}
