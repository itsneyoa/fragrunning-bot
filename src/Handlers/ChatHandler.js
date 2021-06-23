class StateHandler {
  constructor(minecraft) {
    this.minecraft = minecraft
  }

  registerEvents(bot) {
    this.bot = bot

    this.bot.on('message', (...args) => this.onMessage(...args))
  }

  onMessage(event) {
    const message = event.toString().trim()
    console.log(message)
  }
}

module.exports = StateHandler
