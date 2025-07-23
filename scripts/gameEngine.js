// gameEngine.js
// Handles game logic and flow

import playerState from './playerState.js';
import { diceProbabilities, coinProbabilities } from './probabilityModel.js';
import analytics from './analytics.js';
import values from './values.js';

const gameEngine = {
    mode: null,
    isActive: false,
    get prizes() {
        return values.prizes;
    },
    set prizes(val) {
        values.prizes = val;
    },
    start(mode) {
        this.mode = mode;
        playerState.reset();
        playerState.mode = mode;
        this.isActive = true;
    },
    roll() {
        if (this.mode === 'dice') {
            return Math.ceil(Math.random() * 6);
        } else {
            return Math.random() < 0.5 ? 'heads' : 'tails';
        }
    },
    checkPass(result, level) {
        if (this.mode === 'dice') {
            const pass = [2, 3, 4, 5, 6][level - 1];
            return result >= pass;
        } else {
            return result === 'heads';
        }
    },
    getPrize(level) {
        return values.prizes[this.mode][level - 1];
    },
    canRetry() {
        return !playerState.retryUsed && playerState.currentLevel > 1;
    },
    useRetry() {
        playerState.useRetry();
    },
    cashOut() {
        // Player should get the prize for the last level they PASSED, not the current level (which is the next to attempt)
        const lastPassedLevel = Math.max(1, playerState.currentLevel - 1);
        const prize = this.getPrize(lastPassedLevel);
        playerState.cashOut(prize);
        this.isActive = false;
        return lastPassedLevel === 5 ? 'jackpot' : 'cashed';
    },
    fail() {
        playerState.fail();
        this.isActive = false;
    },
    nextLevel() {
        playerState.currentLevel++;
        if (playerState.currentLevel > 5) {
            // Jackpot!
            const prize = this.getPrize(5);
            playerState.cashOut(prize);
            this.isActive = false;
            return 'jackpot';
        }
        return 'continue';
    }
};

export default gameEngine;
