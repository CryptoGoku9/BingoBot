const Bingo = require('../Util/Bingo/Bingo.js');
const { createGuildDB } = require('../Util/utils.js');

module.exports = async (bot) => {
    require('../Handlers/SlashCommands.js')(bot);
    
    bot.user.setActivity(bot.config.activity, { type: 'PLAYING' })

    for(let guild of bot.guilds.cache.values()) {
        if(!bot.settings.has(guild.id)) 
            bot.settings.set(guild.id, createGuildDB(guild))
    }
    
    setInterval(async () => {
        const schedule = bot.schedule.all().map(db => ({ ...bot.schedule.get(db.ID), id: db.ID }))
        
        for(let game of schedule) {
            const d = new Date()
            let autoStartDelay = false
            if(game.interval == 'hourly' && d.getMinutes() == 0) autoStartDelay = 5
            else if(game.interval == 'daily' && d.getHours() == 9 && d.getMinutes() == 0) autoStartDelay = 60 //9am
            else if(game.interval == 'weekly' && d.getDay() == 1 && d.getHours() == 9 && d.getMinutes() == 0) autoStartDelay = 180 //Monday 9am
            else if(game.interval == 'monthly' && d.getDate() == 1 && d.getHours() == 9 && d.getMinutes() == 0) autoStartDelay = 360 //1st of month 9am
            
            if(!autoStartDelay) continue
            if(bot.bingos.has(game.channelID)) {
                console.log('Scheduled game not started, active bingo in channel', game)
                continue
            }
            const bingo = await Bingo.start(bot.channels.resolve(game.channelID), game.mode, bot.user, { autoStartDelay, reward: game.reward, delay: 5 })
            setTimeout(() => bingo.start(), autoStartDelay * 60_000)
        }
    }, 60_000)

    console.log(`${bot.user.tag} is Online`)
};

