const Discord = require('discord.js');
const { missingPerms, hasPerms } = require('../../Util/missingPerms.js');
const { formatTime } = require('../../Util/utils.js');

module.exports.run = async(bot, message, prefix) => {

    const args = message.content.slice(bot.config.prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    let command;

    if(bot.commands.has(commandName)) command = bot.commands.get(commandName);
    else if(bot.aliases.has(commandName)) command = bot.commands.get(bot.aliases.get(commandName));
    else if(['credits', 'credit', 'madeby', 'owner'].includes(commandName)) return message.reply(bot.embed('This bot was made by **KokoNeot#9150**\nIf you\'re looking for a bot feel free to contact me or check out [my fiverr gigs](https://www.fiverr.com/share/plGPwZ)'))
    else return;
    
    const permArr = command.config.cmdPerms;
    const cmdName = command.config.command;

    if(message.channel.type != "DM"){
        if(!message.guild.me.permissions.has('SEND_MESSAGES')) 
            return console.log("No SEND_MESSAGES Permission - ", message.guild.name);

        if(permArr){
            const hasEmbedPerm = message.guild.me.permissionsIn(message.channel.id).has('EMBED_LINKS');
            if(!hasPerms(message, permArr, 'role')) 
                return missingPerms(cmdName, message, permArr, 'role', hasEmbedPerm);
            if(!hasPerms(message, permArr, 'channel')) 
                return missingPerms(cmdName, message, permArr, 'channel', hasEmbedPerm)
        }
    }

    if(command.config.args && !args.length) {
        let reply = `You didn\'t provide enough arguments for that command, ${message.author}`;
        if(command.config.usage)
            reply += `\nThe proper usage would be: \`\`\`\n${prefix}${command.config.command} ${command.config.usage}\`\`\``;

        return message.reply(bot.embed(reply));
    }

    if(bot.config.developers.includes(message.author.id)){
        try { command.run(bot, message, args, prefix) } catch(err) { console.log(err) }
        return;
    }
    const guildDB = bot.settings.get(interaction.guild.id) ?? {} 

    if(command.config.adminOnly && !message.member?.roles.cache.has(guildDB.adminRoleID))
        return

    if(command.config.permission && !message.member.permissions.has(command.config.permission))
        return message.reply(bot.embed(`To use command **${command.config.command}** you need ${command.config.permission} permission.`));
        
    if(command.config.devOnly)
        return message.reply(bot.embed(`Command **${command.config.command}** is only for developers.`))

    if(command.config.playing && !bot.players.has(message.guild.id))
        return message.reply(bot.embed('Nothing is playing. Play something first.'))
        
	if(command.config.inVC && !message.member.voice.channel) 
        return message.reply(bot.embed('You need to be in a voice channel to use that command'))

    if(command.config.sameChannel && !(!message.guild.me.voice?.channel || message.member.voice.channel.id == message.guild.me.voice?.channel?.id))
        return message.reply(bot.embed('You need to be in the same voice chat as the bot'))
        
        
    //----------------------------------------------------------------------------------
    //-----------------------------------COOLDOWN---------------------------------------
    roles:
    if(command.config.roles){
        for(let roleID of command.config.roles){
            for(let userRole of [...message.member.roles.cache.keys()]){
                if(roleID == userRole.id){
                    break roles;//do nothing this is work around so if you dont have the role you dont get the cooldown
                }
            }
        }
        return message.reply(bot.embed(`To use this command you need one of the following roles: **${command.config.roles.map(id => message.guild.roles.resolve(id).name).join(', ')}**`))
    }

    if(!bot.cooldowns.has(command.config.command))
        bot.cooldowns.set(command.config.command, new Discord.Collection());

    const now = Date.now();
    const timestamps = bot.cooldowns.get(command.config.command);
    const cooldownAmount = (command.config.cooldown || 0) * 1000;

    if(timestamps.has(message.author.id)) {
        const expDate = timestamps.get(message.author.id) + cooldownAmount;

        if(now < expDate){
            const timeLeft = expDate - now;
            const embed = new Discord.MessageEmbed()
                .setTitle("You're on cooldown")
                .setDescription(`You can use this command in **${formatTime(timeLeft)}**`)
                .setColor('RANDOM');

            return message.reply({embeds: [embed]});
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    
    if(command.config.roles)
        for(let roleID of command.config.roles)
            for(let userRole of [...message.member.roles.cache.keys()])
                if(roleID == userRole.id)
                    try { return command.run(bot, message, args) } catch (err) { return console.log("Unknown error", command.config.command) }

    //======================================================================
    try { 
        command.run(bot, message, args, prefix); 
    } catch (err) { 
        console.log("Unknown error", command.config.command); 
        message.reply("Unknown error"); 
    }
    //======================================================================
};