const path = require('path')
const { getFilesRecursive } = require('../Util/utils');

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

module.exports = async function(bot) {
    
    
    let commands = getFilesRecursive(`${process.cwd()}/Commands`);
    console.log(commands.length + ' commands found');

    let slashCommandsData = []
    
    commands.forEach(file => {      
        delete require.cache[require.resolve(file)];  
        let cmd = require(file)

        bot.slashCommands.set(cmd.data.name, cmd);
        slashCommandsData.push(cmd.data.toJSON())
        
        let space = "";
        for(let i = 0; i < 23 - cmd.data.name.length; i++)  space += " ";
        console.log(`${cmd.data.name} ${space}loading...`);//file.substring(file.lastIndexOf('/') + 1, file.length) == cmd name from path
        
    });

    const rest = new REST({ version: '9' }).setToken(bot.config.token);

    try {
        console.log('Started refreshing application (/) commands.');
        if(bot.config.globalSlashCommands){
            await rest.put(
                Routes.applicationCommands(bot.user.id), { 
                    body: slashCommandsData
                },
            );
        }else{
            await rest.put(
                Routes.applicationCommands(bot.user.id), { 
                    body: []
                },
            );  
        }
        if(bot.guilds.resolve(bot.config.slashCommandServerID)){
            await rest.put(
                Routes.applicationGuildCommands(bot.user.id, bot.config.slashCommandServerID), { 
                    body: slashCommandsData
                },
            );
        }

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
}

