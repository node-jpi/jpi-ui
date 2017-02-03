const App = require('./app')

ReactDOM.render((
  <App />
  ), document.getElementById('app'))

// /* global React ReactDOM JSONSchemaForm */
// const Form = JSONSchemaForm.default
// // const schema = require('../server/api.json').definitions.CreatePetBody
// const UriTemplate = require('uri-templates')
// const parseUri = require('jpi-uri-template')
// const config = require('./config')

// const log = console.log.bind(console)
// const baseUri = 'http://localhost:3003'

// const MyCustomWidget = (props) => {
//   return (
//     <input type='text'
//       className='custom'
//       value={props.value}
//       required={props.required}
//       onChange={(event) => props.onChange(event.target.value)} />
//   )
// }

// const widgets = {
//   myCustomWidget: MyCustomWidget
// }

// const uiTimeInputWidget = (props) => {
//   return (
//     <input
//       type='time'
//       className={props.classNames}
//       value={props.value}
//       required={props.required}
//       onChange={(event) => props.onChange(event.target.value)} />
//   )
// }

// const uiSchema = {
//   'integer': {
//     'ui:widget': 'updown'
//   },
//   'time': {
//     'ui:widget': uiTimeInputWidget
//   },
//   obj: {
//     'time': {
//       'ui:widget': uiTimeInputWidget
//     }
//   }
// }

// const loadEntities = [
//   '/schema/user.json'
// ].map(function (url) {
//   const parser = new window.$RefParser()
//   return parser.dereference(url)
// })

// // const parser = new window.$RefParser()
// // parser.dereference('http://localhost:3002/public/static/schema/routes/blog.json', function (err, result) {
// //   console.log(err, result)
// // })

// const formData = {
//   'billing_address': {
//     'street_address': '21, Jump Street',
//     'city': 'Boston',
//     'state': 'Neverland'
//   },
//   'shipping_address': {
//     'street_address': '221B, Baker Street',
//     'city': 'London',
//     'state': 'N/A'
//   }
// }

// class Table extends React.Component {
//   constructor (props) {
//     super(props)
//     this.schema = props.schema
//     this.model = props.model
//     this.state = {}
//   }

//   render () {
//     var isSimple = !('properties' in this.model) || !('definitions' in this.model)

//     return (
//       <div>
//         {this.model.title}
//         <input type='text' value={this.props.name} />
//         {isSimple
//            ? <Property name={this.props.name} model={this.model} meta={this.meta} />
//            : <Schema model={this.model} meta={this.meta} />}
//       </div>
//     )
//   }
// }

// class App extends React.Component {
//   constructor (props) {
//     super(props)
//     this.schema = props.schema
//     this.model = props.model
//     this.state = {}
//     this.fetch()
//   }

//   fetch () {
//     Promise.all(loadEntities)
//       .then(result => {
//         console.log(result)
//         this.setState({
//           schema: result
//         })
//       })
//       .catch(function (err) {
//         console.log(err)
//       })
//   }

//   render () {
//     function Schema (props) {
//       const schema = props.schema
//       const links = schema.links

//       const ctrl = {
//         find: links.find(item => {
//           return item.method === 'GET' && parseUri(item.href, schema).matches.length === 0
//         }),
//         get: links.find(item => {
//           return item.method === 'GET' && parseUri(item.href, schema).matches.length === 1
//         }),
//         post: links.find(item => {
//           return item.method === 'POST' && parseUri(item.href, schema).matches.length === 0
//         }),
//         put: links.find(item => {
//           return item.method !== 'PUT' && parseUri(item.href, schema).matches.length === 1
//         }),
//         itemLinks: links.filter(item => {
//           // ['POST', 'PUT', 'PATCH'].indexOf(item.method) > -1 &&
//           return parseUri(item.href, schema).matches.length === 1
//         })
//       }

//       function genKey (link) {
//         return link.method + getPath(link)
//       }

//       function getPath (link, data) {
//         let parsed = parseUri(link.href, schema)
//         if (data) {
//           var tpl = new UriTemplate(parsed.path)
//           return tpl.fill(data)
//         }
//         return parsed.path
//       }

//       function loadItem (item, link) {
//         console.log('')
//         loadForm(link, item)
//       }

//       function loadData (link) {
//         window.fetch(baseUri + link.href)
//           .then(response => {
//             response.json().then(items => {
//               console.log(items)
//               ReactDOM.render((
//                 <ul>
//                   {items.map(item => {
//                     // let href = getPath(ctrl.get, item)
//                     return <li key={item.id}>
//                       {item.id}
//                       { ctrl.itemLinks.map(link => {
//                         return (
//                           <a style={{ padding: '0 4px' }} href='#' onClick={(e) => { e.preventDefault(); loadItem(item, link) }}>{link.title}</a>
//                         )
//                       })
//                       }
//                     </li>
//                   })}
//                 </ul>
//                 ), document.getElementById('list'))
//             })
//           })
//           .catch(err => {
//             console.log('There has been a problem with your fetch operation: ' + err.message)
//           })
//       }

//       function onSubmit (form, item, link) {
//         log('sbmitted')
//         let options = {
//           method: link.method,
//           body: JSON.stringify(form.formData),
//           headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//           }
//         }

//         let path = getPath(link, item || form.formData)
//         window.fetch(baseUri + path, options)
//           .then(response => {
//             response.json().then(function (result) {
//               console.log(result)
//             })
//           })
//           .catch(err => {
//             console.log('There has been a problem with your fetch operation: ' + err.message)
//           })
//       }

//       function loadForm (link, item) {
//         let data = item
//         if (data && link.id && config.resources[schema.id][link.id]) {
//           let prepareData = config.resources[schema.id][link.id].prepareData
//           if (prepareData) {
//             data = prepareData(link, data)
//           }
//         }

//         if (item) {
//           delete item._id
//         }

//         let uiSchema = {
//           id: {
//             'ui:widget': 'hidden'
//           }
//         }

//         ReactDOM.render((
//           <Form
//             method={link.method}
//             action={link.href}
//             schema={link.schema}
//             uiSchema={uiSchema}
//             formData={data}
//             onSubmit={(form) => onSubmit(form, item, link)}
//             onChange={() => log('changed')}
//             // onSubmit={() => submitForm.apply(this, arguments)}
//             onError={() => log('errors')} />
//           ), document.getElementById('form'))
//       }

//       function Links () {
//         if (Array.isArray(schema.links) && schema.links.length > 0) {
//           let links = schema.links.filter(item => {
//             return item.method === 'GET' && parseUri(item.href, schema).matches.length === 0
//           })
//           return (
//             <div>
//               {
//                 links.map(link => {
//                   return (
//                     <div key={genKey(link)}>
//                       <a onClick={(e) => { e.preventDefault(); loadData(link) }} href={getPath(link)}>{link.method} {link.href} ({link.description})</a>
//                     </div>
//                   )
//                 })
//               }
//             </div>
//           )
//         } else {
//           return <div>No links found</div>
//         }
//       }

//       function Actions () {
//         if (Array.isArray(schema.links) && schema.links.length > 0) {
//           let actions = schema.links.filter(item => {
//             return item.method !== 'GET' && parseUri(item.href, schema).matches.length === 0
//           })
//           return (
//             <div>
//               {
//                 actions.map(link => {
//                   return (
//                     <div key={genKey(link)}>
//                       <button onClick={(e) => { e.preventDefault(); loadForm(link) }}>{link.description}</button>
//                     </div>
//                   )
//                 })
//               }
//             </div>
//           )
//         } else {
//           return <div>No actions found</div>
//         }
//       }

//       if (schema) {
//         return (
//           <div>
//             <span>{schema.description}</span>
//             <Links />
//             <Actions />
//           </div>
//         )
//       }
//     }

//     return (
//       <div>
//         {this.state.schema && this.state.schema.map(item => {
//           return <Schema key={item.description} schema={item} />
//         })}
//       </div>
//     )
//   }
// }

// ReactDOM.render((
//   <App />
//   ), document.getElementById('app'))

