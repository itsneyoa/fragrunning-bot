class PartyHandler {
  constructor(minecraft) {
    this.minecraft = minecraft

    this.queue = []
  }

  onMessage(message) {
    console.log(message)
  }
}

module.exports = PartyHandler