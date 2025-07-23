// Initialize local storage if not exists
if (!localStorage.getItem('transactions')) {
    localStorage.setItem('transactions', JSON.stringify([]));
}

// Event Listeners
document.getElementById('add-money-btn').addEventListener('click', function() {
    const amount = parseFloat(document.getElementById('amount-input').value);
    if (!isNaN(amount) && amount > 0) {
        addMoney(amount);
    } else {
        alert('Please enter a valid amount.');
    }
});

document.getElementById('remove-money-btn').addEventListener('click', function() {
    const amount = parseFloat(document.getElementById('amount-input').value);
    if (!isNaN(amount) && amount > 0) {
        removeMoney(amount);
    } else {
        alert('Please enter a valid amount.');
    }
});

document.getElementById('view-summary-btn').addEventListener('click', viewAccountSummary);

// Update account with transaction
function updateAccount(transactionType, amount) {
    const transactions = JSON.parse(localStorage.getItem('transactions'));
    transactions.push({ type: transactionType, amount: amount });
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Add money to account
function addMoney(amount) {
    updateAccount('add', amount);
    alert(`✅ Added $${amount} to the account.`);
    viewAccountSummary();
}

// Remove money from account
function removeMoney(amount) {
    updateAccount('remove', amount);
    alert(`✅ Removed $${amount} from the account.`);
    viewAccountSummary();
}

// View account summary
function viewAccountSummary() {
    const transactions = JSON.parse(localStorage.getItem('transactions'));
    let totalIncome = 0;
    let totalExpense = 0;
    let totalAdd = 0;
    let totalRemove = 0;
    
    for (const transaction of transactions) {
        const amount = parseFloat(transaction.amount);
        
        switch (transaction.type) {
            case 'income':
                totalIncome += amount;
                break;
            case 'expense':
                totalExpense += amount;
                break;
            case 'add':
                totalAdd += amount;
                break;
            case 'remove':
                totalRemove += amount;
                break;
        }
    }
    
    const balance = totalAdd - totalRemove + totalIncome - totalExpense;
    const profit = totalIncome - totalExpense;
    
    const summaryContent = document.getElementById('summary-content');
    summaryContent.innerHTML = `
        <p>💰 Total Income: $${totalIncome.toFixed(2)}</p>
        <p>🎁 Total Expense: $${totalExpense.toFixed(2)}</p>
        <p>➕ Total Added: $${totalAdd.toFixed(2)}</p>
        <p>➖ Total Removed: $${totalRemove.toFixed(2)}</p>
        <p>💵 Current Balance: $${balance.toFixed(2)}</p>
        <p>📈 Profit: $${profit.toFixed(2)}</p>
    `;
    
    return {
        totalIncome,
        totalExpense,
        totalAdd,
        totalRemove,
        balance,
        profit
    };
}

// Load account summary when the account tab is opened
document.querySelector('.tab-btn:nth-child(3)').addEventListener('click', viewAccountSummary);
