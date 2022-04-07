const axios = require('axios')

class ChatHandler {
  constructor(app) {
    this.app = app

    this.queue = []
    this.active = false
    this.whitelist = []
    this.whitelistEnabled = false
  }

  registerEvents(bot) {
    this.bot = bot

    this.bot.on('message', (...args) => this.onMessage(...args))

    this.fetchWhitelist()
    setTimeout(() => {
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
      let inviter = message.split(' ')[1]
      if (inviter === 'has') inviter = message.split(' ')[0].replace(/-*\n/g, '')

      if (this.app.config.fragruns.blacklist && this.app.config.fragruns.blacklist.includes(inviter)) {
        return this.app.log.party(`Not adding ${inviter} to the queue as they're blacklisted`)
      }

      if (this.queue.includes(inviter)) {
        return this.app.log.party(`Ignoring ${inviter} as they are already in the queue.`)
      }

      if (this.app.config.fragruns.mode == 'solo' && this.app.config.fragruns.input == inviter) {
        return this.bot.chat(`/p accept ${inviter}`)
      }

      if (this.whitelist.includes(inviter) || !this.whitelistEnabled) {
        this.app.log.party(`Adding ${inviter} to the queue`)
        this.queue.push(inviter) // Add user to queue
        if (!this.active) {
          this.dequeue()
        }
        return
      } else {
        return this.app.log.party(`Not adding ${inviter} to the queue as they aren't on the whitelist`)
      }
    }

    if (this.isPartyJoinMessage(message) && this.app.config.fragruns.mode != 'solo') {
      let parts = message.split(' ')
      if (parts[4] == 'party!') {
        this.leader = parts[3].slice(0, -2)
      } else {
        this.leader = parts[4].slice(0, -2)
      }
      this.app.log.party(`Joined ${this.leader}'s party`)

      setTimeout(() => {
        this.app.log.party(`Leaving ${this.leader}'s party`)
        this.leader = null
        return this.bot.chat('/p leave')
      }, 5000)
    }

    if (this.isPartyLeaveMessage(message) || this.isPartyFailMessage(message)) {
      return this.dequeue()
    }

    if (this.isAlreadyInPartyMessage(message)) {
      setTimeout(() => {
        return this.bot.chat('/p leave')
      }, 100)
    }
  }

  dequeue() {
    if (!this.queue.length) {
      return (this.active = false)
    }

    this.active = true
    let activeUser = this.queue.shift()
    setTimeout(() => {
      this.app.log.party(`Accepting invite from ${activeUser}`)
      if (this.app.config.fragruns.message.length) {
        setTimeout(() => {
          this.bot.chat(`/pc ${this.app.config.fragruns.message}`)
        }, 100)
      }
      return this.bot.chat(`/p accept ${activeUser}`)
    }, 100)
  }

  async fetchWhitelist() {
    switch (this.app.config.fragruns.mode.toLowerCase()) {
      case 'guild':
        this.whitelist = await this.getGuildMembers(this.app.config.fragruns.input)
        break
      case 'friend':
      case 'friends':
        this.whitelist = await this.getFriendsList(this.app.config.fragruns.friendsName)
        break
      case 'user':
      case 'username':
        this.whitelist = this.config.fragruns.whitelistUsers
      case 'all':
      case 'everyone':
        this.whitelist = null
      default:
        this.whitelist = []
    }
  }

  async getGuildMembers(guildname) {
    const hypixel = await axios.get('https://api.hypixel.net/guild', {
      params: { name: guildname, key: this.app.config.fragruns.apiKey },
    })

    if (hypixel.status != 200) throw hypixel.statusText

    let members = []

    await Promise.all(
      hypixel.data.guild.members.map(async (member) => {
        const mojang = await axios.get(`https://api.mojang.com/user/profiles/${member.uuid}/names`)

        if (mojang.status == 200) members.push(mojang.data.pop().name)
      })
    )

    this.app.log.info(`${members.length} fetched from guild ${guildname}.`)
    return members
  }

  getFriendsList(username) {
    return new Promise((resolve, reject) => {
      axios
        .get(`https://api.mojang.com/users/profiles/minecraft/${username}`)
        .then((uuidRes) => {
          axios
            .get('https://api.hypixel.net/friends', {
              params: { uuid: uuidRes.data.id, key: this.app.config.fragruns.apiKey },
            })
            .then(async (hypixelRes) => {
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
            })
            .catch((e) => reject(e))
        })
        .catch((e) => reject(e))
    })
  }

  isLobbyJoinMessage(message) {
    return (message.endsWith(' the lobby!') || message.endsWith(' the lobby! <<<')) && message.includes('[MVP+')
  }

  isInvite(message) {
    return (
      message.includes('has invited you to join their party!') &&
      message.includes('You have 60 seconds to accept. Click here to join!') &&
      !message.includes(':')
    )
  }

  isPartyJoinMessage(message) {
    return message.includes('You have joined ') && message.includes("'s party!") && !message.includes(':')
  }

  isPartyLeaveMessage(message) {
    return message.includes('You left the party.') && !message.includes(':')
  }

  isPartyFailMessage(message) {
    return (
      (message.includes('That party has been disbanded.') ||
        message.includes(`You don't have an invite to that player's party.`) ||
        message.includes(`The party was disbanded`)) &&
      !message.includes(':')
    )
  }

  isAlreadyInPartyMessage(message) {
    return message.includes('You are already in a party! Leave it to join another one') && !message.includes(':')
  }
}

module.exports = ChatHandler
