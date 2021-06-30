class PartyHandler {
  constructor(app) {
    this.app = app

    this.queue = []
    this.active = false
    this.whitelist = null
  }

  onMessage(message) {
    console.log(message)

    let user = message.split(' ')[4] 

    if (!this.whitelist.includes(user) && !this.whitelist == null) {
      return this.app.log.party(`Not accepting invite from ${user} as they aren't on the whitelist`)
    }

    this.queue.push(user)
    if (!this.active) {
      this.looper()
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
        // fetch all guild members IGNs and store in an array
        return ['neyoa', 'serefolIUESVF']
      case 'friend':
      case 'friends':
        ['neyoa', 'serefolIUESVF']
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
    console.log(this.whitelist)
  }
}

module.exports = PartyHandler