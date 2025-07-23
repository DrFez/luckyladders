// Simulation functionality
document.getElementById('start-sim-btn').addEventListener('click', runSimulation);

function runSimulation() {
    const numPlayers = parseInt(document.getElementById('num-players').value);
    
    if (isNaN(numPlayers) || numPlayers <= 0) {
        alert("Please enter a valid number of players greater than 0.");
        return;
    }
    
    const resultsContainer = document.getElementById('sim-results');
    resultsContainer.innerHTML = `<p>👥 Starting simulation for ${numPlayers} players...</p>`;
    
    let totalIncome = 0;
    let totalExpense = 0;
    
    // Use setTimeout to avoid blocking the UI
    setTimeout(() => {
        // Simulate each player
        for (let playerId = 1; playerId <= numPlayers; playerId++) {
            let income = ENTRY_FEE;
            let expense = 0;
            let level = 1;
            let usedRetry = false;
            let history = [];
            
            resultsContainer.innerHTML += `<p><strong>🎲 Player ${playerId} begins their Lucky Ladders run!</strong></p>`;
            
            // Play the game for this player
            while (level <= 5) {
                const roll = Math.floor(Math.random() * DIE_SIDES) + 1;
                const required = PASS_CONDITIONS[level];
                history.push(`Level ${level}: Rolled ${roll} (Needed ${required})`);
                
                resultsContainer.innerHTML += `<p>🎲 Rolling dice for Level ${level}... Rolled ${roll} (Needed ${required})</p>`;
                
                if (roll >= required) {
                    if (level === 5) {
                        resultsContainer.innerHTML += `<p>🎉 Player ${playerId} made it to Level 5 and won the jackpot of $${PRIZES[5]}!</p>`;
                        expense += PRIZES[5];
                        break;
                    } else {
                        // Randomly simulate caution (10% chance to cash out)
                        let decision = "continue";
                        if (level >= 2 && level <= 4) {
                            if (Math.random() < 0.1) {
                                decision = "cash_out";
                            }
                        }
                        
                        if (decision === "cash_out") {
                            resultsContainer.innerHTML += `<p>💰 Player ${playerId} cashed out at Level ${level} for $${PRIZES[level]}</p>`;
                            expense += PRIZES[level];
                            break;
                        } else {
                            resultsContainer.innerHTML += `<p>➡️ Player ${playerId} continues to Level ${level + 1}.</p>`;
                            level++;
                        }
                    }
                } else {
                    if (!usedRetry && level > 1) {
                        usedRetry = true;
                        income += RETRY_COST;
                        resultsContainer.innerHTML += `<p>🔁 Player ${playerId} failed Level ${level}. Paid $${RETRY_COST} to retry from Level ${level - 1}.</p>`;
                        level--;
                    } else {
                        resultsContainer.innerHTML += `<p>❌ Player ${playerId} failed and lost everything.</p>`;
                        break;
                    }
                }
            }
            
            const profit = income - expense;
            totalIncome += income;
            totalExpense += expense;
            
            resultsContainer.innerHTML += `<p><strong>📜 Outcome Summary:</strong></p>`;
            for (const event of history) {
                resultsContainer.innerHTML += `<p>  - ${event}</p>`;
            }
            resultsContainer.innerHTML += `<p>💵 Income: $${income} | 🎁 Expenses: $${expense} | 🧾 Profit: $${profit}</p>`;
            resultsContainer.innerHTML += `<hr>`;
        }
        
        const totalProfit = totalIncome - totalExpense;
        
        // Add final summary
        resultsContainer.innerHTML += `<h3>📊 FINAL SIMULATION SUMMARY</h3>`;
        resultsContainer.innerHTML += `<p>👥 Total Players: ${numPlayers}</p>`;
        resultsContainer.innerHTML += `<p>💰 Total Income: $${totalIncome}</p>`;
        resultsContainer.innerHTML += `<p>🎁 Total Expenses: $${totalExpense}</p>`;
        resultsContainer.innerHTML += `<p>📈 Total Profit: $${totalProfit}</p>`;
        
        // Update account
        updateAccount("income", totalIncome);
        updateAccount("expense", totalExpense);
        
        // Scroll to bottom to see results
        resultsContainer.scrollTop = resultsContainer.scrollHeight;
    }, 100);
}
