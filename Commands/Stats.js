const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
        
	async run(bot, interaction) {
        const userDB = bot.db.get(interaction.user.id)
        if(!userDB) return interaction.reply({ content: 'You have no stats. Participate in a bingo game first.', ephemeral: true })

        userDB.stats[interaction.guild.id] ??= { wins: 0, played: 0 }

        interaction.reply({ content: 
            `XP: ${userDB.xp?.toLocaleString() ?? 0}\n` +
            `## Global Stats\n` +
            `You have **${userDB.stats.wins?.toLocaleString() ?? 0}** wins out of **${userDB.stats.played?.toLocaleString() ?? 0}** games played.\n` +
            `You have **${userDB.balance?.toLocaleString() ?? 0}**${bot.config.tokenName}\n\n` + 
            `## ${interaction.guild.name} Stats\n` +
            `You have **${userDB.stats[interaction.guild.id].wins?.toLocaleString() ?? 0}** wins out of **${userDB.stats[interaction.guild.id].played?.toLocaleString() ?? 0}** games played.`            
        , ephemeral: true })
	},

	config: {
		//adminOnly: true
	},
	
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('See your bingo stats')
};