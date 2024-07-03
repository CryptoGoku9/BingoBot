const { createCanvas, loadImage } = require('canvas');
const { MessageAttachment } = require('discord.js');
const { iota, shuffle, sum, getCol, getAllFiles } = require("../utils")
const fs = require('fs');
const path = require('path');

const cards = getAllFiles(`.${path.sep}Storage`)


let CARDS = {};
(async () => {
    for(let c of cards) {
        if(!c.includes(path.sep)) continue
        const category = c.split(path.sep)[1]
        CARDS[category] ??= []
        CARDS[category].push(await loadImage(`.${path.sep}${c}`))
    }
    console.log('Loaded', Object.values(CARDS).flat().length, 'cards')
})()

const offsets = {
    GAP: 18,
    TOP: 520,
    SIDE: 94,
    F_WIDTH: 168,
    F_HEIGHT: 200
}


module.exports = class Player {
    constructor(member, game, category) {
        this.game = game
        this.member = member
        this.cooldown = 0
        this.board = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, -1, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ],
        this.card = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, -1, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]
        this.cardImage = CARDS[category].at(Math.random() * CARDS[category].length)
    }

    generate() {
        const cols = [[1, 15], [16, 30], [31, 45], [46, 60], [61, 75]].map(range => shuffle(iota(...range.reverse())))
        for(let i = 0; i < 5; i++){
            for(let j = 0; j < 5; j++){
                if(this.board[i][j] == 0) 
                    this.board[i][j] = cols[j].pop()
            }
        }
    }

    delay() {
        this.cooldown = Date.now() + 10_000
    }

    draw() {
        const canvas = createCanvas(1104, 1644)
        const ctx = canvas.getContext('2d')
        
        ctx.drawImage(this.cardImage, 0, 0, 1104, 1644)

        ctx.font = '128px sans'
        ctx.textAlign = 'center'
        
        let x_offset = offsets.F_WIDTH / 2
        let y_offset = offsets.F_HEIGHT / 2

        for(let i = 0; i < 5; i++){
            for(let j = 0; j < 5; j++){
                if(this.board[i][j] == -1) continue 
                let x = offsets.SIDE + x_offset + j * (offsets.F_WIDTH + offsets.GAP)
                let y = offsets.TOP + y_offset + i * (offsets.F_HEIGHT + offsets.GAP)
                if(this.card[i][j] == -1) {
                    ctx.fillStyle = '#eb3458'
                    ctx.beginPath()
                    ctx.arc(x, y - 50, offsets.F_WIDTH / 2 - 10, 0, 2 * Math.PI)
                    ctx.fill()
                }
                ctx.fillStyle = '#FFFFFF'
                ctx.fillText(this.board[i][j].toString(), x, y)
            }
        }

        return new MessageAttachment(canvas.toBuffer(), 'card.png')
    }

    dab(numbers) {
        const dabbed = []
        for(let i = 0; i < 5; i++){
            for(let j = 0; j < 5; j++){
                if(numbers.includes(this.board[i][j]) && this.card[i][j] != -1){
                    dabbed.push(this.board[i][j])
                    this.card[i][j] = -1 
                }
            }
        }
        return dabbed
    }

    bingo() {
        let card = this.card
        const diag1 = card.reduce((acc, v, i, a) => acc + a[i][i++], 0)
        let j = 5 - 1
        const diag2 = card.reduce((acc, v, i, a) => acc + a[i][j--], 0)

        const rows = card.reduce((acc, row) => acc + (sum(row) == -5), 0)
        const cols = [0, 1, 2, 3, 4].map(i => sum(card.map(o => o[i]))).reduce((acc, s) => acc + (s == -5), 0)
        const diags = (diag1 == -5) + (diag2 == -5)



        switch(this.game.mode) {
            case Mode.FullGame: {
                if(this.game.winners.length == 0) { // one line
                    return cols || rows || diags ? 'One line' : false
                }
                if(this.game.winners.length == 1) { // two line
                    return (cols + rows + diags) >= 2 ? 'Two line' : false
                }
                if(this.game.winners.length == 2) {
                    const total = this.card.reduce((acc, row) => acc + sum(row), 0)
                    return total == -25 ? 'Full house' : false
                }
                console.log('full game error', this.game.winnners)
                break
            }

            case Mode.Box: {
                const box = sum(card.at(0)) == -5 && sum(card.at(-1)) == -5 && sum(getCol(card, 0)) == -5 && sum(getCol(card, 4)) == -5
                return box ? 'Box' : false
            }

            case Mode.FullHouse: {
                const total = this.card.reduce((acc, row) => acc + sum(row), 0)
                return total == -25 ? 'Full house' : false
            }

            case Mode.X: {
                return diag1 == -5 && diag2 == -5 ? 'X' : false
            }

            case Mode.OneLine: {
                return cols || rows || diags ? 'One line' : false
            }

            case Mode.TwoLine: {
                return (cols + rows + diags) >= 2 ? 'Two line' : false
            }

            case Mode.FourCorners: {
                return (card[0][0] + card[4][0] + card[0][4] + card[4][4]) == -4 ? 'Four corners' : false
            }
        }
    }
}
