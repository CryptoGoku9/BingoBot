module.exports = async (bot, reaction, user) => {
    
    if(user.bot) return;
    if (reaction.partial) try { await reaction.fetch() } catch (error) { return console.log('Something went wrong when fetching the message: ', error) }
    
      
};