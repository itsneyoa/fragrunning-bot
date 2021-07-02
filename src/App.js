const StateHandler = require('./Handlers/StateHandler')
const ChatHandler = require('./Handlers/ChatHandler')
const Configuration = require('./Configuration')
const mineflayer = require('mineflayer')
const Logger = require('./Logger')

class App {
  async register() {
    this.config = new Configuration()
    this.log = new Logger()

    this.stateHandler = new StateHandler(this)
    this.chatHandler = new ChatHandler(this)
  }

  start() {
    this.bot = this.createBotConnection()

    this.stateHandler.registerEvents(this.bot)
    this.chatHandler.registerEvents(this.bot)
  }

  createBotConnection() {
    return mineflayer.createBot({
      host: this.config.server.host,
      port: this.config.server.port,
      username: this.config.minecraft.username,
      password: this.config.minecraft.password,
      auth: this.config.minecraft.accountType,
      version: false
    })
  }
}

module.exports = new App()
