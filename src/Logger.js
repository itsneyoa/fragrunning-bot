const chalk = require('chalk')

class Logger {
  client(message) {
    return console.log(chalk.bgGreenBright.black(`[${this.getCurrentTime()}] Client >`) + ' ' + chalk.greenBright(message))
  }

  party(message) {
    return console.log(chalk.bgMagenta.black(`[${this.getCurrentTime()}] Party >`) + ' ' + chalk.magenta(message))
  }

  info(message) {
    return console.log(chalk.bgCyan.black(`[${this.getCurrentTime()}] Info >`) + ' ' + chalk.cyan(message))
  }

  warn(message) {
    return console.log(chalk.bgYellow.black(`[${this.getCurrentTime()}] Warning >`) + ' ' + chalk.yellow(message))
  }

  error(message) {
    return console.log(chalk.bgRedBright.black(`[${this.getCurrentTime()}] Error >`) + ' ' + chalk.redBright(message))
  }

  getCurrentTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  }
}

module.exports = Logger