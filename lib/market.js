/*
  _____              _____      _         __  __            _        _   
 |  __ \            / ____|    (_)       |  \/  |          | |      | |  
 | |  | | __ _ _ __| |     ___  _ _ __   | \  / | __ _ _ __| | _____| |_ 
 | |  | |/ _` | '__| |    / _ \| | '_ \  | |\/| |/ _` | '__| |/ / _ \ __|
 | |__| | (_| | |  | |___| (_) | | | | | | |  | | (_| | |  |   <  __/ |_ 
 |_____/ \__,_|_|   \_____\___/|_|_| |_| |_|  |_|\__,_|_|  |_|\_\___|\__|

 Market module for the DarCoin Bot created by Chris Gaber.
 Made for use by the Sanctuary Discord Server.
 Copyright (C) 2021 Sanctuary, Inc. All rights reserved.
*/

var wallet = require('./wallet');

// Contains all the products that can be bought.
const products = new Map([
  //["shoot", 100],
  //["revive", 75],
  //["kick", 35],
  ["deafen", 20],
  ["undeafen", 10],
  ["gag", 10],
  ["ungag", 5],
  //["taze", 5],
  ["nick", 25]
]);

// Used to store and remove a users roles.
var roleMap = new Map([]);

// Used to let the user know how to use the commands.
function help(user) {
  var helpstring = '\n**Market Commands:**\n!buy <product> <name of person> <other...> - Use this command to purchase different products from the marketplace!';
  helpstring += "\n**Products:** " + getProducts();
  if (user==="admin") helpstring += '';
  return helpstring;
}

function shoot(message, args) {
  var guild = bot.guilds.get(defaultConfig.serverID);
  var user = getIDFromNick(args[0]);
  if (guild.member(user) != null) {
    if (guild.member(user).bannable) {
      guild.member(user).send("You have been banned by " + wallet.getNickFromID(message.author.id) + ".").then(
        value=>{guild.member(user).ban("Someone paid to have you banned. LOL.")});
        bot.channels.get(defaultConfig.generalChannelID).send(wallet.getNickFromID(message.author.id) + " has gunned " + wallet.getNickFromID(user) + " down.");
      return true;
    } else {
      message.reply("User is not bannable!");
    }
  } else {
    message.reply("User could not be found!");
  }  
  return false;
}

function revive(message, args) {
  var guild = bot.guilds.get(defaultConfig.serverID);
  var user = getIDFromNick(args[0]);
  if (guild.member(user) != null) {
    message.channel.createInvite().then(function(newInvite){
      guild.member(user).send("https://discord.gg/" + newInvite.code);
    });
    guild.member(user).send("You have been unbanned by " + wallet.getNickFromID(message.author.id) + ".").then(
      value=>{guild.member(user).unban("Someone paid to have you unbanned Pogchamp!")});
      bot.channels.get(defaultConfig.generalChannelID).send(wallet.getNickFromID(message.author.id) + " has revived " + wallet.getNickFromID(user) + ".");
      return true;
  } else {
    message.reply("User could not be found!");
  }  
  return false;
}

function kick(message, args) {
  var guild = bot.guilds.get(defaultConfig.serverID);
  var user = getIDFromNick(args[0]);
  var guildMember = guild.member(user);
  if (guildMember != null) {
    if (guildMember.bannable) {
      if (!roleMap.get(guildMember)) roleMap.set(user, guildMember.getRoles);
      message.channel.createInvite().then(function(newInvite){
        guildMember.send("https://discord.gg/" + newInvite.code);
      });
      guildMember.send("You have been kicked by " + wallet.getNickFromID(message.author.id) + ".").then(
        value=>{guildMember.kick("Someone paid to have you kicked. LOL.")});
        bot.channels.get(defaultConfig.generalChannelID).send(wallet.getNickFromID(message.author.id) + " has kicked " + wallet.getNickFromID(user) + ".");
      return true;
    } else {
      message.reply("User is not kickable!");
    }
  } else {
    message.reply("User could not be found!");
  }  
  return false;
}

function deafen(message, args) {
  var guild = bot.guilds.get(defaultConfig.serverID);
  var user = getIDFromNick(args[0]);
  if (guild.member(user) != null) {
    if (guild.member(user).voiceChannel) {
      if (guild.member(user).bannable) {
        guild.member(user).setDeaf(true);
        //guild.member(user).send("You have been deafened by " + wallet.getNickFromID(message.author.id) + ".");
        //bot.channels.get(defaultConfig.generalChannelID).send(wallet.getNickFromID(message.author.id) + " has deafened " + wallet.getNickFromID(user) + ".");
        return true;
      } else {
        message.reply("Cannot deafen that person!");
      }
    } else {
      message.reply("User is not in a voice channel!");
    }
  } else {
    message.reply("User could not be found!");
  } 
  return false;
}

function undeafen(message, args) {
  var guild = bot.guilds.get(defaultConfig.serverID);
  var user = getIDFromNick(args[0]);
  if (guild.member(user) != null) {
    if (guild.member(user).voiceChannel) {
      if (guild.member(user).bannable) {
        guild.member(user).setDeaf(false);
        guild.member(user).send("You have been undeafened by " + wallet.getNickFromID(message.author.id) + ".");
        bot.channels.get(defaultConfig.generalChannelID).send(wallet.getNickFromID(message.author.id) + " has undeafened " + wallet.getNickFromID(user) + ".");
        return true;
      } else {
        message.reply("Cannot undeafen that person!");
      }
    } else {
      message.reply("User is not in a voice channel!");
    }
  } else {
    message.reply("User could not be found!");
  } 
  return false;
}

function gag(message, args) {
  var guild = bot.guilds.get(defaultConfig.serverID);
  var user = getIDFromNick(args[0]);
  if (guild.member(user) != null) {
    if (guild.member(user).voiceChannel) {
      if (guild.member(user).bannable) {
        guild.member(user).setMute(true);
        //guild.member(user).send("You have been deafened by " + wallet.getNickFromID(message.author.id) + ".");
        //bot.channels.get(defaultConfig.generalChannelID).send(wallet.getNickFromID(message.author.id) + " has gagged " + wallet.getNickFromID(user) + ".");
        return true;
      } else {
        message.reply("Cannot gag that person!");
      }
    } else {
      message.reply("User is not in a voice channel!");
    }
  } else {
    message.reply("User could not be found!");
  }
  return false;
}

function ungag(message, args) {
  var guild = bot.guilds.get(defaultConfig.serverID);
  var user = getIDFromNick(args[0]);
  if (guild.member(user) != null) {
    if (guild.member(user).voiceChannel) {
      if (guild.member(user).bannable) {
        guild.member(user).setMute(false);
        guild.member(user).send("You have been ungagged by " + wallet.getNickFromID(message.author.id) + ".");
        bot.channels.get(defaultConfig.generalChannelID).send(wallet.getNickFromID(message.author.id) + " has ungagged " + wallet.getNickFromID(user) + ".");
        return true;
      } else {
        message.reply("Cannot ungag that person!");
      }
    } else {
      message.reply("User is not in a voice channel!");
    }
  } else {
    message.reply("User could not be found!");
  }
  return false;
}

function taze(message, args) {
  var guild = bot.guilds.get(defaultConfig.serverID);
  var user = getIDFromNick(args[0]);

  if (guild.member(user) != null) {
    if (guild.member(user).voiceChannel) {
      if (guild.member(user).bannable) {
        message.guild.members.get(user).setVoiceChannel(null);
        guild.member(user).send("You have been disconnected by " + wallet.getNickFromID(message.author.id) + ".");
        bot.channels.get(defaultConfig.generalChannelID).send(wallet.getNickFromID(message.author.id) + " has tazed " + wallet.getNickFromID(user) + ".");
        return true;

      } else {
        message.reply("Cannot taze that person!");
      }
    } else {
      message.reply("User is not in a voice channel!");
    }
  } else {
    message.reply("User could not be found!");
  }
  return false;
}

function nick(message, args) {
  var guild = bot.guilds.get(defaultConfig.serverID);
  if (args.length > 1) {
    var user = getIDFromNick(args[0]);
    var name = args[1];
    if (guild.member(user) != null) {
      if (name.length < 32) {
        if (user != defaultConfig.botId && guild.member(user).bannable) {
          guild.member(user).setNickname(name);
          guild.member(user).send("You have been named " + name + " by " + wallet.getNickFromID(message.author.id) + ".");
          bot.channels.get(defaultConfig.generalChannelID).send(wallet.getNickFromID(message.author.id) + " has set " + wallet.getNickFromID(user) +"'s name to " + name + ".");
          return true;
        } else {
          message.reply("Cannot rename that person!");
        }
      } else {
        message.reply("Your name is too long!");
      }
    } else {
      message.reply("User could not be found!");
    }
  } else {
    message.reply("Not enough parameters!");
  }
  return false;
}

function getProducts() {
  var productList = "";
  for(const [key,value] of products) if (key != undefined) productList += key + " (" + value + ") ";
  return productList;
}

function buy(message, product, args) {
  if (args.length > 0)
    if (products.has(product)) {
      if (wallet.getWallet(message.author.id) >= products.get(product)) {
        if (eval(product)(message, args)) {
          wallet.subtractPoints(message.author.id, products.get(product));
          wallet.addPoints(defaultConfig.botId, products.get(product));
          message.reply("You have purchased " + product + " for " + products.get(product) + " " + appConfig.coinName + "!");
          wallet.updateMessage();
        }
      } else {
        message.reply("You do not have enough to purchase this product!");
      }
    } else {
      message.reply(product + " is not being sold!");
    }
    else {
      message.reply("Wrong arguments - !buy <product> <name of person> <other...> - Use this command to purchase different products from the marketplace!");
    }
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

module.exports={getProducts, help, buy, shoot, revive, kick, deafen, undeafen, gag, ungag, taze, nick, getIDFromNick}