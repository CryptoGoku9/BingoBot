const Discord = require('discord.js');

module.exports.run = async (bot, interaction, [action]) => {

    //Code Start
    const guildDB = bot.settings.get(interaction.guild.id) ?? {} 

    const bingo = bot.bingos.get(interaction.channel.id)
    if(!bingo) {
        interaction.reply({ content: 'This bingo is no longer valid', ephemeral: true })
        return interaction.message.delete()
    }

    const admin = interaction.member.roles.cache.has(guildDB.adminRoleID) || bingo.creatorID == interaction.user.id
    if(action == 'start') {
        if(!admin) return interaction.reply({ content: `You are not an admin.`, ephemeral: true })
        if(!bingo.players.size) return interaction.reply({ content: `No players joined`, ephemeral: true })
        if(bingo.delay && !bingo.autoStart) { 
            bingo.start()
            const row = new Discord.MessageActionRow().addComponents(
                new Discord.MessageButton({
                    label: 'Join',
                    style: 'SUCCESS',
                    customId: 'bingo_join'
                }),
                new Discord.MessageButton({
                    label: 'Starting soon',
                    style: 'PRIMARY',
                    customId: 'bingo_start',
                    disabled: true
                }),
                new Discord.MessageButton({
                    label: 'Cancel',
                    style: 'DANGER',
                    customId: 'bingo_cancel'
                })
            )
            await interaction.update({ components: [row]})
            return interaction.followUp({ content: 'Countdown started!', ephemeral: true });
        }
        if(bingo.autoStart) return interaction.reply({ content: `The game will automatically start <t:${Math.floor(bingo.autoStart/1000)}:R>`, ephemeral: true })
        bingo.start()
        return interaction.reply({ content: 'Started!', ephemeral: true })
    }
    if(action == 'cancel') {
        if(!admin) return interaction.reply({ content: `You are not an admin.`, ephemeral: true })

        bingo.end()
        return interaction.reply({ content: 'The game was canceled!', ephemeral: true })
    }
    if(action == 'finish') {
        if(!admin) return interaction.reply({ content: `You are not an admin.`, ephemeral: true })
        bot.bingos.delete(interaction.channel.id)
        interaction.message.delete()
        return interaction.reply({ content: 'Finished!', ephemeral: true })
    }

    if(action == 'pause') {
        if(!admin) return interaction.reply({ content: `You are not an admin.`, ephemeral: true })
        bingo.pause()
        return interaction.reply({ content: `Done`, ephemeral: true })
    }
    
    if(action == 'join') {
        let res = bingo.join(interaction.member)
        if(res) return interaction.reply({ content: 'You joined the game. Good luck!', ephemeral: true })
        return interaction.reply({ content: 'You left the game.', ephemeral: true })
    }

    if(bingo.state == State.Ended) 
        return interaction.reply({ content: `This bingo has already ended.`, ephemeral: true })

    if(action == 'board') {
        const player = bingo.players.get(interaction.user.id)
        if(!player) return interaction.reply({ content: `You are not participating in this game`, ephemeral: true })

        const card = await player.draw()
        const row = new Discord.MessageActionRow().addComponents(
            new Discord.MessageButton({
                label: 'Dab',
                style: 'PRIMARY',
                customId: 'bingo_dab'
            }),
            new Discord.MessageButton({
                label: 'Bingo',
                style: 'SUCCESS',
                customId: 'bingo_bingo'
            })
        )
        return interaction.reply({ content: `Here's your card! Good Luck!`, files: [card], components: [row], ephemeral: true })
    }

    if(action == 'dab') {
        const player = bingo.players.get(interaction.user.id)
        if(!player) return interaction.reply({ content: `You are not participating in this game`, ephemeral: true })
        let dabbed = player.dab(bingo.roller.rolled)
        if(dabbed.length) {
            const card = await player.draw()
            return interaction.update({ content: `Dabbed numbers: ${dabbed.join(', ')}`, files: [card], ephemeral: true })
        }
        return interaction.update({ content: `Dabbed numbers: None`, ephemeral: true })
    }

    if(action == 'bingo') {
        const player = bingo.players.get(interaction.user.id)
        if(!player) return interaction.reply({ content: `You are not participating in this game`, ephemeral: true })
        if(player.cooldown > Date.now())
            return interaction.reply({ content: `You are on cooldown. To avoing getting cooldown, press "Bingo" button only when you have a Bingo.`, ephemeral: true })

        const valid = player.bingo()
        if(valid) {
            interaction.reply(bot.embed(`${interaction.user} has a ${valid} bingo! Congratulations!`))
            bingo.setWinner(interaction.member)
        }else{
            interaction.reply({ content: `No BINGO to see here! Keep on Dabbin!`, ephemeral: true })
            player.delay()
        }
        return
    }
	//Code End

}

module.exports.config = {
    buttonID: "bingo",
}
