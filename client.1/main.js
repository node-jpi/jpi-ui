import React from 'react'
// const injectTapEventPlugin = require('react-tap-event-plugin')
import injectTapEventPlugin from 'react-tap-event-plugin'
// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin()

import ReactDOM from 'react-dom'

const Main = require('./ma')

ReactDOM.render(<Main />, document.getElementById('app'))
