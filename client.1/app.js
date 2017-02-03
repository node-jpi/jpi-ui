/* global React JSONSchemaForm */

// const ReactBSTable = require('react-bootstrap-table')
const parseUri = require('jpi-uri-template')
const baseUri = 'http://localhost:3003'
// const BootstrapTable = ReactBSTable.BootstrapTable
// const TableHeaderColumn = ReactBSTable.TableHeaderColumn

const loadEntities = [
  '/schema/user.json'
].map(function (url) {
  const parser = new window.$RefParser()
  return parser.dereference(url)
})

class App extends React.Component {
  constructor (props) {
    super(props)
    this.schema = props.schema
    this.model = props.model
    this.state = {}
    this.fetch()
  }

  fetch () {
    Promise.all(loadEntities)
      .then(result => {
        console.log(result)
        this.setState({
          schema: result
        })
      })
      .catch(function (err) {
        console.log(err)
      })
  }

  render () {
    const self = this
    const schema = this.state.schema
    const active = this.state.active
    const activeSchema = active && active.schema
    const activeData = active && active.data

    function List (props) {
      const items = props.data
      return (
        <table className='table table-striped tabler-bordered'>
          <thead>
            <tr><th>Id</th><th>Name</th></tr>
          </thead>
          <tbody>
            {items.map(item => {
              return (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )
    }

    function getControls (schema) {
      const links = schema.links

      const controls = {
        find: links.find(item => {
          return item.method === 'GET' && parseUri(item.href, schema).matches.length === 0
        }),
        get: links.find(item => {
          return item.method === 'GET' && parseUri(item.href, schema).matches.length === 1
        }),
        post: links.find(item => {
          return item.method === 'POST' && parseUri(item.href, schema).matches.length === 0
        }),
        put: links.find(item => {
          return item.method !== 'PUT' && parseUri(item.href, schema).matches.length === 1
        }),
        itemLinks: links.filter(item => {
          // ['POST', 'PUT', 'PATCH'].indexOf(item.method) > -1 &&
          return parseUri(item.href, schema).matches.length === 1
        })
      }

      return controls
    }

    function onClickResource (e, schema) {
      e.preventDefault()
      const controls = getControls(schema)
      window.fetch(baseUri + controls.find.href)
        .then(response => {
          response.json().then(items => {
            console.log(items)
            self.setState({
              active: {
                schema: schema,
                controls: controls,
                data: items
              }
            })
          })
        })
        .catch(err => {
          console.log('There has been a problem with your fetch operation: ' + err.message)
        })
    }

    return (
      <main>
        <nav className='navbar navbar-inverse navbar-fixed-top'>
          <div className='container-fluid'>
            <div className='navbar-header'>
              <button
                type='button'
                className='navbar-toggle collapsed'
                data-toggle='collapse'
                data-target='#navbar'
                aria-expanded='false'
                aria-controls='navbar'>
                <span className='sr-only'>Toggle navigation</span>
                <span className='icon-bar' />
                <span className='icon-bar' />
                <span className='icon-bar' />
              </button>
              <a className='navbar-brand' href='#'>Project name</a>
            </div>
            <div id='navbar' className='navbar-collapse collapse'>
              <ul className='nav navbar-nav navbar-right'>
                <li>
                  <a href='#'>Dashboard</a>
                </li>
                <li>
                  <a href='#'>Settings</a>
                </li>
                <li>
                  <a href='#'>Profile</a>
                </li>
                <li>
                  <a href='#'>Help</a>
                </li>
              </ul>
              <form className='navbar-form navbar-right'>
                <input type='text' className='form-control' placeholder='Search...' />
              </form>
            </div>
          </div>
        </nav>
        <div className='container-fluid'>
          <div className='row'>
            <div className='col-sm-3 col-md-2 sidebar'>
              <div id='app' />
              <ul className='nav nav-sidebar'>
                {
                  schema && schema.map(s => (
                    <li key='{s.id}'
                      onClick={(e) => onClickResource(e, s)}
                      className={s === activeSchema && 'active'}
                      title={s.description}>
                      <a href='#'>{s.title}</a>
                    </li>
                  ))
                }
              </ul>
            </div>
            {activeSchema && (
              <div className='col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main'>
                <h1 className='page-header'>{activeSchema.title}</h1>
                <h2 className='sub-header'>{activeSchema.description}</h2>
                <div className='row' />
                <div id='form' />
                {activeData && (
                  <List data={activeData} />
                  // <BootstrapTable data={activeData} striped hover>
                  //   <TableHeaderColumn dataField='id' isKey={true} dataAlign="center" dataSort={true}>ID</TableHeaderColumn>
                  //   <TableHeaderColumn dataField='name' dataSort={true}>Name</TableHeaderColumn>
                  //   <TableHeaderColumn dataField='age'>Age</TableHeaderColumn>
                  // </BootstrapTable>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    )
  }
}

module.exports = App
