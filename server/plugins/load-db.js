const Glob = require('glob')
const parser = require('json-schema-ref-parser')
const uuid = require('uuid/v4')
const PicoDB = require('picodb')
const jsf = require('json-schema-faker')
const name = 'load-db'

jsf.format('uuid', function (gen, schema) {
  return uuid()
})

module.exports.register = function (server, options, next) {
  Glob(options.schema, function (err, files) {
    if (err) {
      server.log(['error', name], err)
      return next(err)
    }

    Promise.all(files.map(f => parser.dereference(f))).then(values => {
      const expose = {
        schema: values
      }

      values.forEach(function (schema, index) {
        const db = PicoDB.Create()
        const samples = []
        for (let i = 0; i < 10; i++) {
          samples.push(jsf({
            required: schema.required,
            properties: schema.properties,
            additionalProperties: schema.additionalProperties
          }))
        }

        db.insertMany(samples)

        expose[schema.id] = db
      })

      server.decorate('server', 'db', expose)
      server.decorate('request', 'db', expose)

      next()
    }).catch(err => {
      server.log(['error', name], err)
      return next(err)
    })
  })
}

exports.register.attributes = {
  name: 'load-db',
  pkg: require('../../package.json')
}
