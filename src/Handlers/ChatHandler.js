class StateHandler {
  constructor(app) {
    this.app = app
  }

  registerEvents(bot) {
    this.bot = bot

    this.bot.on('message', (...args) => this.onMessage(...args))
  }

  onMessage(event) {
    const message = event.toString().trim()

    if (this.isLobbyJoinMessage(message)) {
      this.app.log.client('Sending Minecraft client to limbo')
      return this.bot.chat('/ac §')
    }

    if (this.isPartyMessage(message)) {
      return this.app.partyHandler.onMessage(message)
    }
  }

  isLobbyJoinMessage(message) {
    return (message.endsWith(' the lobby!') || message.endsWith(' the lobby! <<<')) && message.includes('[MVP+')
  }

  isPartyMessage(message) {
    return message.includes('party')
  }
}

module.exports = StateHandler
