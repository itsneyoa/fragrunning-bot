const mineflayer = require('mineflayer');
const chalk = require('chalk');
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
  }

  if (isPartyJoinMessage(message)) {
    console.log(chalk.cyan(`Successfully joined a party!`));
    bot.chat(`/pc Hi! I'm ${bot.username}. You can party me for frag runs - I'll auto leave after 10 seconds.`);
    setTimeout(() => bot.chat(`/p leave`), config.settings.timeout);
  }

  if (isPartyLeaveMessage(message)) {
    console.log(chalk.magenta(`Left the party`));
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

function isPartyJoinMessage(message) {
  return message.startsWith(`You have joined `) && message.endsWith(`'s party!`);
}

function isPartyLeaveMessage(message) {
  return message.startsWith(`You left the party.`) || message.startsWith(`The party was disbanded because all invites expired and the party was empty`);
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