const axios = require('axios')

class StateHandler {
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
    console.log(message)

    if (this.isLobbyJoinMessage(message)) {
      this.app.log.client('Sending Minecraft client to limbo')
      return this.bot.chat('/ac §')
    }

    if (this.isInvite(message)) {
      let inviter = message.split(" ")[1]
      if (inviter === "has") inviter = message.split(" ")[0].replace(/-*\n/g, '')

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
        if (!this.active) { this.dequeue() }
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
      return this.active = false
    }

    this.active = true
    let activeUser = this.queue.shift()
    setTimeout(() => {
      this.app.log.party(`Accepting invite from ${activeUser}`)
      return this.bot.chat(`/p accept ${activeUser}`)
    }, 100)
  }

  fetchWhitelist() {
    switch (this.app.config.fragruns.mode) {
      case 'guild':
        this.app.log.info(`Getting players from guild: ${this.app.config.fragruns.input}`)
        this.getGuildMembers(this.app.config.fragruns.input).then(members => {
          this.app.log.info(`Fetched ${members.length} players from guild: ${this.app.config.fragruns.input}`)
          this.whitelist = members
          this.whitelistEnabled = true
        }).catch((e) => {
          this.app.log.warn(`${e} - Fragbot mode defaulting to public`)
          this.whitelistEnabled = false
        })
        break
      case 'friend':
      case 'friends':
        this.app.log.info(`Getting players from ${this.app.config.fragruns.input}'s friends list`)
        this.getFriendsList(this.app.config.fragruns.input).then(members => {
          this.app.log.info(`Fetched ${members.length} players from ${this.app.config.fragruns.input}'s friends list!`)
          this.whitelist = members
          this.whitelistEnabled = true
        }).catch((e) => {
          this.app.log.warn(`${e} - Fragbot mode defaulting to public`)
          this.whitelistEnabled = false
        })
        break
      case 'users':
      case 'whitelist':
        this.app.log.info(`Accepting party invites from: ${this.app.config.fragruns.input.join(', ')}`)
        this.whitelist = this.app.config.fragruns.input
        this.whitelistEnabled = true
        break
      case 'solo':
        this.app.log.info(`Only accepting party invites from ${this.app.config.fragruns.input} and never leaving`)
        this.whitelist = [this.app.config.fragruns.input]
        this.whitelistEnabled = true
        break
      default:
        this.app.log.info(`Accepting party invites from everyone`)
        this.whitelistEnabled = false
        break
    }
  }

  getGuildMembers(guildname) {
    return new Promise((resolve, reject) => {
      axios.get('https://api.hypixel.net/guild', { params: { name: guildname, key: this.app.config.apiKey } }).then(async hypixelRes => {
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
        axios.get('https://api.hypixel.net/friends', { params: { uuid: uuidRes.data.id, key: this.app.config.apiKey } }).then(async hypixelRes => {
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
    return message.includes("has invited you to join their party!") && message.includes("You have 60 seconds to accept. Click here to join!") && !message.includes(':')
  }

  isPartyJoinMessage(message) {
    return message.includes("You have joined ") && message.includes("'s party!") && !message.includes(':')
  }

  isPartyLeaveMessage(message) {
    return message.includes('You left the party.') && !message.includes(':')
  }

  isPartyFailMessage(message) {
    return (message.includes('That party has been disbanded.') || message.includes(`You don't have an invite to that player's party.`) || message.includes(`The party was disbanded`)) && !message.includes(':')
  }

  isAlreadyInPartyMessage(message) {
    return message.includes('You are already in a party! Leave it to join another one') && !message.includes(':')
  }
}

module.exports = StateHandler
