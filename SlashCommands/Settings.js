const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
        
	async run(bot, interaction) {
        
        const adminRole = interaction.options.getRole('admin-role')
        const gameRole = interaction.options.getRole('game-role')

        const guildDB = bot.settings.get(interaction.guild.id) ?? {}

        adminRole && (guildDB.adminRoleID = adminRole.id)
        gameRole && (guildDB.gameRoleID = gameRole.id)

        bot.settings.set(interaction.guild.id, guildDB)

        interaction.reply({ content: `Settings was saved!`, ephemeral: true })
	},

	config: {
        permission: 'ADMINISTRATOR',
	},
	
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('Configure the bot for your server')
        .addRoleOption(o => o
            .setName('admin-role')
            .setDescription('Admin role for managing games')
        )
        .addRoleOption(o => o
            .setName('game-role')
            .setDescription('Role that is required to start a new game')
        )
};