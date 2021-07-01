const axios = require('axios')

class StateHandler {
  constructor(app) {
    this.app = app

    this.queue = []
    this.active = false
    this.whitelist = []
    this.whitelistEnabled = false
  }

  async registerEvents(bot) {
    this.bot = bot

    this.bot.on('message', (...args) => this.onMessage(...args))

    this.fetchWhitelist()
    setTimeout(async () => {
      this.fetchWhitelist()
    }, 900000)
  }

  onMessage(event) {
    const message = event.toString().trim()

    if (this.isLobbyJoinMessage(message)) {
      this.app.log.client('Sending Minecraft client to limbo')
      return this.bot.chat('/ac §')
    }

    if (this.isInvite(message)) {
      let inviter = message.split(" ")[1]
      if (inviter === "has") inviter = message.split(" ")[0].replace("-----------------------------\n", "")

      if (this.app.config.fragruns.blacklist.includes(inviter)) {
        return this.app.log.party(`Not accepting invite from ${inviter} as they're blacklisted`)
      }

      if (this.whitelist.includes(inviter) || !this.whitelistEnabled) {
        this.app.log.party(`Accepting party invite from ${inviter}`)
      } else {
        this.app.log.party(`Not accepting party invite from ${inviter} as they aren't on the whitelist`)
      }
    }
  }

  fetchWhitelist() {
    switch (this.app.config.fragruns.mode.toLowerCase()) {
      case 'guild':
        this.app.log.info(`Getting players from guild: ${this.app.config.fragruns.guildName}`)
        this.getGuildMembers(this.app.config.fragruns.guildName).then(members => {
          this.app.log.info(`Fetched ${members.length} players from guild: ${this.app.config.fragruns.guildName}`)
          this.whitelist = members
          this.whitelistEnabled = true
        }).catch((e) => {
          this.app.log.warn(`${e} - Fragbot mode defaulting to public`)
          this.whitelistEnabled = false
        })
        break
      case 'friend':
      case 'friends':
        this.app.log.info(`Getting players from ${this.app.config.fragruns.friendsName}'s friends list`)
        this.getFriendsList(this.app.config.fragruns.friendsName).then(members => {
          this.app.log.info(`Fetched ${members.length} players from ${username}'s friends list!`)
          this.whitelist = members
          this.whitelistEnabled = true
        }).catch((e) => {
          this.app.log.warn(`${e} - Fragbot mode defaulting to public`)
          this.whitelistEnabled = false
        })
        break
      case 'user':
      case 'username':
        this.app.log.info(`Accepting party invites from: ${this.app.config.fragruns.whitelistUsers.join(', ')}`)
        this.whitelistEnabled = true
        return this.config.fragruns.whitelistUsers
      case 'solo':
        this.app.log.info(`Only accepting party invites from ${this.app.config.fragruns.soloUser} and never leaving`)
        this.whitelistEnabled = true
        return [this.app.config.fragruns.soloUser]
      default:
        this.app.log.info(`Accepting party invites from everyone`)
        this.whitelistEnabled = false
    }
  }

  getGuildMembers(guildname) {
    return new Promise((resolve, reject) => {
      axios.get('https://api.hypixel.net/guild', { params: { name: guildname, key: this.app.config.fragruns.apiKey } }).then(async hypixelRes => {
        if (hypixelRes.data && hypixelRes.data.guild) {
          let members = []

          await Promise.all(
            hypixelRes.data.guild.members.map(async (member) => {
              let mojangRes = await axios.get(`https://api.mojang.com/user/profiles/${member.uuid}/names`)

              members.push(mojangRes.data.pop().name)
            })
          )

          resolve(members)
        } else {
          reject(`Invalid API Key or Guild ${guildname} not found`)
        }
      }).catch((e) => reject(e))
    })
  }

  getFriendsList(username) {
    return new Promise((resolve, reject) => {
      axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`).then(uuidRes => {
        axios.get('https://api.hypixel.net/friends', { params: { uuid: uuidRes.data.id, key: this.app.config.fragruns.apiKey } }).then(async hypixelRes => {
          if (hypixelRes.data && hypixelRes.data.records) {
            let members = [username]

            await Promise.all(
              hypixelRes.data.records.map(async (member) => {
                var uuid = member.uuidReceiver
                if (uuidRes.data.id == member.uuidReceiver) {
                  uuid = member.uuidSender
                }

                let mojangRes = await axios.get(`https://api.mojang.com/user/profiles/${uuid}/names`)

                members.push(mojangRes.data.pop().name)
              })
            )

            resolve(members)
          } else {
            reject(`Invalid API Key or Player ${username} not found`)
          }
        }).catch((e) => reject(e))
      }).catch((e) => reject(e))
    })
  }

  isLobbyJoinMessage(message) {
    return (message.endsWith(' the lobby!') || message.endsWith(' the lobby! <<<')) && message.includes('[MVP+')
  }

  isInvite(message) {
    return message.endsWith(" here to join!") && message.includes("has invited you to join") && !message.includes(':')
  }
}

module.exports = StateHandler
