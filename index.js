'use strict'
process.title = 'Hypixel Fragrunning Bot'

const app = require('./src/App')

app
  .register()
  .then(() => {
    app.start()
  })
  .catch((e) => {
    console.error(e)
  })
