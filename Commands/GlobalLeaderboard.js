const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
        
	async run(bot, interaction) {
        const cmd = interaction.options.getSubcommand()
        const top25 = bot.db.all().map(db => ({ ...bot.db.get(db.ID), id: db.ID }))
        
        if(cmd == 'tokens') {
            const e = new Discord.MessageEmbed()
                .setTitle('Top 25')
                .setDescription(top25.sort((a, b) => b.balance - a.balance).slice(0, 25).map((o, i) => `${i + 1}. <@${o.id}> ${o.balance ?? 0}${bot.config.tokenName} (${o.stats?.wins ?? 0} wins)`).join('\n') || 'No players to show yet!')
                .setColor('GOLD')
    
            interaction.reply({ embeds: [e] })
        }

        if(cmd == 'wins') {
            const e = new Discord.MessageEmbed()
                .setTitle('Top 25')
                .setDescription(top25.sort((a, b) => b.stats.wins - a.stats.wins).slice(0, 25).map((o, i) => `${i + 1}. <@${o.id}> ${o.stats?.wins ?? 0} wins out of ${o.stats.played ?? 0}`).join('\n') || 'No players to show yet!')
                .setColor('GOLD')

            interaction.reply({ embeds: [e] })
        }
	},

	config: {
		//adminOnly: true
	},
	
	data: new SlashCommandBuilder()
		.setName('global-leaderboard')
		.setDescription('Shows top 25 users across all servers')
        .addSubcommand(c => c
            .setName('tokens')
            .setDescription('Shows top 25 users with most tokens')
        )
        .addSubcommand(c => c
            .setName('wins')
            .setDescription('Shows top 25 users with most wins')
        )
};