class StateHandler {
  constructor(minecraft) {
    this.minecraft = minecraft
  }

  registerEvents(bot) {
    this.bot = bot

    this.bot.on('error', (...args) => this.onError(...args))
  }

  onError(error) {
    if (this.isConnectionResetError(error)) {
      return
    }

    if (this.isConnectionRefusedError(error)) {
      return console.log(
        'Connection refused while attempting to login via the Minecraft client'
      )
    }

    console.log(error)
  }

  isConnectionResetError(error) {
    return error.hasOwnProperty('code') && error.code == 'ECONNRESET'
  }

  isConnectionRefusedError(error) {
    return error.hasOwnProperty('code') && error.code == 'ECONNREFUSED'
  }
}

module.exports = StateHandler
