module.exports = {
  resources: {
    user: {
      updateDetails: {
        prepareData: function (link, data) {
          return {
            name: data.name,
            age: data.age,
            isProtected: data.isProtected
          }
        }
      },
      updateShippingAddress: {
        prepareData: function (link, data) {
          return data.shipTo || {}
        }
      }
    }
  }
}
