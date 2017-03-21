const superviews = require('superviews.js')
const Controller = superviews.Controller
const jsonSchemaModel = require('json-schema-js-gui-model')
const GuiModelMapper = jsonSchemaModel.GuiModelMapper
const mapper = new GuiModelMapper()
const objectPath = require('object-path')
const view = require('./form.html')
const itemView = require('./formitem.html')

class FormController extends Controller {
  constructor (el, view, propsSchema, attrsSchema) {
    super(el, view, propsSchema, attrsSchema)
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
    return this.props.form.data
  }

  set data (value) {
    this.props.form.data = value
  }

  get schema () {
    return this.props.form.link.schema
  }

  getModel () {
    const output = mapper.mapToGuiModel(this.schema)
    return output
  }
}

const propsSchema = {
  form: { type: 'object' }
}

class Form extends superviews(window.HTMLElement, view, FormController, propsSchema) {
}

window.customElements.define('x-form', Form)
