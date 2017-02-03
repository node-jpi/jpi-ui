const Path = require('path')
const Lab = require('lab')
const Code = require('code')
const uuid = require('uuid/v4')
const validator = require('is-my-json-valid')
const parser = require('json-schema-ref-parser')
const jsf = require('json-schema-faker')
const composeServer = require('..')
const lab = exports.lab = Lab.script()

jsf.format('uuid', function (gen, schema) {
  return uuid()
})

lab.experiment('`User` resource tests', function () {
  let server, schema

  // Start the server and load the schema before tests
  lab.before((done) => {
    console.log('Composing server')
    function loadSchema (callback) {
      parser.dereference(Path.resolve(__dirname, '../server/public/schema/user.json'), callback)
    }

    composeServer(function (err, svr) {
      if (err) {
        return done(err)
      }

      console.log('Server composed')
      server = svr
      loadSchema(function (err, result) {
        if (err) {
          return done(err)
        }

        schema = result
        // console.log(schema)
        server.initialize(done)
      })
    })
  })

  // Stop the server after tests
  lab.after((done) => {
    console.log('Stopping server')
    server.stop(done)
  })

  // GET /user/{id}
  function testGETUser (id, done) {
    console.log('GET /user/{id} returns 200 OK')
    const options = {
      method: 'GET',
      url: '/user/' + id
    }

    server.select('api').inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)

      const link = schema.links.find(l => l.method === 'GET' && l.href === '/user/{#/properties/id}')
      Code.expect(link).to.exist()
      const validate = validator(link.targetSchema)
      const valid = validate(response.result)
      Code.expect(valid).to.be.true()
      done()
    })
  }

  // PUT /user/{id}
  function testPUTUser (user, done) {
    console.log('PUT /user/{id} returns 200 OK')
    const link = schema.links.find(l => l.method === 'PUT' && l.href === '/user/{#/properties/id}')
    Code.expect(link).to.exist()

    const payload = jsf({
      required: link.schema.required,
      properties: link.schema.properties,
      additionalProperties: link.schema.additionalProperties
    })

    const options = {
      method: 'PUT',
      url: '/user/' + user.id,
      payload: payload
    }

    server.select('api').inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.result).to.be.an.object()
      const result = response.result
      Code.expect(result.age).to.equal(payload.age)
      Code.expect(result.name).to.equal(payload.name)

      const validate = validator(link.targetSchema)
      const valid = validate(result)
      Code.expect(valid).to.be.true()
      done()
    })
  }

  // DELETE /user/{id}
  function testDELETEUser (user, done) {
    console.log('DELETE /user/{id} returns 200 OK')
    const link = schema.links.find(l => l.method === 'DELETE' && l.href === '/user/{#/properties/id}')
    Code.expect(link).to.exist()

    const options = {
      method: 'DELETE',
      url: '/user/' + user.id
    }

    server.select('api').inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.result).to.be.an.object().and.have.length(1)
      Code.expect(response.result.deleted).to.exist()

      const validate = validator(link.targetSchema)
      const valid = validate(response.result.deleted)
      Code.expect(valid).to.be.true()
      done()
    })
  }

  // GET /user
  lab.test('GET /user returns 200 OK', function (done) {
    const options = {
      method: 'GET',
      url: '/user'
    }

    server.select('api').inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      Code.expect(response.result).to.be.an.array().and.have.length(10)

      const link = schema.links.find(l => l.method === 'GET' && l.href === '/user')

      const validate = validator(link.targetSchema)
      const valid = validate(response.result)
      Code.expect(valid).to.be.true()

      testGETUser(response.result[0].id, function () {
        testPUTUser(response.result[4], done)
      })
    })
  })

  // GET /user/{id}
  lab.test('GET /user/{id} returns 400 Bad Request', function (done) {
    const options = {
      method: 'GET',
      url: '/user/not-a-valid-id'
    }

    server.select('api').inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(400)
      Code.expect(response.result.details).to.be.an.array().and.have.length(1)
      Code.expect(response.result.message).to.exist().and.equal('Validation Error - Path Params')
      Code.expect(response.result.details[0].message).to.exist().and.equal('must be uuid format')
      done()
    })
  })

  // POST /user
  lab.test('POST /user returns 400 Bad Request', function (done) {
    const options = {
      method: 'POST',
      url: '/user',
      payload: {}
    }

    server.select('api').inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(400)
      Code.expect(response.result.details).to.be.an.array().and.have.length(3)
      Code.expect(response.result.message).to.exist().and.equal('Validation Error - Payload')
      Code.expect(response.result.details[0].field).to.exist().and.equal('data.name')
      Code.expect(response.result.details[0].message).to.exist().and.equal('is required')
      Code.expect(response.result.details[1].field).to.exist().and.equal('data.age')
      Code.expect(response.result.details[1].message).to.exist().and.equal('is required')
      Code.expect(response.result.details[2].field).to.exist().and.equal('data.isProtected')
      Code.expect(response.result.details[2].message).to.exist().and.equal('is required')
      done()
    })
  })

  // POST /user
  lab.test('POST /user returns 400 Bad Request', function (done) {
    const options = {
      method: 'POST',
      url: '/user',
      payload: {
        name: 'valid name',
        isProtected: true,
        age: 1234 // max is 120
      }
    }

    // So this should fail
    server.select('api').inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(400)
      Code.expect(response.result.details).to.be.an.array().and.have.length(1)
      Code.expect(response.result.message).to.exist().and.equal('Validation Error - Payload')
      Code.expect(response.result.details[0].field).to.exist().and.equal('data.age')
      Code.expect(response.result.details[0].message).to.exist().and.equal('is more than maximum')
      done()
    })
  })

  // DELETE /user/{id}
  lab.test('DELETE /user/{id} returns 400 Bad Request', function (done) {
    const options = {
      method: 'DELETE',
      url: '/user/not-a-valid-id'
    }

    server.select('api').inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(400)
      Code.expect(response.result.details).to.be.an.array().and.have.length(1)
      Code.expect(response.result.message).to.exist().and.equal('Validation Error - Path Params')
      Code.expect(response.result.details[0].message).to.exist().and.equal('must be uuid format')
      done()
    })
  })

  // PUT /user/{id}
  lab.test('PUT /user/{id} returns 400 Bad Request', function (done) {
    const options = {
      method: 'PUT',
      url: '/user/not-a-valid-id'
    }

    server.select('api').inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(400)
      Code.expect(response.result.details).to.be.an.array().and.have.length(1)
      Code.expect(response.result.message).to.exist().and.equal('Validation Error - Path Params')
      Code.expect(response.result.details[0].message).to.exist().and.equal('must be uuid format')
      done()
    })
  })

  // POST /user
  lab.test('POST /user returns 200 OK', function (done) {
    const link = schema.links.find(l => l.method === 'POST' && l.href === '/user')
    Code.expect(link).to.exist()

    const payload = jsf(link.schema)
    const options = {
      method: 'POST',
      url: '/user',
      payload: payload
    }

    server.select('api').inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(200)
      const validate = validator(schema)
      const valid = validate(response.result)
      Code.expect(valid).to.be.true()

      testDELETEUser(response.result, done)
    })
  })
})
