require('document-register-element')
require('whatwg-fetch')
require('./components/App')

window.onerror = function (error) {
  window.alert(error)
}
