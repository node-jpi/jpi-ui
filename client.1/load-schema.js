const loadEntities = [
  '/schema/user.json'
].map(function (url) {
  const parser = new window.$RefParser()
  return parser.dereference(url)
})

module.exports = function () {
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
