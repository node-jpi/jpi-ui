module.exports = {
  resources: {
    user: {
      updateShippingAddress: {
        prepareData: function (link, data) {
          return data.shipTo
        }
      }
    }
  }
}
