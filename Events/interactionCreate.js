const Discord = require('discord.js')

module.exports = async (bot, interaction) => {
    const guildDB = bot.settings.get(interaction.guild.id) ?? {} 
    
    if(interaction.isCommand()){
        const command = bot.slashCommands.get(interaction.commandName);
        if(!command) return
        
        if(command.config?.devOnly && !bot.config.developers.includes(interaction.user.id))
            return interaction.reply({ content: 'This command is bot owner only', ephemeral: true })
        
        if(command.config?.adminOnly && (interaction.channel.type == 'DM' || !interaction.member.roles.cache.has(guildDB.adminRoleID)))
            return interaction.reply({ content: 'This command is admin only', ephemeral: true })
    
        if(command.config?.permission && (interaction.channel.type == 'DM' || !interaction.member.permissions.has(command.config.permission)))
            return interaction.reply({ content: `To use this command you need ${command.config.permission} permission`, ephemeral: true })
    
        if(command.config?.cooldown){
            if(!bot.cooldowns.has(interaction.commandName))
                bot.cooldowns.set(interaction.commandName, new Discord.Collection());
                
            const now = Date.now();
            const timestamps = bot.cooldowns.get(interaction.commandName);
            const cooldownAmount = (command.config.cooldown || 0) * 1000;
    
            if(cooldownAmount && timestamps.has(interaction.user.id)) {
                const expDate = timestamps.get(interaction.user.id) + cooldownAmount;
                if(now < expDate) return interaction.reply({ content: `You're on cooldown! You can use this command in **${formatTime( expDate - now)}**`, ephemeral: true });
            }
            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
        }
    
        try { await command.run(bot, interaction) } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: 'There was an error while executing this command!', 
                ephemeral: true 
            })
        }
        return
    }

    if(interaction.isButton()){ //https://discord.js.org/#/docs/main/13.0.1/class/ButtonInteraction
        let [btnCommand, ...data] = interaction.customId.split('_')
        const buttonCommand = bot.buttons.get(btnCommand)
        if(!buttonCommand) return
        
        return buttonCommand.run(bot, interaction, data)
    }
};

