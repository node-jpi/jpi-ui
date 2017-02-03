const parseUri = require('jpi-uri-template')

module.exports = {
  getControls (schema) {
    const links = schema.links

    const controls = {
      find: links.find(item => {
        return item.method === 'GET' && parseUri(item.href, schema).matches.length === 0
      }),
      get: links.find(item => {
        return item.method === 'GET' && parseUri(item.href, schema).matches.length === 1
      }),
      create: links.find(item => {
        return item.method === 'POST' && parseUri(item.href, schema).matches.length === 0
      }),
      update: links.find(item => {
        return item.method === 'PUT' && parseUri(item.href, schema).matches.length === 1
      })
    }

    return controls
  },

  getStaticControls (schema) {
    const links = schema.links
    return links.filter(item => {
      return parseUri(item.href, schema).matches.length === 0
    })
  },

  getLinks (schema) {
    const links = schema.links
    return links.filter(item => {
      return item.method === 'GET' && parseUri(item.href, schema).matches.length > 0
    })
  },

  getActions (schema) {
    const links = schema.links
    return links.filter(item => {
      return item.method !== 'GET' && parseUri(item.href, schema).matches.length > 0
    })
  }
}
