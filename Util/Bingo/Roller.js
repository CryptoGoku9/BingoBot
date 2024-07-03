const config = require('../../Config.json')
const { iota, shuffle, sleep } = require("../utils")

module.exports = class Roller {
    
    constructor(bingo) {
        this.bingo = bingo
        this.balls = shuffle(iota(75, 1))
        this.rolled = []
    }

    async *roll() {
        while(this.balls.length && this.bingo.state != State.Ended) {
            if(this.bingo.state == State.Paused) {
                await sleep(1000)
                continue
            }
            const roll = this.balls.pop()
            this.rolled.push(roll)
            yield roll
            await sleep(config.rollInterval * 1000)
        }

    }
}
