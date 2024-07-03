const Discord = require('discord.js');
const bot = new Discord.Client({ 
    failIfNotExists: false,
    partials: ["CHANNEL"],
    intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "DIRECT_MESSAGES", "GUILD_VOICE_STATES", "DIRECT_MESSAGE_REACTIONS", "GUILD_MESSAGE_REACTIONS", "GUILD_INVITES"] 
});

bot.config = require('./Config.json');
bot.commands = new Discord.Collection();
bot.slashCommands = new Discord.Collection();
bot.aliases = new Discord.Collection();
bot.buttons = new Discord.Collection()
bot.cooldowns = new Discord.Collection();

bot.bingos = new Discord.Collection()
bot.db = require('quick.db')
bot.schedule = new bot.db.table('schedule')
bot.settings = new bot.db.table('settings')

require('./Handlers/Buttons.js')(bot);
require('./Handlers/Events.js')(bot);

bot.embed = (m) => {
    const embed = new Discord.MessageEmbed()
        .setDescription(m)
        .setColor('RANDOM');

    return { embeds: [embed] }
}

bot.login(bot.config.token);