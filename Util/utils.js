const fs = require('fs'); 
const path = require('path');

function getFilesRecursive(path, ignoreDir){
    let files = [];
    let dir = fs.readdirSync(path, {withFileTypes: true});
    dir.forEach(file => {
        if(file.isDirectory()){
            if(ignoreDir && ignoreDir.includes(file.name))
                return;
            files = files.concat(getFilesRecursive(`${path}/${file.name}`));    
            return;
        }
        files.push(`${path}/${file.name}`);
    });
    return files;
}

function formatTime(ms){
    let {d, h, m, s} = convertMiliseconds(ms);
    let timeStr = '';

    if(d){
        timeStr += `${d}days `;
        if(h)
            timeStr += `${h}h `;
        if(m)
            timeStr += `${m}m `;
        if(s)
            timeStr += `${s}s`
    }else{
        if(h)
            if(m || s)
                timeStr += `${h}:`;
            else
                timeStr += `${h}hours`;

        m = m.toString().length == 1 ? `0${m}` : m;
        s = s.toString().length == 1 ? `0${s}` : s;

        if(m || s)
            timeStr += `${m}:${s}`;
    }
    return timeStr;
}

function convertMiliseconds(miliseconds, format) {
    let days, hours, minutes, seconds, total_hours, total_minutes, total_seconds;
    
    total_seconds = parseInt(Math.floor(miliseconds / 1000));
    total_minutes = parseInt(Math.floor(total_seconds / 60));
    total_hours = parseInt(Math.floor(total_minutes / 60));
    days = parseInt(Math.floor(total_hours / 24));
  
    seconds = parseInt(total_seconds % 60);
    minutes = parseInt(total_minutes % 60);
    hours = parseInt(total_hours % 24);
    
    switch(format) {
      case 's':
          return total_seconds;
      case 'm':
          return total_minutes;
      case 'h':
          return total_hours;
      case 'd':
          return days;
      default:
          return { d: days, h:  hours, m: minutes, s: seconds };
    }
}

function iota(n, start = 0) {
    let a = []
    for(let i = start; i <= n; i++){
        a.push(i)
    }
    return a
}

function shuffle(array) {
    let currentIndex = array.length
    let randomIndex
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex--
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array
}

function sleep(ms) {
    return new Promise((resolve => setTimeout(resolve, ms)))
}

function sum(arr) {
    return arr.reduce((acc, v) => acc + v, 0)
}

function getCol(arr, i) {
    return arr.map(o => o[i])
}


function createDB() {
    return {
        balance: 0,
        xp: 0,
        stats: {
            played: 0,
            wins: 0
        }
    }
}
function createGuildDB(guild) {
    return {
        adminRoleID: false,
        gameRoleID: guild.id,
        collection: 'BBB'
    }
}

function getRoleID(roles, key, amount) {
    roles = roles.slice().reverse()
    const idx = roles.findIndex(entry => entry[key] <= amount)

    return { newRoleID: roles[idx]?.roleID, oldRoleID: roles.at(idx+1)?.roleID}
}

function getAllFiles(dirPath, arrayOfFiles) {
    files = fs.readdirSync(dirPath)
  
    arrayOfFiles = arrayOfFiles || []
  
    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
        } else {
            arrayOfFiles.push(path.join(dirPath, file))
        }
    })
  
    return arrayOfFiles
}


module.exports = {
    getFilesRecursive,
    formatTime,
    convertMiliseconds,
    iota,
    shuffle,
    sleep,
    sum,
    getCol,
    createDB,
    createGuildDB,
    getRoleID,
    getAllFiles,
}