class StateHandler {
  constructor(app) {
    this.app = app
    this.loginAttempts = 0
    this.exactDelay = 0
  }

  registerEvents(bot) {
    this.bot = bot

    this.bot.on('login', (...args) => this.onLogin(...args))
    this.bot.on('end', (...args) => this.onEnd(...args))
    this.bot.on('kicked', (...args) => this.onKicked(...args))
    this.bot.on('spawn', (...args) => this.onSpawn(...args))
    this.bot.on('error', (...args) => this.onError(...args))
  }

  onLogin() {
    this.app.log.client('Ready, logged in as ' + this.bot.username)

    this.loginAttempts = 0
    this.exactDelay = 0
  }

  onEnd() {
    let loginDelay = this.exactDelay
    if (loginDelay == 0) {
      loginDelay = (this.loginAttempts + 1) * 5000

      if (loginDelay > 60000) {
        loginDelay = 60000
      }
    }

    this.app.log.warn(`Minecraft bot disconnected from server, attempting reconnect in ${loginDelay / 1000} seconds`)

    setTimeout(() => this.app.start(), loginDelay)
  }

  onKicked(reason) {
    this.app.log.warn(`Minecraft bot was kicked from server for "${reason}"`)

    this.loginAttempts++
  }

  onSpawn() {
    this.app.log.client('Sending Minecraft client to limbo')
    this.bot.chat('/ac §')
  }

  onError(error) {
    if (this.isConnectionResetError(error)) {
      return
    }

    if (this.isConnectionRefusedError(error)) {
      return this.app.log.warn('Connection refused while attempting to login via the Minecraft client')
    }

    return this.app.log.warn(error)
  }

  isConnectionResetError(error) {
    return error.hasOwnProperty('code') && error.code == 'ECONNRESET'
  }

  isConnectionRefusedError(error) {
    return error.hasOwnProperty('code') && error.code == 'ECONNREFUSED'
  }
}

module.exports = StateHandler
