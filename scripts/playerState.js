// playerState.js
// Tracks player state for Lucky Ladders

import values from './values.js';

const playerState = {
    currentLevel: 1,
    retryUsed: false,
    totalWinnings: 0,
    netProfit: 0,
    mode: null, // 'dice' or 'coin'
    lastGameProfit: 0, // Track organiser profit for just the current game
    get entryFee() { return values.entryFee; },
    set entryFee(val) { values.entryFee = val; },
    get retryFee() { return values.retryFee; },
    set retryFee(val) { values.retryFee = val; },
    reset() {
        this.currentLevel = 1;
        this.retryUsed = false;
        this.totalWinnings = 0;
        this.mode = null;
        this.lastGameProfit = 0; // Track profit for last game only
    },
    useRetry() {
        this.retryUsed = true;
        this.currentLevel = Math.max(1, this.currentLevel - 1);
    },
    cashOut(prize) {
        this.totalWinnings = prize;
        // Net profit to organiser for this game only
        this.lastGameProfit = this.entryFee + (this.retryUsed ? this.retryFee : 0) - prize;
        this.netProfit += this.lastGameProfit;
    },
    fail() {
        this.totalWinnings = 0;
        this.lastGameProfit = this.entryFee + (this.retryUsed ? this.retryFee : 0);
        this.netProfit += this.lastGameProfit;
    }
};

export default playerState;
