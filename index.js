'use strict'
process.title = 'Hypixel Fragrunning Bot'

const app = require('./src/App')
const setup = require('./src/Setup')
const fs = require('fs')

if (!fs.existsSync(`./config.json`) || process.argv.slice(2).includes('--setup') || process.argv.slice(2).includes('-s')) {
  setup.generateConfig()
} else {
  app
    .register()
    .then(() => {
      app.start()
    })
    .catch((e) => {
      console.error(e)
    })
}
