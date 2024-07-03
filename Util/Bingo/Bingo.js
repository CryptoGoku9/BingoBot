const { Collection } = require("discord.js")
const { sleep } = require("../utils")
const Discord = require('discord.js')
const config = require('../../Config.json')

const Player = require("./Player")
const Roller = require("./Roller")
const Announcer = require("./Announcer")

const State = {
    Created: 1,
    Started: 2,
    Ended: 4,
    Paused: 8
}

const Mode = {
    OneLine: 1,
    TwoLine: 2,
    FullHouse: 4,
    FullGame: 1 | 2 | 4,
    X: 8,
    Box: 16,
    FourCorners: 32
}

const ModeNames = {
    [Mode.OneLine]: "One line",
    [Mode.TwoLine]: "Two line",
    [Mode.FullHouse]: "Full house",
    [Mode.FullGame]: "Full game",
    [Mode.X]: "X",
    [Mode.Box]: "Box",
    [Mode.FourCorners]: "Four corners"
}

global.Mode = Mode
global.ModeNames = ModeNames
global.State = State

const DelayStartIntervals = [
          1 * 60000,
          5 * 60000,
         10 * 60000,
         30 * 60000,
         60 * 60000,
     3 * 60 * 60000,
     6 * 60 * 60000,
    12 * 60 * 60000,
    24 * 60 * 60000,
]

/**
 * @param settings The settings for the bingo game
 * @param settings.mode The gamemode. Default is Mode.OneLine
 * @param settings.reward The point reward. Default from config.bucks.win
 * @param settings.delay The delay before the game starts after pressing start button. Default is 0
 * @param settings.scheduled The time in minutes when the game will start. Default is false
 */
module.exports = class Bingo {

    constructor(owner, channel, message, settings = {}) {
        Object.defineProperty(this, 'bot', { value: owner.client })
        this.announcer = new Announcer(this, channel, message)
        this.state = State.Created
        this.roller = new Roller(this) //can do dependency injection?
        this.players = new Collection()
        
        this.creatorID = owner.id
        this.created = Date.now()
        this.winners = []
        
        this.mode = settings.mode ?? Mode.OneLine
        this.reward = settings.reward ?? 0
        this.scheduled = settings.scheduled ?? false
	    this.delay = settings.delay ?? 0
        this.cardCollection = settings.cardCollection ?? 'BBB'

        this.autoStart
    }

    get guild() {
        return this.announcer.ch.guild
    }

    async delayStart() {
        this.announcer.gameStartIn(this.autoStart)
        this.announcer.tagPlayers()

        let idx = DelayStartIntervals.findIndex(n => n >= this.autoStart - Date.now()) - 1
	    if (idx >= 1) idx = 0

        await sleep(this.autoStart - Date.now() - DelayStartIntervals[idx])
        for (let delay of DelayStartIntervals.slice(0, idx).reverse()) {
            if (this.state == State.Ended) break

            this.announcer.gameStartIn(this.autoStart)
            this.announcer.tagPlayers()
            await sleep(delay)
        }

        if (this.state != State.Ended) {
            this.announcer.gameStartIn(this.autoStart, 'Last call! ')
            this.announcer.tagPlayers()
            await sleep(DelayStartIntervals[0])
        }
    }

    async start() {
        if (this.delay && this.state == State.Created) {
            this.autoStart = Date.now() + this.delay * 60_000;
            await this.delayStart()
            if(!this.players.size) this.end()
        }

        if (this.state != State.Ended) {
		    this.state = State.Started
	 
	        await this.announcer.startGame()
	        this.players.forEach(p => p.generate())

	        await sleep(config.rollInterval * 1000)
            for await (const rolled of this.roller.roll()) {
                this.announcer.updateStarted(this.roller, true, rolled)
            }
            this.announcer.updateStarted(this.roller, false)
            if(this.state != State.Ended) this.end()
	    }
    }

    pause() {
        if(this.state == State.Created) {
            this.announcer.pause()
            this.state = State.Paused
        } else {
            this.announcer.resume()
            this.state = State.Created
        } 
    }

    end() {
        this.announcer.end(this.scheduled)
        this.state = State.Ended
        this.bot.emit('bingoEnd', this)
        if(this.scheduled) this.bot.bingos.delete(this.announcer.ch.id)
    }

    join(member) {
        const joined = this.players.has(member.id)

        if(joined) this.players.delete(member.id)
        else this.players.set(member.id, new Player(member, this, this.cardCollection))

        this.announcer.updateCreated()
        return !joined
    }

    setWinner(member) {
        switch(this.mode) {
            case Mode.FullGame: {
                if(this.winners.length == 0) this.winners.push({ text: `One line winner is ${member.user}`, member })
                else if(this.winners.length == 1) this.winners.push({ text: `Two line winner is ${member.user}`, member })
                else if(this.winners.length == 2) {
                    this.winners.push({ text: `Full House winner is ${member.user}`, member })
                    this.end()
                }
                return
            }

            case Mode.Box: {
                this.winners.push({ text: `Box winner is ${member.user}`, member })
                break
            }

            case Mode.FullHouse: {
                this.winners.push({ text: `Full House winner is ${member.user}`, member })
                break
            }

            case Mode.X: {
                this.winners.push({ text: `X winner is ${member.user}`, member })
                break
            }

            case Mode.OneLine: {
                this.winners.push({ text: `One line winner is ${member.user}`, member })
                break
            }

            case Mode.TwoLine: {
                this.winners.push({ text: `Two line winner is ${member.user}`, member })
                break
            }

            case Mode.FourCorners: {
                this.winners.push({ text: `Four corners winner is ${member.user}`, member })
                break
            } 
        }
        this.end()
    }

    static async start(channel, mode, creator, { delay, reward, autoStartDelay }) {
        const guildDB = channel.client.settings.get(channel.guild.id)
        const payload = Announcer.startMessage(mode, new Map(), reward, { delay, autoStartDelay })
        const startMessage = await channel.send(payload)
        channel.client.bingos.set(channel.id, new Bingo(creator, channel, startMessage, { mode, reward, delay, scheduled: autoStartDelay, cardCollection: guildDB.collection }))
        return channel.client.bingos.get(channel.id)
    }
}