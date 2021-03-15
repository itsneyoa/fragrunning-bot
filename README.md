# Fragruns bot
A bot written by [SergeantSar](https://github.com/SergeantSar) and [neyoa](https://github.com/itsneyoa) because we couldn't find any open source ones and the public ones keep getting banned
> Warning -  Hypixel has a history of banning these bots without a reason. As there is no official statement yet this is entirely use at your own risk!

<hr>

## Table of Content

- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Roadmap](#roadmap)

### Prerequisites

- [Git](https://git-scm.com/downloads)
- [NodeJS](https://nodejs.org/en/) >= 14
- [Yarn](https://yarnpkg.com/getting-started/install) >= 1.2
- A [Minecraft account](https://minecraft.net/)

### Installation & Setup

To get started, clone down the repository using:

    git clone https://github.com/itsneyoa/fragrunning-bot.git

Next go into the `fragrunning-bot` folder and install all the dependencies using Yarn.

    yarn

While the dependencies are being installed you can copy the configuration file.

    cp config.example.json config.json

Next edit and setup the config file with a proper Minecraft and Discord settings, once you're done you can start the app.

    node index.js

### Configuration

#### Server

The server is the server the Minecraft client should connect to, by default it will point to Hypixels server so it can be left as-is if the plan is to use the app for Hypixel, if not then the `host` is the servers IP or hostname

#### Minecraft

The minecraft section includes a `username` and `password` option, if using a Mojang account these should be filled out with your Mojang username and password for the Minecraft account you plan on using, your Minecraft username is most likely the email it was created with. If using with a microsoft account change `accountType` to `microsoft`, `username` and `password` are not required and will be left blank as you will be directed to the [Microsoft Link page](https://www.microsoft.com/link).

### Roadmap

- [ ] Add a queue
    - Currently it just joins a party, waits for 10s then leaves. It would by much better for it to have a queue of players to join after it leaves one party.
- [ ] Restrict usage
    - Have an optional setting to only allow certain players to use or have a blacklist of players. This is currently done via the ingame privacy settings, which isn't great.
- [ ] Make bot autoreconnect is kicked
    - Pretty self-explanitory

### Credits
| a | b |
| -------- | ------- |
| [SergeantSar](https://github.com/SergeantSar) | Single handedly debugged my trash code, added additional functionality |
| [neyoa](https://github.com/itsneyoa) | Wrote the foundation code on the [hypixel-bridge](https://github.com/Senither/hypixel-discord-chat-bridge)|
| [Senither](http://senither.com/) | Wrote [hypixel-bridge](https://github.com/Senither/hypixel-discord-chat-bridge), the inspiration for this and how I learned mineflayer|
