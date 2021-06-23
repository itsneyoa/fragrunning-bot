'use strict'
process.title = 'Hypixel Skyblock Fragrunning Bot'

const app = require('./src/App')

app
  .register()
  .then(() => {
    app.connect()
  })
  .catch((e) => {
    console.error(e)
  })
