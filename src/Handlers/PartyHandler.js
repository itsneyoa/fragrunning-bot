let axios = require('axios')

class PartyHandler {
  constructor(app) {
    this.app = app

    this.queue = []
    this.active = false
    this.whitelist = null

    setTimeout(() => {
      this.fetchWhitelist()
    }, 900000)
  }

  onMessage(message) {
    console.log(message)

    if(this.isInvite(message)) {
      
    }

    this.inviter = message.split(" ")[1]
    if (this.inviter === "has") this.inviter = message.split(" ")[0].replace("-----------------------------\n", "")

    let user = message.split(' ')[4]

    if (!this.whitelist.includes(user) && !this.whitelist == null) {
      return this.app.log.party(`Not accepting invite from ${user} as they aren't on the whitelist`)
    }
  }

  looper() {
    if (!this.queue.length) return this.active = false;
    this.active = true;

    let user = queue.shift()

    this.app.log.party(`Joining ${user}'s party`)
    this.app.bot.chat(`/p accept ${user}`)
    setTimeout(() => {
      this.app.log.party(`Leaving ${user}'s party`)
      this.app.bot.chat(`/p leave ${user}`)
      setTimeout(() => {
        return looper()
      }, 100)
    }, 5000);
  }

  fetchWhitelist() {
    switch (this.app.config.fragruns.mode.toLowerCase()) {
      case 'guild':
        this.whitelist = this.getGuildMembers(this.app.config.fragruns.guildName)
        break
      case 'friend':
      case 'friends':
        this.whitelist = this.getFriendsList(this.app.config.fragruns.friendsName)
        break;
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

  getGuildMembers(guildname) {
    this.app.log.info(`Getting players from guild: ${guildname}`)
    axios.get('https://api.hypixel.net/guild', { params: { name: guildname, key: this.app.config.fragruns.apiKey } }).then(async hypixelRes => {
      if (hypixelRes.data && hypixelRes.data.guild) {
        let members = []

        await Promise.all(
          hypixelRes.data.guild.members.map(async (member) => {
            let mojangRes = await axios.get(`https://api.mojang.com/user/profiles/${member.uuid}/names`)

            members.push(mojangRes.data.pop().name)
          })
        )

        this.app.log.info(members.size + " players from guild: " + guildname + " fetched!")
        return members
      } else {
        return null
      }
    }).catch((e) => { this.app.log.warn(e); return null })
  }

  getFriendsList(username) {
    this.app.log.info(`Getting players from ${username}'s friends list`)

    axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`).then(uuidRes => {
      axios.get('https://api.hypixel.net/friends', { params: { uuid: uuidRes.data.id, key: this.app.config.fragruns.apiKey } }).then(async hypixelRes => {
        if (hypixelRes.data && hypixelRes.data.records) {
          let members = []

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

          this.app.log.info(`Fetched ${members.size} players from ${username}'s friends list!`)
          return members
        } else {
          return null
        }
      }).catch((e) => { this.app.log.warn(e); return null })
    }).catch((e) => { this.app.log.warn(e); return null })
  }
}

module.exports = PartyHandler