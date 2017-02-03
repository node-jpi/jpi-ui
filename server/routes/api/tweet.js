const uuid = require('uuid/v4')
const Boom = require('boom')

module.exports = {
  find (request, reply) {
    const db = request.db

    db.tweet.find({}).toArray(function (err, result) {
      if (err) {
        return reply(Boom.badRequest('Find failed', err))
      }

      return reply(result)
    })
  },
  get (request, reply) {
    const db = request.db
    const id = request.params.id

    db.tweet.find({ id: id }).toArray(function (err, result) {
      if (err) {
        return reply(Boom.badRequest('Get failed', err))
      }
      if (!result || result.length !== 1) {
        return reply(Boom.notFound('Get failed', err))
      }

      return reply(result[0])
    })
  },
  getUser (request, reply) {
    const db = request.db
    const id = request.params.id

    db.tweet.find({ id: id }).toArray(function (err, result) {
      if (err) {
        return reply(Boom.badRequest('Get failed', err))
      }
      if (!result || result.length !== 1) {
        return reply(Boom.notFound('Get failed', err))
      }

      db.user.find({ id: result[0].userId }).toArray(function (err, result) {
        if (err) {
          return reply(Boom.badRequest('Get failed', err))
        }
        if (!result || result.length !== 1) {
          return reply(Boom.notFound('Get failed', err))
        }

        return reply(result[0])
      })
    })
  },
  post (request, reply) {
    const db = request.db
    request.payload.id = uuid()

    db.tweet.insertOne(request.payload, function (err, result) {
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

    db.tweet.updateOne({ id: id }, request.payload, function (err, doc) {
      if (err) {
        return reply(Boom.badRequest('Put failed', err))
      }
      if (!doc) {
        return reply(Boom.notFound('Put failed', err))
      }
      reply(doc)
    })
  },
  delete (request, reply) {
    const db = request.db
    const id = request.params.id

    db.tweet.deleteOne({ id: id }, function (err, num) {
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
