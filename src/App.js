const StateHandler = require('./Handlers/StateHandler')
const ChatHandler = require('./Handlers/ChatHandler')
const PartyHandler = require('./Handlers/PartyHandler')
const mineflayer = require('mineflayer')
const Logger = require('./Logger')
const config = require('../config.json')

class App {
  async register() {
    this.config = config // add docker support via custom configuration file
    this.log = new Logger()

    this.stateHandler = new StateHandler(this)
    this.chatHandler = new ChatHandler(this)
    this.partyHandler = new PartyHandler(this)
  }

  async start() {
    this.bot = this.createBotConnection()

    this.stateHandler.registerEvents(this.bot)
    this.chatHandler.registerEvents(this.bot)

    this.partyHandler.fetchWhitelist()
    setTimeout(() => {
      this.partyHandler.fetchWhitelist()
    }, 900000) // refresh every 15 minutes
  }

  createBotConnection() {
    return mineflayer.createBot({
      host: this.config.server.host,
      port: this.config.server.port,
      username: this.config.minecraft.username,
      password: this.config.minecraft.password,
      auth: this.config.minecraft.accountType,
    })
  }
}

module.exports = new App()
