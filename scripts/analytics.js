// analytics.js
// Tracks and aggregates session stats

const analytics = {
    totalPlays: 0,
    organiserProfit: 0,
    playerTypes: { greedy: 0, moderate: 0, cautious: 0 },
    sessionResults: [],
    addPlay(type, profit) {
        this.totalPlays++;
        this.playerTypes[type]++;
        this.organiserProfit += profit;
        this.sessionResults.push({ type, profit });
    },
    reset() {
        this.totalPlays = 0;
        this.organiserProfit = 0;
        this.playerTypes = { greedy: 0, moderate: 0, cautious: 0 };
        this.sessionResults = [];
    }
};

export default analytics;
