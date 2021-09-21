/*
  _____              _____      _        __          __   _ _      _   
 |  __ \            / ____|    (_)       \ \        / /  | | |    | |  
 | |  | | __ _ _ __| |     ___  _ _ __    \ \  /\  / /_ _| | | ___| |_ 
 | |  | |/ _` | '__| |    / _ \| | '_ \    \ \/  \/ / _` | | |/ _ \ __|
 | |__| | (_| | |  | |___| (_) | | | | |    \  /\  / (_| | | |  __/ |_ 
 |_____/ \__,_|_|   \_____\___/|_|_| |_|     \/  \/ \__,_|_|_|\___|\__|

 Wallet module for the DarCoin bot created by Chris Gaber.
 Made for use by the Sanctuary Discord Server.
 Copyright (C) 2021 Sanctuary, Inc. All rights reserved.
*/

// Map to hold all bank accounts after they are parsed in - resets every 24 hours due to Dyno worker.
var allCoinWallets = new Map();

// Magic function to sort the wallets from greatest to least whenever they are iterated through.
allCoinWallets[Symbol.iterator] = function* () {
  yield* [...this.entries()].sort((a, b) => b[1] - a[1]);
}

// Getters and setters
function addPoints(user, amount) {
  allCoinWallets.set(user, allCoinWallets.get(user) + amount);
}

// Getters and setters
function subtractPoints(user, amount) {
  allCoinWallets.set(user, allCoinWallets.get(user) - amount);
}

// Getters and setters
function setWallet(user, amount) {
    allCoinWallets.set(user, amount);
}

// Getters and setters
function getWallet(user) {
    return allCoinWallets.get(user);
}

function has(user) {
    return allCoinWallets.has(user);
}

function wallet() {
    return allCoinWallets;
}

function help(user) {
    var helpstring = '\n**Wallet Commands:**\n!join - Use this command to create a wallet for the first time. \
    \n!pay <user nickname> <amt> - Use this command followed by the nickname of the person to pay them (if username has spaces put it in double quotes ""). \
    \n!balance - Use this command to get your current balance!';
    if (user === "admin") helpstring += '\n!give <user nickname> <amt> - Use this command followed by the nickname of the person to pay them from the bank.\
    \n!reset <user nickname> - Use this command followed by the nickname of the person to reset their bank account.\
    \n!delete <user nickname> - Use this command followed by the nickname of the person to delete their bank account.\
    \n!spawn <amt> - Use this command followed by the amount to spawn money for the bank.';

    return helpstring;
}

// Used to create a new wallet.
function create(message) {
    var user = message.author.id;
    if (!allCoinWallets.has(user)) {
        allCoinWallets.set(user, appConfig.initialStartCash);
        updateMessage();
        message.reply("Your wallet has been created! You are starting with " + appConfig.initialStartCash + " " + appConfig.coinName + ".");
      } else {
        message.reply("You already have an existing wallet.");
      }
}

// Used for one user to pay another.
function payUser(message, recipient, amount) {
    var sender = message.author.id;
    if (sender != recipient) {
      if (allCoinWallets.has(sender) && allCoinWallets.has(recipient)) {
        if (Number.isInteger(amount)) {
          if (allCoinWallets.get(sender) - amount >= 0 && amount > 0) {
            // We can successfully send money.
            message.reply("You have sent " + amount + " " + appConfig.coinName + " to " + getNickFromID(recipient) + ".");
            bot.users.get(recipient).send("You have recieved " + amount + " " + appConfig.coinName + " from " + getNickFromID(sender) + ".").catch(() => console.log("Can't send DM to your user!"));;
            allCoinWallets.set(sender, allCoinWallets.get(sender) - amount);
            allCoinWallets.set(recipient, allCoinWallets.get(recipient) + amount);
            updateMessage();
          } else {
            message.reply("You broke af boy what you doing trying to send money.");
          }
        } else {
          message.reply("You inputed something that was not a whole number.");
        }
      } else {
        message.reply("Both of you must have a coin wallet to send money!");
      }
    } else {
      message.reply("Can't send money to yourself!");
    }
}

// Deletes a users wallet so they can rejoin.
function deleteWallet(message, user) {
    if (allCoinWallets.has(user)) {
        allCoinWallets.delete(user);
        message.reply("User's wallet has been deleted.");
        updateMessage();
    } else {
        message.reply("User not found!");
    }
}

// Resets the wallet of the specified user to 0.
function resetWallet(message, user) {
    if (allCoinWallets.has(user)) {
      allCoinWallets.set(user, 0);
      message.reply("User's wallet has been reset.");
      updateMessage();
    } else {
      message.reply("User not found!");
    }
}

// Used to spawn money into the bank. 
function spawnMoney(message, amount) {
    var sender = defaultConfig.botId;
    if (Number.isInteger(amount) && amount > 0) {
      // We can successfully send money.
      message.reply(amount + " " + appConfig.coinName + " has been spawned in.");
      allCoinWallets.set(sender, allCoinWallets.get(sender) + amount);
      updateMessage();
    } else {
      message.reply("Can't send negative/no money to the bank.");
    }
}

// Used to give people money from the bank.
function giveMoney(message, recipient, amount) {
    var sender = defaultConfig.botId;

    if (sender != recipient) {
      if (allCoinWallets.has(sender) && allCoinWallets.has(recipient)) {
        if (Number.isInteger(amount) && allCoinWallets.get(sender) - amount >= 0 && amount > 0) {
          message.reply(amount + " " + appConfig.coinName + " has been sent to " + getNickFromID(recipient) + " from the bank.");
          bot.users.get(recipient).send("You have recieved " + amount + " " + appConfig.coinName + " from the bank.");
          allCoinWallets.set(sender, allCoinWallets.get(sender) - amount);
          allCoinWallets.set(recipient, allCoinWallets.get(recipient) + amount);
          updateMessage();
        } else {
          message.reply("Not enough money in the bank to send funds.");
        }
      } else {
        message.reply("User not found!");
      }
    } else {
      message.reply("Cannot send money to the bank!");
    }
}

// Function used to give users who have less than 5 DarCoin at restart 5 DarCoin from the bank.
function wellfareSystem() {
    for(const [key,value] of allCoinWallets) {
      if (value < 5 && key != defaultConfig.botId && allCoinWallets.get(defaultConfig.botId) > 4) {
        allCoinWallets.set(key, allCoinWallets.get(key)+5);
        allCoinWallets.set(defaultConfig.botId, allCoinWallets.get(defaultConfig.botId)-5);
      }
    }
    updateMessage();
}

// Function used to tax all players above 20 DarCoin.
function taxSystem() {
  for(const [key,value] of allCoinWallets) {
    if (value > 20 && key != defaultConfig.botId) {
      var amount = Math.round(allCoinWallets.get(key)*appConfig.taxRate);
      subtractPoints(key, amount);
      addPoints(defaultConfig.botId, amount);
    }
  }
  updateMessage();
}

// Used to update the bots message with the new wallet info.
function updateMessage() {
    // Get the channel the bot is attached to.
    let channel = bot.channels.get(defaultConfig.walletChannelID);
  
    // Find the wallet message and then update it with the new information.
    channel.fetchMessage(databaseMessage).then(
      message=>{
        var newMessage = "**__Wallets__ - Please DM me (the bot) !help to get the commands.**\n";
        newMessage += appConfig.announcement;
        for(const [key,value] of allCoinWallets) {
          newMessage += "<@" + key +">" + " - " + value + " - " + " " + appConfig.coinName + "\n";
        }
  
        message.edit(newMessage);
      }
    );
}

// Used to turn a discord ID into a nickname.
function getNickFromID(id) {
    // Get the server and all the users in it.
    var guild = bot.guilds.get(defaultConfig.serverID);
    var userArray = guild.members.array();
  
    // Search through all of their id's to find the nickname/username that we need.
    for (i = 0; i < userArray.length; i++) {
      if (userArray[i].user.id === id) {
        if (userArray[i].nickname === undefined || userArray[i].nickname === null) return userArray[i].user.username;
        else return userArray[i].nickname;
      }
    }
  
    // We couldn't find it.
    return "";
}

module.exports = {help, addPoints, subtractPoints, setWallet, getWallet, has, create, wallet, payUser, deleteWallet, resetWallet, spawnMoney, giveMoney, wellfareSystem, taxSystem, updateMessage, getNickFromID};