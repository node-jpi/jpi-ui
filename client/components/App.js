require('./schema')

const superviews = require('superviews.js')
const Controller = superviews.Controller
const Freezer = superviews.Freezer
const logger = require('../logger')
const view = require('./app.html')
const loadEntities = [
  '/schema/user.json',
  '/schema/tweet.json'
].map(function (url) {
  const parser = new window.$RefParser()
  return parser.dereference(url)
})

class AppController extends Controller {
  constructor (el, view, propsSchema, attrsSchema) {
    super(el, view, propsSchema, attrsSchema, {
      isNavActive: false,
      activeSchemaId: null,
      schemas: []
    })
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

  findSchema (id) {
    return this.props.schemas.find(item => item.id === id)
  }
}

const propsSchema = {
  schemas: { type: 'object' }
}

class App extends superviews(window.HTMLElement, view, AppController, propsSchema) {
  connectedCallback () {
    Promise.all(loadEntities)
      .then(result => {
        this.schemas = App.schemas = result
        this.controller.state.set('isLoaded', true)
      })
      .catch(function (err) {
        logger.error(err)
      })
  }
}

window.customElements.define('x-app', App)

App.baseUri = 'http://mbp.home:3003'
App.state = new Freezer({})

window.App = App
