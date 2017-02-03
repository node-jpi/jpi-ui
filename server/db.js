const Path = require('path')
const uuid = require('uuid/v4')
const Boom = require('boom')
const PicoDB = require('picodb')
const jsf = require('json-schema-faker')
const map = new Map()

jsf.format('uuid', function (gen, schema) {
  return uuid()
})

const methods = {
  DELETE: function (db) {
    return function (request, reply) {
      let id = request.params.id
      db.deleteOne({ id: id }, function (err, num) {
        if (err) {
          return reply(Boom.badRequest('Delete failed', err))
        }
        if (num === 0) {
          return reply(Boom.notFound('Delete failed', err))
        }
        // num contains the number of deleted documents (here 0 or 1)
        reply({ deleted: id })
      })
    }
  },
  DEFAULT: function (db) {
    return function (request, reply) {
      reply({ ok: 200 })
    }
  }
}

function getMethod (link) {
  if (link.rel === 'instances' && link.method === 'GET') {
    return 'find'
  }
  return link.method
}

function createDb (schema) {
  const db = PicoDB.Create()
  const samples = []
  for (let i = 0; i < 10; i++) {
    samples.push(jsf({
      required: schema.required,
      properties: schema.properties,
      additionalProperties: schema.additionalProperties
    }))
  }

  // db.insertMany(samples)
  return db
}

module.exports = function makeHandler (file, schema, link, relativeTo) {
  if (link.config && link.config.path) {
    let idx = link.config.path.lastIndexOf('[')
    let path = link.config.path.slice(0, idx)
    let name = link.config.path.slice(idx + 1, -1)
    return require(Path.resolve(relativeTo || Path.dirname(file), path))[name]
  }

  console.log(link.rel)
  const id = schema.id
  let db
  if (map.has(id)) {
    db = map.get(id)
  } else {
    db = createDb(schema)
    map.set(schema.id, db)
  }

  let method = getMethod(link)

  return methods[method.toUpperCase() in methods ? method.toUpperCase() : 'DEFAULT'](db)
}
