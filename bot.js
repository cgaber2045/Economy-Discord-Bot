/*
  _____              _____      _         ____        _   
 |  __ \            / ____|    (_)       |  _ \      | |  
 | |  | | __ _ _ __| |     ___  _ _ __   | |_) | ___ | |_ 
 | |  | |/ _` | '__| |    / _ \| | '_ \  |  _ < / _ \| __|
 | |__| | (_| | |  | |___| (_) | | | | | | |_) | (_) | |_ 
 |_____/ \__,_|_|   \_____\___/|_|_| |_| |____/ \___/ \__|

 DarCoin Discord Bot created by Chris Gaber.
 Made for use by the Sanctuary Discord Server.
 Copyright (C) 2021 Sanctuary, Inc. All rights reserved.
*/

// See for API reference: https://discord.js.org/#/docs/main/stable/general/welcome
var Discord = require('discord.js');

// Module inclusions
var wallet = require('./lib/wallet');
var betting = require('./lib/betting');
var robbing = require('./lib/robbing');
var market = require('./lib/market');
var blackjack = require('./lib/blackjack');
var music = require('./lib/music');
var jobs = require('./lib/jobs');
var modules = ["wallet", "betting", "robbing", "market", "blackjack", "music", "jobs"];

require('dotenv').config();
global.pjson = require('./package.json');
global.config = require('./config');
if (process.env.CONFIG == "production") global.defaultConfig = config.production;
else global.defaultConfig = config.testing;

global.appConfig = config.app;

// Message with all the data.
global.databaseMessage = "";

// Initialize Discord Bot
global.bot = new Discord.Client({token: process.env.BOT_TOKEN, autorun: true});

// Bot login
bot.login(process.env.BOT_TOKEN);

bot.on("ready", () => {
  console.log(`Bot has started, with ${bot.users.size} users, in ${bot.channels.size} channels of ${bot.guilds.size} guilds.`);
  bot.user.setPresence({ game: {name: appConfig.coinName + " to the Moon!", type:0 } });
  initializeBot(); // On bot start initialize data... 
});

bot.on("message", async message => {
    // Setting up the command catcher.
    if(message.author.bot) return;
    if(message.content.indexOf("!") !== 0) return;

    // Logging what users are using what commands.
    console.log(message.author.username + ": " + message.content);

    // Getting the args as well as the command from the users message.
    var args = message.content.slice(1).trim().match(/(?:[^\s"]+|"[^"]*")+/g);
    const command = args.shift().toLowerCase();
    for (i=0; i<args.length; i++) {
      if (args[i].charAt(0) === '"' && args[i].charAt(args[i].length -1) === '"')
      {
          args[i] = args[i].substr(1,args[i].length -2);
      }
    }

    // Commands
    if (command == "help") {
      var user = "";
      if (message.author.id === defaultConfig.serverAdminID) user = "admin";
      if (args.length < 1 || !modules.includes(args[0])) {
        var helpMessage = '**The bot has the following commands:** \
        \n !about - Use this command to get information about the bot! \
        \n For help with individual modules type the name after !help e.x. !help market \
        \n Available modules: ';
        modules.forEach(m=> helpMessage += m + " ");
        message.channel.send(helpMessage);
      } else {
        message.channel.send(eval(args[0]).help(user));
      }
    }

    // About command
    if (command == "about") {
      message.reply("DarCoin Bot created by CEG for the Sanctuary Discord Server. Current Version: " + pjson.version);
    }

    // Used to create a wallet.
    if (command == "join") {
      wallet.create(message);
    }

    // Used to pay other wallet holders.
    if (command == "pay") {
      if (args.length != 2) message.reply("Not enough arguments provided. \n !pay <user nickname> <amt> - Use this command followed by the nickname of the person and amount to pay them.");
      else wallet.payUser(message, getIDFromNick(args[0]), parseInt(args[1]));
    }

    // Used to bet points.
    if (command == "bet") {
      if (args.length != 2) message.reply("Not enough arguments provided. \n !bet <thing> <amt> - Use this command to bet on a thing with your points.");
      else betting.bet(message, args[0], parseInt(args[1]));
    }

    // Used to check balance.
    if (command == "balance") {
      message.reply("You have " + wallet.getWallet(message.author.id) + " " + appConfig.coinName + " remaining.");
    }

    // Used to rob other wallet holders.
    if (command == "rob") {
      if (args.length < 2) message.reply("Not enough arguments provided. \
      \n !rob <user nickname> <amt> - Use this command to rob a person for an amount of their points (The more you rob, the lower the odds of success and greater punishment). \
      The punishment is " + (appConfig.penaltyAmount * 100) + "% of what you tried to rob.");
      else robbing.rob(message, getIDFromNick(args[0]), parseInt(args[1]));
    }

    // Used for the marketplace.
    if (command == "buy") {
      const product = args.shift();
      market.buy(message, product, args);
    }

    // Used for the blackjack.
    if (command == "blackjack") {
      if (args.length < 1) message.reply("Not enough arguments provided. \n !blackjack <bet> - Starts a blackjack card game against the bot; get a higher total to earn your bet, or a total of 21 for double your bet.");
      blackjack.startGame(message, parseInt(args[0]));
    }

    // Used for the music bot.
    if (command == "play") {
      if (args.length < 1) message.reply(`Not enough arguments provided. \n !play <youtube url> - Use this command to play a song for 8 seconds per ${appConfig.coinName}. E.x. a 3 minute vid costs 23 ${appConfig.coinName}.`);
      music.execute(message, args);
    }

    // Used for the music bot.
    if (command == "skip") {
      music.skip(message);
    }

    // Used for the music bot.
    if (command == "queue") {
      music.listSongs(message);
    }

    // Used to view all available job listings.
    if (command == "listjobs") {
      jobs.listJobs(message);
    }

    // Used by server admin to delete a users wallet.
    if (command == "delete" && message.author.id == defaultConfig.serverAdminID) {
      if (args.length < 1) message.reply("Not enough arguments provided. \n !delete <user nickname> - Use this command to delete a users wallet.");
      else wallet.deleteWallet(message, getIDFromNick(args[0]));
    }

    // Used by server admin to reset a users wallet.
    if (command == "reset" && message.author.id == defaultConfig.serverAdminID) {
      if (args.length < 1) message.reply("Not enough arguments provided. \n !reset <user nickname> - Use this command to reset a users wallet.");
      else wallet.resetWallet(message, getIDFromNick(args[0]));
    }

    // Used by server admin to artificially create money to be given to the bank.
    if (command == "spawn" && message.author.id == defaultConfig.serverAdminID) {
      if (args.length < 1) message.reply("Not enough arguments provided. \n !spawn <amt> - Use this command followed by the amount.");
      else wallet.spawnMoney(message, parseInt(args[0]));
    }

    // Used by server admin to give money from the bank.
    if (command == "give" && message.author.id == defaultConfig.serverAdminID) {
      if (args.length < 2) message.reply("Not enough arguments provided. \n !give <user nickname> <amt> - Use this command followed by the nickname of the person and amount to pay them.");
      else wallet.giveMoney(message, getIDFromNick(args[0]), parseInt(args[1]));
    }

    // Used by server admin to start betting predictions.
    if (command == "startbets") {
      if (args.length < 2) message.reply("Not enough arguments provided. \n !startbets <thing 1> <thing 2> - Use this command to start a prediction.");
      else betting.startBetting(message, args[0], args[1]);
    }

    // Used by server admin to stop betting predictions.
    if (command == "stopbets" && message.author.id === betting.getBetStarter()) {
      betting.stopBetting(message);
    }

    // Used by server admin to declare a winner to betting.
    if (command == "winner" && message.author.id === betting.getBetStarter()) {
      if (args.length < 1) message.reply("Not enough arguments provided. \n !winner <thing> - Use this command to declare a winner and distribute winnings.");
      else betting.winner(message, args[0]);
    }

    // Used by server admin to cancel betting predictions.
    if (command == "cancel" && (message.author.id == defaultConfig.serverAdminID || message.author.id === betting.getBetStarter())) {
      betting.cancelBets(message);
    }

    // Used by server admin to skip a song from the music bot.
    if (command == "adminskip" && message.author.id == defaultConfig.serverAdminID) {
      music.adminSkip(message);
    }

    // Used by server admin to skip a song from the music bot.
    if (command == "adminremove" && message.author.id == defaultConfig.serverAdminID) {
      music.adminRemove(message);
    }

    // Used by server admin to hire a user to a job.
    if (command == "hire" && message.author.id == defaultConfig.serverAdminID) {
      if (args.length < 2) message.reply("Not enough arguments provided. \n !hire <user> <role> - Use this command to hire a user to a role.");
      jobs.hire(message, getIDFromNick(args[0]), args[1]);
    }

    // Used by server admin to firea user from a job.
    if (command == "fire" && message.author.id == defaultConfig.serverAdminID) {
      if (args.length < 2) message.reply("Not enough arguments provided. \n !fire <user> <role> - Use this command to fire a user from a role.");
      jobs.fire(message, getIDFromNick(args[0]), args[1]);
    }
});

// Needed everytime the bot comes online to make sure all of our data is preserved.
function initializeBot() {
  var firstMessage = true;
  let channel = bot.channels.get(defaultConfig.walletChannelID);
  channel.fetchMessages({ limit: 100 }).then(messages => {
    // Iterate through the messages and see if the bot already made a message. If not, we know this 
    // is the first run of the bot.
    messages.forEach(message => {
      if(message.author.id === defaultConfig.botId) {
        firstMessage = false; 
        databaseMessage = message.id;
      } 
    })
  }).then(
    data => {
      // If this is the first run, we want to get the server admin's messages and store all of the data
      // in a way the bot can understand it.
      if (firstMessage === true) parseMessages();
      else refreshMessageArray();
    })
}

// Get all of Server Admin's messages in the channel and store them in a way the bot can understand.
function parseMessages() {
  let channel = bot.channels.get(defaultConfig.walletChannelID);

  channel.fetchMessages({ limit: 100 }).then(messages => {
    messages.forEach(message => {if(message.author.id === defaultConfig.serverAdminID){
      let bankUser = {name:"", amt:""};
      var content = message.content;
      var splitMessage = content.split(" - ");

      bankUser.name=getIDFromNick(splitMessage[0]);
      bankUser.amt=splitMessage[1];
      if (bankUser.name != 0) wallet.setWallet(bankUser.name, parseInt(bankUser.amt));
    } })

    // The bot starts with a finite amount of money and serves as the bank.
    wallet.setWallet(defaultConfig.botId, appConfig.initialBankCash);

    let bankAccountText = "**__Wallets__ - Please DM me (the bot) !help to get the commands.**\n";
    bankAccountText += appConfig.announcement;
    for(const [key,value] of wallet.wallet()) {
      bankAccountText += "<@" + key +">" + " - " + value + " - " + " " + appConfig.coinName + "\n";
    }

    channel.send(bankAccountText);
  });
}

// Use the bots message to update our built in storage.
function refreshMessageArray() {
  // Get the channel the bot is attached to.
  let channel = bot.channels.get(defaultConfig.walletChannelID);

  // Get the original wallets message and use it to set up the built in memory.
  channel.fetchMessage(databaseMessage).then(
    message=>{
      // Seperate the parts of the message.
      var messages = message.content.split("\n");

      // Update each users wallets.
      for (i = 2; i < messages.length; i++) {
        let bankUser = {name:"", amt:""};
        var splitMessage = messages[i].split(" - ");
        var id = splitMessage[0].replace(/[<>@]/g, '');

        bankUser.name=id;
        bankUser.amt=parseInt(splitMessage[1]);
        if (bankUser.amt === NaN) bankUser.amt = 0;
        if (bankUser.name != 0) wallet.setWallet(bankUser.name, bankUser.amt);
      }
    }
    ).then(fulfilled=>{
      jobs.createRoles();
      wallet.taxSystem();
      jobs.dailyIncome();
      wallet.wellfareSystem();
    });
}

// Used to turn a nickname into a discord ID.
function getIDFromNick(nick) {
  // Get the server and all the users in it.
  var guild = bot.guilds.get(defaultConfig.serverID);
  var userArray = guild.members.array();

  // Search through all of their nicknames/usernames to find the id that we need.
  for (i = 0; i < userArray.length; i++) {
    if ( (userArray[i].user.tag.toLowerCase() === nick.toLowerCase()) || (userArray[i].nickname && ( userArray[i].nickname.toLowerCase() === nick.toLowerCase()) ) || ( userArray[i].user.username && ( userArray[i].user.username.toLowerCase() === nick.toLowerCase()) ) ) {
      return userArray[i].user.id;
    }
  }

  // Could not be found.
  return 0;
}