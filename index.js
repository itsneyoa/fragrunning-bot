const mineflayer = require('mineflayer');
const chalk = require('chalk');
const config = require('./config.json')

const bot = mineflayer.createBot({
    host: config.server.host,
    port: config.server.port,
    username: config.minecraft.username,
    password: config.minecraft.password,
    version: false,
    auth: config.minecraft.accountType,
})

bot.on('chat', (username, message) => {
    if(bot.username === username) return;
    if(isLobbyJoinMessage(message)) sendToLimbo;

    if (isPartyMessage(message)){
        let partier = message.split('has', 1);
        let hasRank = partier[0].includes('[');
        if(hasRank){
          var ign = partier[0].split(" ")[1];
        } else{
          var ign = partier[0];
        }
        console.log(chalk.yellow(`Partying ${ign}`))
        bot.chat(`/p join ${ign}`)
        setTimeout(() => this.bot.chat(`/pc Hi! I'm ${bot.username}. You can party me for frag runs - I'll auto leave after 10 seconds.`), 1000)
        setTimeout(() => this.bot.chat(`/p leave`), 9000)
      }
})

function isLobbyJoinMessage(message) {
    return (message.endsWith(' the lobby!') || message.endsWith(' the lobby! <<<')) && message.includes('[MVP+');
}

function sendToLimbo(){
    return bot.chat(`/ac §`);
}

function isPartyMessage(message) {
    return message.includes('has invited you to join their party!') && !message.includes('Guild >');
}