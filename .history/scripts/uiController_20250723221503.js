// uiController.js
// Handles UI updates and user interaction

import gameEngine from './gameEngine.js';
import playerState from './playerState.js';
import { diceProbabilities, coinProbabilities, expectedValue } from './probabilityModel.js';
import analytics from './analytics.js';
import values from './values.js';

const ladderProgress = document.getElementById('ladder-progress');
const gameArea = document.getElementById('game-area');
const animationDiv = document.getElementById('animation');
const outcomeText = document.getElementById('outcome-text');
const prizePopup = document.getElementById('prize-popup');
const confetti = document.getElementById('confetti');
const resultsDiv = document.getElementById('results');
const rollBtn = document.getElementById('rollBtn');
const cashOutBtn = document.getElementById('cashOutBtn');
const retryBtn = document.getElementById('retryBtn');
const teacherModeCheckbox = document.getElementById('teacherMode');
const hackerBtn = document.getElementById('hackerBtn');
const hackerMenu = document.getElementById('hackerMenu');
const closeHacker = document.getElementById('closeHacker');
const applyHacks = document.getElementById('applyHacks');
const resetHacks = document.getElementById('resetHacks');
const normalDice = document.getElementById('normalDice');
const alwaysSix = document.getElementById('alwaysSix');
const alwaysOne = document.getElementById('alwaysOne');
const prizeInputs = [1,2,3,4,5].map(i=>document.getElementById('prize'+i));
const entryFeeInput = document.getElementById('entryFee');
const retryFeeInput = document.getElementById('retryFee');
const attemptsInput = document.getElementById('attempts');
const rulesBtn = document.getElementById('rulesBtn');
const rulesModal = document.getElementById('rulesModal');
const closeRules = document.getElementById('closeRules');

let teacherMode = false;

// Store defaults
const defaultPrizes = [1,3,6,12,30];
const defaultEntry = 5;
const defaultRetry = 2;
let diceMode = 'normal';
let attempts = 1;

// Bank account state
let organiserBank = 500;
let playerBank = 10;

function updateBanks() {
    const organiserSpan = document.getElementById('organiser-bank');
    const playerSpan = document.getElementById('player-bank');
    organiserSpan.textContent = `Organiser: $${organiserBank}`;
    playerSpan.textContent = `Player: $${playerBank}`;
    if (playerBank < 0) {
        playerSpan.classList.add('overdraft');
    } else {
        playerSpan.classList.remove('overdraft');
    }
}

// Patch game logic to update banks
function spend(amount) {
    playerBank -= amount;
    organiserBank += amount;
    updateBanks();
}
function payout(amount) {
    playerBank += amount;
    organiserBank -= amount;
    updateBanks();
}

function renderLadder() {
    const arr = playerState.mode === 'dice' ? values.prizes.dice : values.prizes.coin;
    ladderProgress.innerHTML = '';
    arr.forEach((prize, idx) => {
        const li = document.createElement('li');
        li.textContent = `Level ${idx + 1}: $${prize}`;
        if (playerState.currentLevel === idx + 1 && gameEngine.isActive) {
            li.classList.add('active');
        } else if (playerState.currentLevel > idx + 1 || (!gameEngine.isActive && playerState.totalWinnings >= prize)) {
            li.classList.add('complete');
        }
        ladderProgress.appendChild(li);
    });
}

function showGameArea(show) {
    gameArea.classList.toggle('hidden', !show);
}

function showResults() {
    let html = `<h2>Game Over</h2>`;
    if (playerState.totalWinnings > 0) {
        html += `<p>You won <strong>$${playerState.totalWinnings}</strong>!</p>`;
    } else {
        html += `<p>You lost. Better luck next time!</p>`;
    }
    html += `<p>Retry used: <strong>${playerState.retryUsed ? 'Yes' : 'No'}</strong></p>`;
    const organiserProfit = playerState.lastGameProfit;
    html += `<p>Net profit to organiser: <strong>${organiserProfit < 0 ? '-' : ''}$${Math.abs(organiserProfit)}</strong></p>`;
    if (teacherMode) {
        html += `<hr><h3>Session Analytics</h3>`;
        html += `<p>Total plays: ${analytics.totalPlays}</p>`;
        html += `<p>Organiser profit: $${analytics.organiserProfit}</p>`;
        html += `<p>Player types: Greedy (${analytics.playerTypes.greedy}), Moderate (${analytics.playerTypes.moderate}), Cautious (${analytics.playerTypes.cautious})</p>`;
        html += `<p>Expected Value (EV): $${expectedValue(playerState.mode).toFixed(2)}</p>`;
    }
    html += `<button class='close-btn' onclick='document.getElementById("results").classList.add("hidden")'>Close</button>`;
    resultsDiv.innerHTML = html;
    resultsDiv.classList.remove('hidden');
}

function resetUI() {
    outcomeText.textContent = '';
    prizePopup.classList.add('hidden');
    confetti.classList.add('hidden');
    resultsDiv.classList.add('hidden');
    renderLadder();
}

function playConfetti() {
    confetti.classList.remove('hidden');
    // Simple confetti effect (placeholder)
    confetti.innerHTML = '<span style="font-size:3rem;">🎉🎉🎉</span>';
    setTimeout(() => confetti.classList.add('hidden'), 2000);
}

function updateButtons() {
    rollBtn.disabled = !gameEngine.isActive;
    cashOutBtn.disabled = !gameEngine.isActive;
    retryBtn.disabled = !gameEngine.canRetry() || !gameEngine.isActive;
}

// --- SOUND EFFECTS ---
// Utility to stop all sounds
function stopAllSounds() {
    // Stop background music
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
    }
    // Stop and reset all SFX
    [
        'cute-level-up-1',
        'cute-level-up-2',
        'cute-level-up-3',
        'orchestral-win'
    ].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.pause();
            el.currentTime = 0;
        }
    });
}
// Utility to play a sound effect by id
function playSfx(id, stopAll = false) {
    if (stopAll) {
        stopAllSounds();
    }
    const el = document.getElementById(id);
    if (el) {
        el.currentTime = 0;
        el.play();
    }
}

function handleRoll() {
    const result = gameEngine.roll();
    let pass = gameEngine.checkPass(result, playerState.currentLevel);
    let resultText = '';
    if (playerState.mode === 'dice') {
        animationDiv.innerHTML = `<div class="dice">🎲 <span>${result}</span></div>`;
        resultText = `You rolled a <strong>${result}</strong>. `;
    } else {
        animationDiv.innerHTML = `<div class="coin">${result === 'heads' ? '🪙' : '❌'}</div>`;
        resultText = `You flipped <strong>${result}</strong>. `;
    }
    if (pass) {
        resultText += 'Success! Move up.';
        outcomeText.innerHTML = resultText;
        // --- PLAY SFX BASED ON LEVEL ---
        setTimeout(() => {
            const next = gameEngine.nextLevel();
            renderLadder();
            // Play SFX for the level just passed
            const lvl = playerState.currentLevel - 1;
            if (next === 'jackpot') {
                stopAllSounds(); // Only stop all for win
                playSfx('orchestral-win');
                prizePopup.textContent = 'JACKPOT! $' + gameEngine.getPrize(5);
                prizePopup.classList.remove('hidden');
                playConfetti();
                // Payout jackpot to player and deduct from organiser
                payout(playerState.totalWinnings);
                showResults();
                analytics.addPlay('greedy', -playerState.netProfit);
                // Disable all action buttons after jackpot
                rollBtn.disabled = true;
                cashOutBtn.disabled = true;
                retryBtn.disabled = true;
            } else {
                if (lvl === 1) playSfx('cute-level-up-1', false);
                else if (lvl === 2 || lvl === 3) playSfx('cute-level-up-2', false);
                else if (lvl === 4) playSfx('cute-level-up-3', false);
            }
        }, 800);
    } else {
        resultText += 'Fail!';
        outcomeText.innerHTML = resultText;
        if (gameEngine.canRetry()) {
            retryBtn.disabled = false;
        } else {
            setTimeout(() => {
                gameEngine.fail();
                showResults();
                analytics.addPlay('greedy', -playerState.netProfit);
            }, 800);
        }
    }
    updateButtons();
}

function handleCashOut() {
    const result = gameEngine.cashOut();
    const prize = playerState.totalWinnings;
    if (result === 'jackpot') {
        prizePopup.textContent = 'JACKPOT! $' + prize;
        prizePopup.classList.remove('hidden');
        playConfetti();
    } else {
        prizePopup.textContent = `You cashed out: $${prize}`;
        prizePopup.classList.remove('hidden');
    }
    showResults();
    analytics.addPlay('moderate', -playerState.netProfit);
    updateButtons();
}

function handleRetry() {
    gameEngine.useRetry();
    retryBtn.disabled = true;
    outcomeText.textContent = 'Retry used! Dropped one level.';
    renderLadder();
    updateButtons();
}

function handleModeSelect(mode) {
    gameEngine.start(mode);
    resetUI();
    showGameArea(true);
    updateButtons();
    animationDiv.innerHTML = '';
    outcomeText.textContent = 'Good luck!';
    prizePopup.classList.add('hidden');
    resultsDiv.classList.add('hidden');
}

function handleTeacherModeToggle() {
    teacherMode = teacherModeCheckbox.checked;
    resetUI();
}

// HACKER MENU LOGIC
function openHackerMenu() {
    // Set current values
    const p = gameEngine.prizes.dice;
    prizeInputs.forEach((el,i)=>el.value=p[i]);
    entryFeeInput.value = playerState.entryFee;
    retryFeeInput.value = playerState.retryFee;
    attemptsInput.value = attempts;
    normalDice.checked = diceMode==='normal';
    alwaysSix.checked = diceMode==='six';
    alwaysOne.checked = diceMode==='one';
    hackerMenu.classList.remove('hidden');
}
function closeHackerMenu() {
    hackerMenu.classList.add('hidden');
}
function applyHackerSettings() {
    // Dice weighting
    if(alwaysSix.checked) diceMode='six';
    else if(alwaysOne.checked) diceMode='one';
    else diceMode='normal';
    // Prizes
    values.prizes.dice = prizeInputs.map(el=>Number(el.value)||0);
    // Entry/Retry
    values.entryFee = Number(entryFeeInput.value)||defaultEntry;
    values.retryFee = Number(retryFeeInput.value)||defaultRetry;
    // Attempts
    attempts = Math.max(1, Number(attemptsInput.value)||1);
    closeHackerMenu();
    renderLadder(); // Update sidebar
}
function resetHackerSettings() {
    diceMode = 'normal';
    values.reset();
    attempts = 1;
    openHackerMenu();
    renderLadder(); // Update sidebar
}
// Override gameEngine.roll for dice mode
const origRoll = gameEngine.roll.bind(gameEngine);
gameEngine.roll = function() {
    if(this.mode==='dice') {
        if(diceMode==='six') return 6;
        if(diceMode==='one') return 1;
    } else if (this.mode==='coin') {
        if(diceMode==='six') return 'heads';
        if(diceMode==='one') return 'tails';
    }
    return origRoll();
};

// Integrate with game actions
const origStart = gameEngine.start.bind(gameEngine);
gameEngine.start = function(mode) {
    origStart(mode);
    // Deduct entry fee at start
    spend(values.entryFee);
};
const origUseRetry = gameEngine.useRetry.bind(gameEngine);
gameEngine.useRetry = function() {
    origUseRetry();
    spend(values.retryFee);
};
const origCashOut = gameEngine.cashOut.bind(gameEngine);
gameEngine.cashOut = function() {
    const result = origCashOut();
    if (playerState.totalWinnings > 0) {
        payout(playerState.totalWinnings);
    }
    return result;
};
const origFail = gameEngine.fail.bind(gameEngine);
gameEngine.fail = function() {
    origFail();
    // No payout on fail
    updateBanks();
};

// Event listeners
rollBtn.addEventListener('click', handleRoll);
cashOutBtn.addEventListener('click', handleCashOut);
retryBtn.addEventListener('click', handleRetry);
document.getElementById('diceMode').addEventListener('click', () => handleModeSelect('dice'));
document.getElementById('coinMode').addEventListener('click', () => handleModeSelect('coin'));
teacherModeCheckbox.addEventListener('change', handleTeacherModeToggle);
hackerBtn.addEventListener('click', openHackerMenu);
closeHacker.addEventListener('click', closeHackerMenu);
applyHacks.addEventListener('click', applyHackerSettings);
resetHacks.addEventListener('click', resetHackerSettings);
rulesBtn.addEventListener('click', () => rulesModal.classList.remove('hidden'));
closeRules.addEventListener('click', () => rulesModal.classList.add('hidden'));

// Add SFX audio elements to DOM if not present
['cute-level-up-1','cute-level-up-2','cute-level-up-3','orchestral-win'].forEach(id => {
    if (!document.getElementById(id)) {
        const audio = document.createElement('audio');
        audio.id = id;
        audio.src = `assets/sounds/${id}.mp3`;
        audio.preload = 'auto';
        audio.style.display = 'none';
        document.body.appendChild(audio);
    }
});

// Initial UI setup
showGameArea(false);
resetUI();
updateButtons();
updateBanks();
