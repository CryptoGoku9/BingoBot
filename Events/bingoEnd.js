const Discord = require('discord.js');
const { getRoleID, createDB } = require('../Util/utils');

module.exports = async(bot, bingo) => {
    
    for(let { member } of bingo.winners) {
        if(!bot.db.has(member.id)) bot.db.set(member.id, createDB())

        bot.db.add(`${member.id}.balance`, bingo.reward)
        bot.db.add(`${member.id}.stats.wins`, 1)
        bot.db.add(`${member.id}.stats.${bingo.guild.id}.wins`, 1)

        if(bingo.guild.id == bot.config.mainServerID) {
            let userDB = bot.db.add(`${member.id}.xp`, bot.config.xp.win)

            let winRoles = getRoleID(bot.config.winRoles, 'wins', userDB.stats.wins ?? 0)
            if(winRoles.newRoleID && !member.roles.cache.has(winRoles.newRoleID)) member.roles.add(winRoles.newRoleID)
            if(winRoles.oldRoleID && member.roles.cache.has(winRoles.oldRoleID)) member.roles.remove(winRoles.oldRoleID)
        }
    }
    for(let player of bingo.players.values()) {
        if(!bot.db.has(player.member.id)) bot.db.set(player.member.id, createDB())

        if(!bingo.winners.some(w => w.member.id == player.member.id)) {
            bot.db.add(`${player.member.id}.balance`, bingo.reward != 0 ? bot.config.bucks.participate : 0)
            if(bingo.guild.id == bot.config.mainServerID) 
                bot.db.add(`${player.member.id}.xp`, bot.config.xp.participate)
        }
        bot.db.add(`${player.member.id}.stats.played`, 1)
        let userDB = bot.db.add(`${player.member.id}.stats.${bingo.guild.id}.played`, 1)

        
        if(bingo.guild.id == bot.config.mainServerID)  {
            if(bingo.reward) {
                let bucksRoles = getRoleID(bot.config.bucks.roles, 'balance', userDB.balance)
                if(bucksRoles.newRoleID && !player.member.roles.cache.has(bucksRoles.newRoleID)) player.member.roles.add(bucksRoles.newRoleID)
                if(bucksRoles.oldRoleID && player.member.roles.cache.has(bucksRoles.oldRoleID)) player.member.roles.remove(bucksRoles.oldRoleID)
            }
            let xpRoles = getRoleID(bot.config.xp.roles, 'xp', userDB.xp ?? 0)
            if(xpRoles.newRoleID && !player.member.roles.cache.has(xpRoles.newRoleID)) player.member.roles.add(xpRoles.newRoleID)
            if(xpRoles.oldRoleID && player.member.roles.cache.has(xpRoles.oldRoleID)) player.member.roles.remove(xpRoles.oldRoleID)

        }
    }
       


};