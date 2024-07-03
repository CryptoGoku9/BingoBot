const { getFilesRecursive } = require('../Util/utils');

module.exports = (bot) => {
    
    let buttons = getFilesRecursive(`${process.cwd()}/Buttons`);
    console.log(buttons.length + ' buttons found');
    
    buttons.forEach(file => {      
        delete require.cache[require.resolve(file)];  
        let btn = require(file)
        bot.buttons.set(btn.config.buttonID, btn);

        let space = "";
        for(let i = 0; i < 30 - btn.config.buttonID.length; i++)  space += " ";
        console.log(`${btn.config.buttonID} ${space}loading...`)
    });

}