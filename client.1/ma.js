import React from 'react'
// const JSONSchemaForm = require('react-jsonschema-form')
// const Form = JSONSchemaForm.default
import RaisedButton from 'material-ui/RaisedButton'
import Dialog from 'material-ui/Dialog'
import { deepOrange500 } from 'material-ui/styles/colors'
import FlatButton from 'material-ui/FlatButton'
import MuiTextField from 'material-ui/TextField'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
// const SchemaForm = from 'react-schema-form').SchemaForm
const Component = React.Component
// const AppNavDrawer = from './components/AppNavDrawer'

import { GuiModelMapper, GuiModel, JsonSchema } from 'json-schema-js-gui-model'
 
const mapper = new GuiModelMapper()

const uiSchema = {
  "name": {
    "ui:widget": "password",
    "ui:help": "Hint: Make it strong!"
  }
}

const CustomText = function (props) {
  let type = 'text'
  if (props.schema) {
    if (props.schema.type === 'integer' || props.schema.type === 'number') {
      type = 'number'
    }
  }

  const onChange = props.onChange && ((e, value) => props.onChange(value))

  return (
    <MuiTextField
      type={type}
      name={props.id}
      id={props.id}
      onChange={onChange}
      floatingLabelText={props.label}
      hintText={props.options.help} />
  )
}

const CustomPassword = function (props) {
  const onChange = props.onChange && ((e, value) => props.onChange(value))

  return (
    <MuiTextField
      type='password'
      id={props.id}
      name={props.id}
      onChange={onChange}
      floatingLabelText={props.label}
      hintText={props.options.help} />
  )
}

const widgets = {
  TextWidget: CustomText,
  PasswordWidget: CustomPassword
}

const styles = {
  container: {
    textAlign: 'center',
    paddingTop: 200
  }
}

const muiTheme = getMuiTheme({
  palette: {
    accent1Color: deepOrange500
  }
})

const loadEntities = [
  '/schema/user.json'
].map(function (url) {
  const parser = new window.$RefParser()
  return parser.dereference(url)
})

class Main extends Component {
  constructor (props, context) {
    super(props, context)

    this.handleRequestClose = this.handleRequestClose.bind(this)
    this.handleTouchTap = this.handleTouchTap.bind(this)

    this.state = {
      open: false
    }

    Promise.all(loadEntities)
      .then(result => {
        console.log(result)

        const input = result[0]
        const output = mapper.mapToGuiModel(input)
        console.log(output)
        console.log(mapper.mapToGuiModel(result[0].links[1].schema))

        this.setState({
          schema: result[0].links[1].schema
        })
      })
      .catch(function (err) {
        console.log(err)
      })
  }

  loadForm (link, item) {
    let data = item
    // if (data && link.id && config.resources[schema.id][link.id]) {
    //   let prepareData = config.resources[schema.id][link.id].prepareData
    //   if (prepareData) {
    //     data = prepareData(link, data)
    //   }
    // }

    // if (item) {
    //   delete item._id
    // }

    let uiSchema = {
      id: {
        'ui:widget': 'hidden'
      }
    }

    ReactDOM.render((
      <Form
        method={link.method}
        action={link.href}
        schema={link.schema}
        uiSchema={uiSchema}
        formData={data}
        onSubmit={(form) => onSubmit(form, item, link)}
        onChange={() => log('changed')}
        // onSubmit={() => submitForm.apply(this, arguments)}
        onError={() => log('errors')} />
      ), document.getElementById('form'))
  }

  handleRequestClose () {
    this.setState({
      open: false
    })
  }

  handleTouchTap () {
    this.setState({
      open: true
    })
  }

  render () {
    const standardActions = (
      <FlatButton label='Ok' primary onTouchTap={this.handleRequestClose} />
    )
// {this.state.schema && <SchemaForm schema={this.state.schema} />}
//           {this.state.schema && <Form schema={this.state.schema} widgets={widgets} uiSchema={uiSchema} />}
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div style={styles.container}>
          <Dialog
            open={this.state.open}
            title='Super Secret Password'
            actions={standardActions}
            onRequestClose={this.handleRequestClose}>
            1-2-3-4-5
          </Dialog>
          <h1>Material-UI</h1>
          <h2>example project</h2>
          <button onClick={this.handleTouchTap}>Click</button>
        </div>
      </MuiThemeProvider>
    )
  }
}

module.exports = Main
