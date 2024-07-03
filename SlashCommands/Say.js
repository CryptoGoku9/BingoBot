const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
        
	async run(bot, interaction) {
        const text = interaction.options.getString('text')
        interaction.channel.send(bot.embed(text))
        interaction.reply({ content: `Message was sent`, ephemeral: true })
	},

	config: {
		adminOnly: true
	},
	
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('Sends a message in an embed')
        .addStringOption(o => o
            .setName('text')
            .setDescription('The text to send')
            .setRequired(true)    
        )
};