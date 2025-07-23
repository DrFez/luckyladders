// Show game container when Start Playing is clicked
document.addEventListener('DOMContentLoaded', function() {
    const startPlayingBtn = document.getElementById('start-playing-btn');
    const gameRules = document.querySelector('.game-rules');
    const gameContainer = document.querySelector('.game-container');
    
    startPlayingBtn.addEventListener('click', function() {
        gameRules.style.display = 'none';
        gameContainer.style.display = 'flex';
        initGame(); // Initialize the game when starting
    });
});

// Constants
const ENTRY_FEE = 5;
const RETRY_COST = 2;
const PRIZES = {1: 1, 2: 3, 3: 6, 4: 12, 5: 30};
const PASS_CONDITIONS = {1: 2, 2: 3, 3: 4, 4: 5, 5: 6};
const DIE_SIDES = 6;

// Game variables
let income = ENTRY_FEE;
let expense = 0;
let level = 1;
let usedRetry = false;
let gameState = "ready";  // ready, rolling, decision, game_over

// DOM Elements
const diceCanvas = document.getElementById('dice-canvas');
const ctx = diceCanvas.getContext('2d');
const levelDisplay = document.getElementById('level-display');
const gameMessage = document.getElementById('game-message');
const gameHistory = document.getElementById('game-history');
const cashoutBtn = document.getElementById('cashout-btn');
const continueBtn = document.getElementById('continue-btn');

// Initialize the game
function initGame() {
    income = ENTRY_FEE;
    expense = 0;
    level = 1;
    usedRetry = false;
    gameState = "ready";
    
    levelDisplay.textContent = level;
    gameHistory.innerHTML = '<p>🎲 Starting the game!</p><p>💰 Entry Fee: $' + ENTRY_FEE + '</p>';
    gameMessage.textContent = "Click the dice to roll!";
    
    cashoutBtn.disabled = true;
    continueBtn.disabled = true;
    
    drawDice(1);
    
    // Add click event for dice
    diceCanvas.addEventListener('click', () => {
        if (gameState === "ready") {
            progressGame();
        }
    });
}

// Draw the dice with given value
function drawDice(value) {
    ctx.clearRect(0, 0, diceCanvas.width, diceCanvas.height);
    
    // Draw dice outline
    ctx.fillStyle = 'white';
    ctx.fillRect(10, 10, diceCanvas.width - 20, diceCanvas.height - 20);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, diceCanvas.width - 20, diceCanvas.height - 20);
    
    // Define dot positions
    const dotPositions = {
        1: [[75, 75]],
        2: [[40, 40], [110, 110]],
        3: [[40, 40], [75, 75], [110, 110]],
        4: [[40, 40], [40, 110], [110, 40], [110, 110]],
        5: [[40, 40], [40, 110], [75, 75], [110, 40], [110, 110]],
        6: [[40, 40], [40, 75], [40, 110], [110, 40], [110, 75], [110, 110]]
    };
    
    // Draw dots
    ctx.fillStyle = 'black';
    for (const [x, y] of dotPositions[value]) {
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Animate dice roll
function animateRoll(finalValue) {
    return new Promise(resolve => {
        gameState = "rolling";
        let frames = 10;
        let frameCount = 0;
        
        const rollInterval = setInterval(() => {
            const tempValue = Math.floor(Math.random() * DIE_SIDES) + 1;
            drawDice(tempValue);
            
            frameCount++;
            if (frameCount >= frames) {
                clearInterval(rollInterval);
                drawDice(finalValue);
                gameState = "decision";
                resolve();
            }
        }, 100);
    });
}

// Progress the game
async function progressGame() {
    const required = PASS_CONDITIONS[level];
    const roll = Math.floor(Math.random() * DIE_SIDES) + 1;
    
    await animateRoll(roll);
    
    // Update message and history
    gameMessage.textContent = `You rolled ${roll}. You need ${required} to pass level ${level}.`;
    addToHistory(`🎲 Level ${level}: Rolled ${roll} (Needed ${required})`);
    
    // Check result
    if (roll >= required) {
        if (level === 5) {
            // Won the jackpot
            expense += PRIZES[5];
            gameMessage.textContent = `🎉 You made it to Level 5 and won the jackpot of $${PRIZES[5]}!`;
            addToHistory(gameMessage.textContent);
            gameOver();
        } else {
            // Passed the level, can continue or cash out
            gameMessage.textContent = `You passed Level ${level}! Continue to Level ${level+1} or cash out with $${PRIZES[level]}?`;
            
            // Enable decision buttons
            cashoutBtn.disabled = false;
            continueBtn.disabled = false;
            
            cashoutBtn.onclick = () => cashOut(level);
            continueBtn.onclick = () => continueGame(level);
        }
    } else {
        // Failed the roll
        if (!usedRetry && level > 1) {
            usedRetry = true;
            income += RETRY_COST;
            
            gameMessage.textContent = `You failed Level ${level}. Pay $${RETRY_COST} to retry from Level ${level - 1}?`;
            addToHistory(`🔁 Failed Level ${level}. Paid $${RETRY_COST} to retry.`);
            
            // Set up buttons for retry decision
            continueBtn.disabled = false;
            cashoutBtn.disabled = false;
            
            continueBtn.textContent = "Retry";
            cashoutBtn.textContent = "Give Up";
            
            continueBtn.onclick = () => retryLevel();
            cashoutBtn.onclick = () => giveUp();
        } else {
            // Game over - failed with no retry available
            gameMessage.textContent = "❌ You failed and lost everything.";
            addToHistory(gameMessage.textContent);
            gameOver();
        }
    }
}

// Continue to next level
function continueGame() {
    level++;
    
    // Reset buttons
    cashoutBtn.disabled = true;
    continueBtn.disabled = true;
    cashoutBtn.textContent = "Cash Out";
    continueBtn.textContent = "Continue";
    
    // Update level display
    levelDisplay.textContent = level;
    
    // Update message
    gameMessage.textContent = `Moving to Level ${level}. Click the dice to roll!`;
    addToHistory(`➡️ Continuing to Level ${level}.`);
    
    gameState = "ready";
}

// Cash out
function cashOut(currentLevel) {
    expense += PRIZES[currentLevel];
    
    gameMessage.textContent = `💰 You cashed out at Level ${currentLevel} for $${PRIZES[currentLevel]}`;
    addToHistory(gameMessage.textContent);
    
    gameOver();
}

// Retry from previous level
function retryLevel() {
    level--;
    
    // Reset buttons
    cashoutBtn.disabled = true;
    continueBtn.disabled = true;
    cashoutBtn.textContent = "Cash Out";
    continueBtn.textContent = "Continue";
    
    // Update level display
    levelDisplay.textContent = level;
    
    // Update message
    gameMessage.textContent = `Going back to Level ${level}. Click the dice to roll!`;
    
    gameState = "ready";
}

// Give up after failing a level
function giveUp() {
    gameMessage.textContent = "❌ You gave up and lost everything.";
    addToHistory(gameMessage.textContent);
    
    gameOver();
}

// End game and show summary
function gameOver() {
    gameState = "game_over";
    
    // Disable decision buttons
    cashoutBtn.disabled = true;
    continueBtn.disabled = true;
    
    // Calculate profit
    const profit = income - expense;
    
    // Show summary
    addToHistory(`\n💵 Income: $${income} | 🎁 Expenses: $${expense} | 🧾 Profit: $${profit}`);
    
    // Update account
    updateAccount("income", income);
    updateAccount("expense", expense);
    
    // Add "Play Again" button
    const playAgainBtn = document.createElement('button');
    playAgainBtn.textContent = "Play Again";
    playAgainBtn.onclick = initGame;
    playAgainBtn.style.marginTop = "10px";
    playAgainBtn.style.padding = "10px 20px";
    
    const buttonContainer = document.querySelector('.action-buttons');
    buttonContainer.appendChild(playAgainBtn);
}

// Add text to game history
function addToHistory(text) {
    const p = document.createElement('p');
    p.textContent = text;
    gameHistory.appendChild(p);
    gameHistory.scrollTop = gameHistory.scrollHeight;
}

// Tab functionality
function openTab(tabId) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // Deactivate all tabs
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabId).classList.add('active');
    
    // Highlight the clicked tab button
    event.currentTarget.classList.add('active');
}

// Initialize game when the page loads
window.addEventListener('load', initGame);
