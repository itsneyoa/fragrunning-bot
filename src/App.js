const MinecraftManager = require('./MinecraftManager')
const Logger = require('./Logger')
const config = require('../config.json')

class App {
  async register() {
    this.config = config
    this.log = new Logger()
    this.minecraft = new MinecraftManager(this)
  }

  async connect() {
    this.minecraft.connect()
  }
}

module.exports = new App()
