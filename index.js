const mineflayer = require('mineflayer');
const chalk = require('chalk');

const bot = mineflayer.createBot({
  host: "hypixel.net",
  username: 'ur-username',
  password: 'ur-password',
  auth: "mojang",
});

var loginAttempts = 0;
var exactDelay = 0;

bot.on('login', () => {
  console.log(chalk.greenBright(`Minecraft bot ready, logged in as ${bot.username}`))

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
  console.log(chalk.red(`Minecraft bot disconnected from server, attempting reconnect in ${loginDelay / 1000} seconds`))

  setTimeout(() => bot.connect(), loginDelay);
})

bot.on('kicked', (reason) => {
  console.log(chalk.red(`Minecraft bot was kicked from server for "${reason}"`));
})

bot.on('message', jsonMsg => {
  const message = jsonMsg.toString();
  console.log(message)

  if (isLobbyJoinMessage(message)) sendToLimbo();

  if (isPartyMessage(message)) {
    let partier = message.split('has', 1);
    let hasRank = partier[0].includes('[');
    var ign = '';
    if (hasRank) {
      ign = partier[0].split(" ")[1];
    } else {
      ign = partier[0];
    }
    console.log(chalk.yellow(`Partying ${ign}`))
    bot.chat(`/p accept ${ign}`)
    setTimeout(() => bot.chat(`/pc Hi! I'm ${bot.username}. You can party me for frag runs - I'll auto leave after 10 seconds.`), 1000)
    setTimeout(() => bot.chat(`/p leave`), 9000)
  }

  if (failedToJoinParty(message)) {
    console.log(chalk.red(`Failed to join party`))
  }
  if (unkownCommand(message)) {
    console.log(chalk.red(`Ran an unknown command`))
  }
  if (noIGN(message)) {
    console.log(chalk.red('Failed to obtain username'))
  }
  if (failedAccept(message)) {
    console.log(chalk.red('Failed to accept party invite'))
  }
});

function isLobbyJoinMessage(message) {
  return (message.endsWith(' the lobby!') || message.endsWith(' the lobby! <<<')) && message.includes('[MVP+');
}

function sendToLimbo() {
  return bot.chat(`/ac §`);
}

function isPartyMessage(message) {
  return message.includes('has invited you to join their party!');
}

function failedToJoinParty(message) {
  return message.includes('That player does not exist.');
}

function unkownCommand(message) {
  return message.includes('Unknown command.');
}

function noIGN(message) {
  return message.includes('Usage: /party accept <inviter>');
}

function failedAccept(message) {
  return message.includes(`Couldn't find a player with that name`)
}