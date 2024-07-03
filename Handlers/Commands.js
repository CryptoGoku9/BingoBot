const path = require('path')
const { getFilesRecursive } = require('../Util/utils');

module.exports = function(bot) {
    
    
    let commands = getFilesRecursive(`${process.cwd()}/Commands`);
    console.log(commands.length + ' commands found');
    
    commands.forEach(file => {      
        delete require.cache[require.resolve(file)];  
        let cmd = require(file)

        cmd.config.category = path.basename(path.dirname(file))
        if(cmd.config.category == 'Commands') cmd.config.category = null

        bot.commands.set(cmd.config.command, cmd);
        
        let space = "";
        for(let i = 0; i < 23 - cmd.config.command.length; i++)  space += " ";
        console.log(`${cmd.config.command} ${space}loading...`);//file.substring(file.lastIndexOf('/') + 1, file.length) == cmd name from path

        if(cmd.config.aliases)
            cmd.config.aliases.forEach(alias => bot.aliases.set(alias, cmd.config.command));
        
    });

}

module.exports.reloadCategory = function(bot, category) {
    const commands = bot.util.getFilesRecursive(`${process.cwd()}/Commands/${category}`);

    if(commands.size <= 0)
        return console.log('No commands found for reload...');

    commands.forEach(file => {
        delete require.cache[require.resolve(file)];
        let cmd = require(file);

        console.log(`Command ${cmd.config.command} was reloaded!`);

        bot.commands.set(cmd.config.command, cmd);
        if(cmd.config.aliases)
            cmd.config.aliases.forEach(alias => bot.aliases.set(alias, cmd.config.command));
    });

}