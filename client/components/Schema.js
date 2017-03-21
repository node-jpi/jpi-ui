/* global App */
require('./form')

const superviews = require('superviews.js')
const Controller = superviews.Controller
const Freezer = superviews.Freezer
const UriTemplate = require('uri-templates')
const parseUri = require('jpi-uri-template')
const validator = require('is-my-json-valid')
const config = require('../config')
const Links = require('../links')
const Logger = require('../logger')
const view = require('./schema.html')

class SchemaController extends Controller {
  get data () {
    return this.state.data
  }

  getControls () {
    const schema = this.props.schema
    if (schema) {
      return {
        controls: Links.getControls(schema),
        staticControls: Links.getStaticControls(schema),
        actions: Links.getActions(schema),
        links: Links.getLinks(schema)
      }
    }
  }

  onClickStaticLink (e, link) {
    e.preventDefault()
    if (link.method === 'GET') {
      window.fetch(App.baseUri + link.href)
        .then(response => {
          response.json().then(result => {
            if (response.ok) {
              this.state.set('data', result)
            } else {
              Logger.error(result)
            }
          })
        })
        .catch(err => {
          Logger.error('There has been a problem with your fetch operation: ' + err.message)
        })
    } else {
      this.form = {
        link: link,
        data: new Freezer({}).get(),
        validate: validator(link.schema)
      }

      this.state.set('showModal', true)
    }
  }

  openModal () {
    this.state.set('showModal', true)
  }

  onClickCloseModal (e) {
    e.preventDefault()

    delete this.doc
    delete this.form

    this.state.set('showModal', false)
  }

  onClickActionLink (e, action, item) {
    e.preventDefault()

    let linkConfig
    const schema = this.props.schema

    if (schema.id && action.id && config.resources[schema.id]) {
      linkConfig = config.resources[schema.id][action.id]
    }

    let data = item.toJS()
    if (linkConfig && linkConfig.prepareData) {
      data = linkConfig.prepareData(action, data)
    }

    this.form = {
      link: action,
      item: item,
      config: linkConfig,
      data: new Freezer(data).get(),
      validate: validator(action.schema)
    }

    this.state.set('showModal', true)
  }

  onClickDisplayLink (e, link, item) {
    e.preventDefault()

    const path = this.getHref(link, item)
    window.fetch(App.baseUri + path)
      .then(response => {
        response.json().then(result => {
          if (response.ok) {
            this.doc = result
            this.state.set('showModal', true)
          } else {
            Logger.error(result)
          }
        })
      })
      .catch(err => {
        Logger.error('There has been a problem with your fetch operation: ' + err.message)
      })
  }

  onSubmit (e) {
    e.preventDefault()

    const form = this.form
    const link = form.link
    const item = form.item
    const data = form.data.toJS()

    // Validate
    if (!form.validate(data)) {
      return Logger.error(this.form.validate.errors)
    }

    const options = {
      method: link.method,
      body: JSON.stringify(data),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    }

    const path = this.getHref(link, item)
    window.fetch(App.baseUri + path, options)
      .then(response => {
        response.json().then(result => {
          if (response.ok) {
            if (this.form.item) {
              this.form.item.reset(result)
            } else if (this.data) {
              this.data.unshift(result)
            }
            delete this.form
            this.state.set('showModal', false)
          } else {
            Logger.error(result)
          }
        })
      })
      .catch(err => {
        Logger.error('There has been a problem with your fetch operation: ' + err.message)
      })
  }

  getDisplayProps () {
    const schema = this.props.schema
    const displayProps = {}
    for (let key in schema.properties) {
      let prop = schema.properties[key]
      if (prop.type !== 'object' && prop.type !== 'array') {
        displayProps[key] = prop
      }
    }
    return displayProps
  }

  getHref (link, data) {
    const schema = this.props.schema
    let parsed = parseUri(link.href, schema)
    if (data) {
      var tpl = new UriTemplate(parsed.path)
      return tpl.fill(data)
    }
    return parsed.path
  }
}

const propsSchema = {
  schema: { type: 'object' }
}

class Schema extends superviews(window.HTMLElement, view, SchemaController, propsSchema) {
}

window.customElements.define('x-schema', Schema)
