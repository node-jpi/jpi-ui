const superviews = require('superviews.js')
const jsonSchemaModel = require('json-schema-js-gui-model')
const GuiModelMapper = jsonSchemaModel.GuiModelMapper
const mapper = new GuiModelMapper()
const objectPath = require('object-path')
const view = require('./schema.html')
const itemView = require('./schemaitem.html')

const Symbols = {
  FORM: Symbol('schema')
}

class Schema extends superviews(window.HTMLElement, view) {
  constructor () {
    super()
    this.itemView = itemView
  }

  getValue (path) {
    return this.data && objectPath.get(this.data, path)
  }

  setValue (path, value) {
    if (this.data) {
      const data = this.data.toJS()
      objectPath.set(data, path, value)
      this.data = this.data.reset(data)
    }
  }

  get data () {
    return this.form.data
  }

  set data (value) {
    this.form.data = value
  }

  get schema () {
    return this.form.link.schema
  }

  get form () {
    return this[Symbols.FORM]
  }

  set form (value) {
    this[Symbols.FORM] = value
    this.render()
  }

  get model () {
    const output = mapper.mapToGuiModel(this.schema)
    return output
  }

  get completed () {
    return this.todos.filter(t => t.isCompleted)
  }
}

window.customElements.define('x-schema', Schema)
