module.exports = {
  log () {
    console.log.apply(console, arguments)
  },

  info () {
    console.info.apply(console, arguments)
  },

  error (err) {
    window.alert(err instanceof Error ? err.message : err)
  }
}
