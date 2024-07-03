
module.exports = async (bot, message) => {

    if(message.author.bot) return;

    let prefix = bot.config.prefix

    if (message.content.startsWith(prefix)){
        let cmd = require('./subEvents/command.js');
        cmd.run(bot, message, prefix);
    }
}