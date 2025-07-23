// probabilityModel.js
// Handles probability and expected value calculations

const diceProbabilities = [
    { level: 1, pass: 5/6, prize: 1 },
    { level: 2, pass: 4/6, prize: 3 },
    { level: 3, pass: 3/6, prize: 6 },
    { level: 4, pass: 2/6, prize: 12 },
    { level: 5, pass: 1/6, prize: 30 }
];

const coinProbabilities = [
    { level: 1, pass: 0.5, prize: 2 },
    { level: 2, pass: 0.5, prize: 4 },
    { level: 3, pass: 0.5, prize: 8 },
    { level: 4, pass: 0.5, prize: 16 },
    { level: 5, pass: 0.5, prize: 32 }
];

function expectedValue(mode) {
    let ev = 0;
    let prob = 1;
    const arr = mode === 'dice' ? diceProbabilities : coinProbabilities;
    for (let i = 0; i < arr.length; i++) {
        prob *= arr[i].pass;
        ev += prob * arr[i].prize;
    }
    return ev;
}

export { diceProbabilities, coinProbabilities, expectedValue };
