const { MessageButton, MessageActionRow, MessageEmbed } = require("discord.js")
const config = require('../../Config.json')


module.exports = class Announcer {
    constructor(bingo, chat, menuMessage) {
        this.bingo = bingo
        this.channel = chat
        this.menuMessage = menuMessage
    }

    get ch() {
        return this.channel
    }

    get b() {
        return this.bingo
    }

    get menuEmbed() {
        return this.menuMessage.embeds[0]
    }


    async send(msg) {
        return await this.ch.send(typeof msg == 'string' ? { content: msg } : msg)
    }

    async updateStarted(roller, rolling, rolled) {
        this.menuEmbed.setDescription(
            `Mode: ${ModeNames[this.b.mode]}\n` +
            `${roller.balls.length + 1} balls left.\n` +
            `## Last Rolled ${rolled}\n` +
            `${roller.rolled.join(', ')}\n` +
            `${rolling ? 'Rolling...' : ''}`
        )
        
        this.menuMessage.edit({ embeds: [this.menuEmbed] }).catch(err => false)
    }

    async gameStartIn(ms, prefix) {
        const time = Math.floor(ms / 1000)
        this.ch.send(`${prefix ?? ''}The game will start <t:${time}:R> (<t:${time}>)`)
    }

    async tagPlayers() {
        this.ch.send(this.b.players.map((p, id) => `<@${id}>`).join(' ') || 'No players joined yet')
    }

    async startGame() {
        this.menuEmbed
	        .setTitle('The game has started')
	        .setDescription(`Mode: ${ModeNames[this.b.mode]}\n${this.b.roller.balls.length} balls left`)

        const row = new MessageActionRow().addComponents(
            new MessageButton({
                label: 'Board',
                style: 'SECONDARY',
                customId: 'bingo_board'
            }),
            new MessageButton({
                label: 'Pause/Resume',
                style: 'SECONDARY',
                customId: 'bingo_pause'
            }),
            new MessageButton({
                label: 'Cancel/Stop',
                style: 'DANGER',
                customId: 'bingo_cancel'
            })
        )
        await this.menuMessage.delete().catch(err => false)
        this.menuMessage = await this.ch.send({ embeds: [this.menuEmbed], components: [row] })
        await this.menuMessage.startThread({ name: 'Bingo', autoArchiveDuration: 60 })
    }

    async pause() {
        this.menuEmbed.setTitle('The game is paused')
        this.send(this.b.bot.embed('## Time to refill your drinks, we will be right back! ☕'))
        this.menuMessage.edit({ embeds: [this.menuEmbed] }).catch(err => false)
    }

    async resume() {
        this.menuEmbed.setTitle('The game is resumed')
        this.send(this.b.bot.embed('## Let\'s get them balls rolling 👀'))
        this.menuMessage.edit({ embeds: [this.menuEmbed] }).catch(err => false)
    }

    async end(scheduled) {
        const e = this.menuEmbed
            .setTitle('The game has ended')
        
        if (this.b.state != State.Started) e.setDescription('The game has been canceled')
        else e.setDescription(`${this.b.winners.map(o => `${o.text} ${this.b.reward} ${config.tokenName}`).join(`\n`) || 'No winners :('}\n\n# 🎉 Congratulations to the winners! 🎉`)

        const row = new MessageActionRow().addComponents(
            new MessageButton({
                label: 'Finish',
                style: 'DANGER',
                customId: 'bingo_finish'
            })
        )

        this.menuMessage.edit({ embeds: [e], components: scheduled ? [] : [row] }).catch(err => false)
    }

    async updateCreated() {
        const payload = Announcer.startMessage(this.b.mode, this.b.players, this.b.reward, { created: this.b.created, autoStartDelay: this.b.scheduled, delay: this.b.delay })

        this.menuMessage.edit(payload).catch(err => false)
    }

    static startMessage(mode, players, reward = 0, { delay = 0, autoStartDelay = 0, created = Date.now() }) {
        const startTime = Math.floor(created / 1000) + autoStartDelay * 60 + delay * 60
        const e = new MessageEmbed()
            .setTitle('Join to play bingo')
    //      .setDescription(`Mode: ${ModeNames[mode]}\n0 players\n${delay && `Starts <t:${Math.floor(Date.now() / 1000) + delay * 60}:R> (<t:${Math.floor(Date.now() / 1000) + delay * 60}>)`}`)
            .setColor('RANDOM')
            .setDescription(
                `### ${ModeNames[mode]}\n` +
                (reward ? `Reward: ${reward}\n` : '') +
                `${players.size} player(s)\n` +
                `${Array.from(players.keys()).slice(0, 25).map(id => `<@${id}>`).join('\n')}\n` +
                `${autoStartDelay 
                    ? `Yo Dabbers, The game starts <t:${startTime}:R> so register and then it's time to play BINGO🔥` //${formatTime(autoStartDelay * 60_000)}
                    : `Begins ${delay ? (`in ${delay} mins`) : (`immediately`)} after clicking 'Start'`}`)
    
        const row = new MessageActionRow().addComponents(
            new MessageButton({
                label: 'Join',
                style: 'SUCCESS',
                customId: 'bingo_join'
            }),
            new MessageButton({
                label: 'Start',
                style: 'PRIMARY',
                customId: 'bingo_start',
                disabled: autoStartDelay ? true : false
            }),
            new MessageButton({
                label: 'Cancel',
                style: 'DANGER',
                customId: 'bingo_cancel'
            })
        )
        return { embeds: [e], components: [row] }
    }
}