const { SlashCommandBuilder } = require('@discordjs/builders');
const Bingo = require('../Util/Bingo/Bingo');

module.exports = {
        
	async run(bot, interaction) {
        const guildDB = bot.settings.get(interaction.guild.id) ?? {} 

        if(bot.bingos.has(interaction.channel.id)) 
            return interaction.reply({ content: 'There is already active bingo game in this channel.', ephemeral: true })

        if(bot.schedule.has(interaction.channel.id)) 
            return interaction.reply({ content: 'This channel is reserved for schedules games.', ephemeral: true })

        if(
            !interaction.member.roles.cache.has(guildDB.adminRoleID) &&
            !interaction.member.roles.cache.has(guildDB.gameRoleID)
        ) return interaction.reply({ content: `You need <@&${guildDB.gameRoleID}> role to start a bingo game!`, ephemeral: true })

        const mode = interaction.options.getInteger('mode')
        const delay = interaction.options.getInteger('delay') ?? 0
        const reward = interaction.guild.id == bot.config.mainServerID && guildDB.adminRoleID && interaction.member.roles.cache.has(guildDB.adminRoleID) ? interaction.options.getInteger('reward') : null

        await Bingo.start(interaction.channel, mode, interaction.user, { delay, reward })

        interaction.reply({ content: `Started bingo game`, ephemeral: true })
	},

	config: {
        //permission: "ADMINISTRATOR"
		//adminOnly: true
	},
	
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Start a game of bingo')
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
        )
        .addIntegerOption(o => o
            .setName('delay')
            .setDescription('Delay in minutes when the game will start')
            .setMinValue(1)    
        )
};
