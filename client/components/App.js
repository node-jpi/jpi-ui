require('./schema')
require('./control')

const superviews = require('superviews.js')
const Freezer = require('superviews.js/client/freezer')
const view = require('./app.html')

const loadEntities = [
  '/schema/user.json',
  '/schema/tweet.json'
].map(function (url) {
  const parser = new window.$RefParser()
  return parser.dereference(url)
})

const Symbols = {
  SCHEMA: Symbol('schema'),
  SCHEMAS: Symbol('schemas')
}

class App extends superviews(window.HTMLElement, view) {
  constructor () {
    super({
      isNavActive: false,
      activeSchemaId: null,
      schemas: []
    })
  }

  // Called when the element is inserted into a document, including into a shadow tree
  connectedCallback () {
    Promise.all(loadEntities)
      .then(result => {
        this.schemas = App.schemas = result
        this.state.set('loaded', true)
      })
      .catch(function (err) {
        console.error(err)
      })
  }

  // Monitor the 'name' attribute for changes.
  static get observedAttributes () {
    return ['name']
  }

  onClickResource (e, schema) {
    e.preventDefault()
    const schemas = this.state.schemas
    if (schemas.indexOf(schema.id) < 0) {
      schemas.push(schema.id)
    }
    this.state.set('activeSchemaId', schema.id)
  }

  onClickNavToggle () {
    this.state.set('isNavActive', !this.state.isNavActive)
  }

  onClickNavTab (e, schemaId) {
    e.preventDefault()
    this.state.set('activeSchemaId', schemaId)
  }

  get schemas () {
    return this[Symbols.SCHEMAS]
  }

  set schemas (value) {
    this[Symbols.SCHEMAS] = value
  }

  findSchema (id) {
    return this.schemas.find(item => item.id === id)
  }
}

window.customElements.define('x-app', App)

App.baseUri = 'http://localhost:3003'
App.state = new Freezer({})

window.App = App
