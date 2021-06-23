const MinecraftManager = require('./MinecraftManager')
const config = require('../config.json')

class App {
  async register() {
    this.config = config
    this.minecraft = new MinecraftManager(this)
  }

  async connect() {
    this.minecraft.connect()
  }
}

module.exports = new App()
