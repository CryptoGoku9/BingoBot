const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const fs = require('fs')

const collections = fs.readdirSync("./Storage")

module.exports = {
        
	async run(bot, interaction) {
        const cmd = interaction.options.getSubcommand()
        const guildDB = bot.settings.get(interaction.guild.id) ?? {}

        if(cmd == 'view') {
            const e = new Discord.MessageEmbed()
                .setTitle('Settings')
                .setDescription(
                    `Admin role: ${guildDB.adminRoleID ? `<@&${guildDB.adminRoleID}>` : 'Not set'}\n` +
                    `Game role: ${guildDB.gameRoleID ? `<@&${guildDB.gameRoleID}>` : 'Not set'}`
                )
                .setColor('RANDOM')

            return interaction.reply({ embeds: [e], ephemeral: true })
        }

        if(cmd == 'set') {
            const adminRole = interaction.options.getRole('admin-role')
            const gameRole = interaction.options.getRole('game-role')

            adminRole && (guildDB.adminRoleID = adminRole.id)
            gameRole && (guildDB.gameRoleID = gameRole.id)

            bot.settings.set(interaction.guild.id, guildDB)
            return interaction.reply({ content: `Settings was saved!`, ephemeral: true })
        }

        if(cmd == 'card-collection') {
            const collection = interaction.options.getString('collection')
            //if(!collections.includes(collection)) return interaction.reply({ content: `Collection \`${collection}\` doesn't exist!`, ephemeral: true })
            guildDB.collection = collection
            bot.settings.set(interaction.guild.id, guildDB)
            return interaction.reply({ content: `Collection was set to \`${collection}\``, ephemeral: true })
        }




	},

	config: {
        permission: 'ADMINISTRATOR',
	},
	
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('Configure the bot for your server')
        .addSubcommand(c => c
            .setName('view')
            .setDescription('View the current settings')    
        )
        .addSubcommand(c => c
            .setName('set')
            .setDescription('Set the settings')
            .addRoleOption(o => o
                .setName('admin-role')
                .setDescription('Admin role for managing games')
            )
            .addRoleOption(o => o
                .setName('game-role')
                .setDescription('Role that is required to start a new game. @everyone no restriction')
            )    
        )
        .addSubcommand(c => c
            .setName('card-collection')
            .setDescription('Set the card collection for the server')
            .addStringOption(o => o
                .setName('collection')
                .setDescription('The collection name')
                .setRequired(true)
                .addChoices(...collections.map(c => ({ name: c, value: c })))
            )    
        )
};