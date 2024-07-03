const Discord = require('discord.js');
const { createGuildDB } = require('../Util/utils');

module.exports = async(bot, guild) => {
    
    if(!bot.settings.has(guild.id)) 
        bot.settings.set(guild.id, createGuildDB(guild))
       
};