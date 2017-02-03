/* global App */

const superviews = require('superviews.js')
const Freezer = require('superviews.js/client/freezer')
const jsonSchemaModel = require('json-schema-js-gui-model')
const UriTemplate = require('uri-templates')
const parseUri = require('jpi-uri-template')
const validator = require('is-my-json-valid')
const config = require('../config')
const view = require('./control.html')
const Links = require('../links')
const GuiModelMapper = jsonSchemaModel.GuiModelMapper
const mapper = new GuiModelMapper()

const Symbols = {
  SCHEMA: Symbol('schema'),
  CONTROLS: Symbol('controls')
}

class Control extends superviews(window.HTMLElement, view) {
  get data () {
    return this.state.data
  }

  get schema () {
    return this[Symbols.SCHEMA]
  }

  set schema (value) {
    this[Symbols.SCHEMA] = value

    this[Symbols.CONTROLS] = {
      controls: Links.getControls(value),
      staticControls: Links.getStaticControls(value),
      actions: Links.getActions(value),
      links: Links.getLinks(value)
    }

    this.state.set('loaded', true)
  }

  get controls () {
    return this[Symbols.CONTROLS]
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
              console.error(result)
            }
          })
        })
        .catch(err => {
          console.error('There has been a problem with your fetch operation: ' + err.message)
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
    const schema = this.schema

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
            console.error(result)
          }
        })
      })
      .catch(err => {
        console.error('There has been a problem with your fetch operation: ' + err.message)
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
      return console.error(this.form.validate.errors)
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
            console.error(result)
          }
        })
      })
      .catch(err => {
        console.error('There has been a problem with your fetch operation: ' + err.message)
      })
  }

  getDisplayProps () {
    const displayProps = {}
    for (let key in this.schema.properties) {
      let prop = this.schema.properties[key]
      if (prop.type !== 'object' && prop.type !== 'array') {
        displayProps[key] = prop
      }
    }
    return displayProps
  }

  getDisplayLinks () {
    const displayLinks = {}
    for (let key in this.schema.link) {
      let prop = this.schema.properties[key]
      if (prop.type !== 'object' && prop.type !== 'array') {
        displayProps[key] = prop
      }
    }
    return displayProps
  }

  getHref (link, data) {
    let parsed = parseUri(link.href, this.schema)
    if (data) {
      var tpl = new UriTemplate(parsed.path)
      return tpl.fill(data)
    }
    return parsed.path
  }

  // get model () {
  //   const output = mapper.mapToGuiModel(this.schema)
  //   return output
  // }
}

window.customElements.define('x-control', Control)
