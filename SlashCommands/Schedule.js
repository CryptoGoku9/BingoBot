const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const { Mode } = require('../Util/Bingo');

module.exports = {
        
	async run(bot, interaction) {
        const channel = interaction.options.getChannel('channel')
        const cmd = interaction.options.getSubcommand()

        if(cmd == 'add') {
            if(bot.schedule.has(channel.id)) 
                return interaction.reply({ content: 'There is already scheduled bingo game in this channel', ephemeral: true })
    
            if(bot.bingos.has(channel.id)) 
                return interaction.reply({ content: 'There is already active bingo game in this channel', ephemeral: true })
    
            const mode = interaction.options.getInteger('mode')
            const reward = interaction.options.getInteger('reward')
            const interval = interaction.options.getString('interval')
    
            bot.schedule.set(channel.id, { channelID: channel.id, mode, reward, interval })
            
            interaction.reply({ content: `Scheduled bingo game in ${channel}`, ephemeral: true })
        } 

        if(cmd == 'remove') {
            if(!bot.schedule.has(channel.id)) 
                return interaction.reply({ content: 'There is no scheduled bingo game in this channel', ephemeral: true })

            bot.schedule.delete(channel.id)
            return interaction.reply({ content: `Removed scheduled bingo game in ${channel}`, ephemeral: true })
    
        }
        
	},

	config: {
		devOnly: true, 
	},
	
	data: new SlashCommandBuilder()
		.setName('schedule')
		.setDescription('Schedule a bingo game')
        .addSubcommand(c => c
            .setName('add')
            .setDescription('Schedule a bingo game')
            .addChannelOption(o => o
                .setName('channel')
                .setDescription('The channel to schedule the game in')
                .setRequired(true)
            )
            .addIntegerOption(o => o
                .setName('mode')
                .setDescription('The gamemode to play')
                .setRequired(true)
                .addChoices(
                    ...Object.entries(Mode).map(o => ({ name: o[0], value: o[1] }))
                )
            )
            .addIntegerOption(o => o
                .setName('reward')
                .setDescription('The reward for winners')
                .setMinValue(1)   
                .setRequired(true) 
            )
            .addStringOption(o => o
                .setName('interval')
                .setDescription('The interval between games')
                .addChoices(
                    { name: 'Hourly', value: 'hourly' },
                    { name: 'Daily', value: 'daily' },
                    { name: 'Weekly', value: 'weekly' },
                    { name: 'Monthly', value: 'monthly' },
                )
                .setRequired(true) 
            )    
        )
        .addSubcommand(c => c
            .setName('remove')
            .setDescription('Remove a scheduled bingo game')
            .addChannelOption(o => o
                .setName('channel')
                .setDescription('The channel to remove the game from')
                .setRequired(true)
            )
        )
};