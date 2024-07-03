const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
        
	async run(bot, interaction) {
        const userDB = bot.db.get(interaction.user.id)
        if(!userDB) return interaction.reply({ content: 'You have no stats. Participate in a bingo game first.', ephemeral: true })

        interaction.reply({ content: `You have **${userDB.stats.wins.toLocaleString()}** wins out of **${userDB.stats.played.toLocaleString()}** games played.\nYou have **${userDB.balance.toLocaleString()}**${bot.config.tokenName}`, ephemeral: true })
	},

	config: {
		//adminOnly: true
	},
	
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('See your stats')
};