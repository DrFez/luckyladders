// values.js
// Central store for all editable game values

const values = {
    prizes: {
        dice: [1, 3, 6, 12, 30],
        coin: [2, 4, 8, 16, 32]
    },
    entryFee: 5,
    retryFee: 2,
    attempts: 1,
    reset() {
        this.prizes.dice = [1, 3, 6, 12, 30];
        this.prizes.coin = [2, 4, 8, 16, 32];
        this.entryFee = 5;
        this.retryFee = 2;
        this.attempts = 1;
    }
};

export default values;
