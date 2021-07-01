const fs = require('fs')

class Configuration {
  properties = {
    server: {
      host: 'mc.hypixel.net'
    },
    minecraft: {
      accountType: null,
      username: null,
      password: null
    },
    fragruns: {
      mode: null,
      guildName: null,
      friendsName: null,
      whitelistUsers: null,
      soloUser: null,
      blacklist: null
    }
  }

  environmentOverrides = {
    SERVER_HOST: val => (this.properties.server.host = val),
    MINECRAFT_USERNAME: val => (this.properties.minecraft.username = val),
    MINECRAFT_PASSWORD: val => (this.properties.minecraft.password = val),
    MINECRAFT_LOBBY_HOLDER: val => (this.properties.minecraft.lobbyHolder = val),
    MINECRAFT_ACCOUNT_TYPE: val => (this.properties.minecraft.accountType = val),
    FRAGRUNS_MODE: val => (this.properties.fragruns.mode = val),
    FRAGRUNS_GUILD: val => (this.properties.fragruns.guildName = val),
    FRAGRUNS_FRIENDS: val => (this.properties.fragruns.friendsName = val),
    FRAGRUNS_USERS: val => (this.properties.fragruns.whitelistUsers = val),
    FRAGRUNS_SOLO: val => (this.properties.fragruns.soloUser = val),
    FRAGRUNS_BLACKLIST: val => (this.properties.fragruns.blacklist = val),

  }

  constructor() {
    if (fs.existsSync('config.json')) {
      this.properties = require('../config.json')
    }

    for (let environment of Object.keys(process.env)) {
      if (this.environmentOverrides.hasOwnProperty(environment)) {
        this.environmentOverrides[environment](process.env[environment])
      }
    }
  }

  get server() {
    return this.properties.server
  }

  get minecraft() {
    return this.properties.minecraft
  }

  get fragruns() {
    return this.properties.fragruns
  }
}

module.exports = Configuration