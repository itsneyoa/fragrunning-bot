const chalk = require('chalk')
const figlet = require('figlet')
const clear = require('clear')
const inquirer = require('inquirer')
const fs = require('fs')

class Generator {
  generateConfig() {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(`config.json`)) {
        inquirer.prompt([
          {
            type: 'list',
            name: 'regenerate',
            message: 'Configuration already detected. How would you like to regenerate?',
            choices: ['Everything', 'Server', 'Minecraft', 'Fragruns', 'Api Key', 'Blacklist', 'Nothing']
          }
        ]).then(res => {
          let config = require(`../config.json`)

          switch (res.regenerate) {
            case 'Everything':
              this.makeConfigObject().then(() => resolve())
              break
            case 'Server':
              this.setUpServer().then(server => {
                config.server = server
                this.writeToFile(config).then(() => resolve())
              })
              break
            case 'Minecraft':
              this.setUpMinecraft().then(minecraft => {
                config.minecraft = minecraft
                this.writeToFile(config).then(() => resolve())
              })
              break
            case 'Fragruns':
              this.setUpFragruns().then(fragruns => {
                config.fragruns = fragruns
                this.writeToFile(config).then(() => resolve())
              })
              break
            case 'Api Key':
              this.setUpApiKey().then(apiKey => {
                config.apiKey = apiKey
                this.writeToFile(config).then(() => resolve())
              })
              break
            case 'Blacklist':
              this.setUpBlacklist().then(fragruns => {
                if (fragruns) {
                  config.fragruns.blacklist = fragruns
                } else {
                  config.fragruns.blacklist = null
                }
                this.writeToFile(config).then(() => resolve())
              })
              break
            case 'Nothing':
              resolve()
              break
          }
        })
      } else {
        this.makeConfigObject().then(() => resolve())
      }
    })
  }

  makeConfigObject() {
    clear()
    console.log(
      chalk.yellow(
        figlet.textSync('Fragruns', { horizontalLayout: 'full' })
      )
    )
    console.log()

    let config = {}
    return new Promise((resolve, reject) => {
      this.setUpServer().then(server => {
        config.server = server
        this.setUpMinecraft().then(minecraft => {
          config.minecraft = minecraft
          this.setUpFragruns().then(fragruns => {
            config.fragruns = fragruns
            this.setUpApiKey().then(apiKey => {
              config.apiKey = apiKey
              if (['guild', 'friends', 'everyone'].includes(config.fragruns.mode)) {
                this.setUpBlacklist().then(blacklist => {
                  config.fragruns.blacklist = blacklist
                  this.writeToFile(config).then(() => resolve())
                })
              } else {
                this.writeToFile(config).then(() => resolve())
              }
            })
          })
        })
      })
    })
  }

  setUpServer() {
    let server = {}
    return new Promise((resolve, reject) => {
      inquirer.prompt([
        {
          type: 'input',
          name: 'host',
          message: 'What server would you like to connect to?',
          default: 'mc.hypixel.net'
        }
      ]).then(res => {
        server.host = res.host
        resolve(server)
      })
    })
  }

  setUpMinecraft() {
    let minecraft = {}
    return new Promise((resolve, reject) => {
      inquirer.prompt([
        {
          type: 'list',
          name: 'accountType',
          message: 'Are you using a Microsoft or Mojang account?',
          choices: ['Microsoft', 'Mojang']
        }
      ]).then(res => {
        minecraft.accountType = res.accountType.toLowerCase()
        if (res.accountType == 'Mojang') {
          inquirer.prompt([
            {
              type: 'input',
              name: 'username',
              message: 'Enter the username or email linked to the Mojang account.'
            },
            {
              type: 'password',
              name: 'password',
              message: 'Enter the password.',
              mask: true
            }
          ]).then(res => {
            minecraft.username = res.username
            minecraft.password = res.password
            resolve(minecraft)
          })
        } else {
          resolve(minecraft)
        }
      })
    })
  }

  setUpFragruns() {
    let fragruns = {}
    return new Promise((resolve, reject) => {
      inquirer.prompt([
        {
          type: 'list',
          name: 'mode',
          message: 'Which whitelist mode would you like to use?',
          choices: ['Everyone', 'Solo', 'Users', 'Guild', 'Friends']
        }
      ]).then(res => {
        switch (res.mode) {
          case 'Everyone':
            fragruns.mode = 'everyone'
            resolve(fragruns)
            break
          case 'Solo':
            fragruns.mode = 'solo'
            inquirer.prompt([{
              type: 'input',
              name: 'input',
              message: 'Which user is the bot for?'
            }]).then(res => {
              fragruns.input = res.input
              resolve(fragruns)
            })
            break
          case 'Users':
            fragruns.mode = 'users'
            inquirer.prompt([{
              type: 'input',
              name: 'input',
              message: 'Which users are the bot for? (Separate with a comma)'
            }]).then(res => {
              fragruns.input = res.input.split(',').map(name => name.trim())
              resolve(fragruns)
            })
            break
          case 'Guild':
            fragruns.mode = 'guild'
            inquirer.prompt([{
              type: 'input',
              name: 'input',
              message: 'Which guild is the bot for?'
            }]).then(res => {
              fragruns.input = res.input
              resolve(fragruns)
            })
            break
          case 'Friends':
            fragruns.mode = 'friends'
            inquirer.prompt([{
              type: 'input',
              name: 'input',
              message: `Which user's friends is the bot for?`
            }]).then(res => {
              fragruns.input = res.input
              fragruns.apiKey = res.apiKey
              resolve(fragruns)
            })
            break
        }
      })
    })
  }

  setUpBlacklist() {
    return new Promise((resolve, reject) => {
      inquirer.prompt([{
        type: 'confirm',
        name: 'blacklistEnabled',
        message: 'Would you like to use a blacklist?',
        default: false
      }]).then(res => {
        if (!res.blacklistEnabled) {
          resolve([])
        } else {
          inquirer.prompt([{
            type: 'input',
            name: 'blacklist',
            message: 'Which users would you like the blacklist from the bot? (Separate with a comma)'
          }]).then(res => {
            resolve(res.blacklist.split(',').map(name => name.trim()))
          })
        }
      })
    })
  }

  setUpApiKey() {
    return new Promise((resolve, reject) => {
      inquirer.prompt([{
        type: 'input',
        name: 'apiKey',
        message: 'What is your Hypixel Api Key?'
      }]).then(res => {
        resolve(res.apiKey)
      })
    })
  }

  writeToFile(config) {
    return new Promise((resolve, reject) => {
      fs.promises.writeFile(`config.json`, JSON.stringify(config), error => {
        if (error) {
          reject(error)
        }
      }).then(() => {
        console.log(chalk.green(`Created configuration file!`))
        resolve()
      })
    })
  }
}

module.exports = new Generator()