const StateHandler = require('./Handlers/StateHandler')
const ErrorHandler = require('./Handlers/ErrorHandler')
const ChatHandler = require('./Handlers/ChatHandler')
const mineflayer = require('mineflayer')

class MinecraftManager {
  constructor(app) {
    this.app = app

    this.stateHandler = new StateHandler(this)
    this.errorHandler = new ErrorHandler(this)
    this.chatHandler = new ChatHandler(this)
  }

  connect() {
    this.bot = this.createBotConnection()

    this.errorHandler.registerEvents(this.bot)
    this.stateHandler.registerEvents(this.bot)
    this.chatHandler.registerEvents(this.bot)
  }

  createBotConnection() {
    return mineflayer.createBot({
      host: this.app.config.server.host,
      port: this.app.config.server.port,
      username: this.app.config.minecraft.username,
      password: this.app.config.minecraft.password,
      auth: this.app.config.minecraft.accountType,
    })
  }
}

module.exports = MinecraftManager
