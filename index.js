const mineflayer = require('mineflayer');
const config = require('./config.json')

const bot = mineflayer.createBot({
  host: config.server.host,
  username: config.minecraft.username,
  password: config.minecraft.password,
  auth: config.minecraft.accountType,
});

var loginAttempts = 0;
var exactDelay = 0;

bot.on('login', () => {
  console.log(`Minecraft bot ready, logged in as ${bot.username}`)

  loginAttempts = 0;
  exactDelay = 0;
});

bot.on('spawn', () => {
  setTimeout(() => {
    sendToLimbo();
  }, 1000);
});

bot.on('end', () => {
  let loginDelay = exactDelay
  if (loginDelay == 0) {
    loginDelay = (loginAttempts + 1) * 5000
    if (loginDelay > 60000) {
      loginDelay = 60000
    }
  }
  console.log(`Minecraft bot disconnected from server, attempting reconnect in ${loginDelay / 1000} seconds`)

  setTimeout(() => bot.connect(), loginDelay);
})

bot.on('kicked', (reason) => {
  console.log(`Minecraft bot was kicked from server for "${reason}"`);
})

bot.on('message', jsonMsg => {
  const message = jsonMsg.toString();
  console.log(message)

  if (isLobbyJoinMessage(message)) {
    return sendToLimbo()
  }

  if (isPartyInviteMessage(message)) {
    this.inviter = message.split(" ")[1]
    if (this.inviter === "has") this.inviter = message.split(" ")[0].replace("-----------------------------\n", "") // Nons
    if (config.blacklist.users.includes(this.inviter)) {
      console.log("Won't accept party invite from: " + this.inviter + ", since they're on the blacklist")
      let sorryMsg = `You're on the blacklist for fragruns.`
      sorryMsg = addCharToString(sorryMsg, "⭍", 15);
      bot.chat("/msg " + this.inviter + " " + sorryMsg)
    } else {
      console.log("Accepting party invite from: " + this.inviter)
      setTimeout(() => {
        bot.chat("/p join " + this.inviter)
      }, 100)
    }
    return
  }

  if (this.inviter) {
    if (isMessageYouJoinedParty(message)) {
      console.log("Joined party from: " + this.inviter)
      this.partyLeader = this.inviter
      this.inviter = 0

      setTimeout(() => {
        console.log("Leaving party from: " + this.partyLeader)
        this.partyLeader = 0

        bot.chat("/p leave")
      }, 5000)
    } else if (isMessageYoureInParty(message)) {
      console.log("Can't join " + this.inviter + "'s party, already in a party with: " + this.partyLeader)
      let pastInviter = this.inviter
      this.inviter = 0

      let sorryMsg = "Sorry, I'm already in a party with " + (this.partyLeader ? this.partyLeader : "someone") + ", try in a bit! uwu"

      sorryMsg = addCharToString(sorryMsg, "⭍", 15);
      bot.chat("/msg " + pastInviter + " " + sorryMsg)
      setTimeout((pastInviter) => {
        if (this.inviter === pastInviter || this.partyLeader == 0) bot.chat("/p leave") // In case it gets stuck
      }, 5000)
    }
  }
})

function isLobbyJoinMessage(message) {
  return (message.endsWith(' the lobby!') || message.endsWith(' the lobby! <<<')) && message.includes('[MVP+')
}

function isPartyInviteMessage(message) {
  return message.endsWith(" here to join!\n-----------------------------") && !message.includes(':')
}

function isMessageYouJoinedParty(message) {
  return message.endsWith(" party!") && !message.includes(':')
}

function isMessageYoureInParty(message) {
  return message.endsWith(" to join another one.") && !message.includes(':')
}

function addCharToString(string, chars, times) {
  for (let i = 0; i < times; i++) {
    let randomNumber = Math.floor(Math.random() * string.length + 1)
    let a = string.split("")

    a.splice(randomNumber, 0, chars)
    string = a.join("")
  }
  return string
}

function sendToLimbo() {
  console.log(`Sending client to limbo`)
  return bot.chat('limbowo')
}