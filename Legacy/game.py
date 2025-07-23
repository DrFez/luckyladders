import csv
import random
import time

# Constants
ENTRY_FEE = 5
RETRY_COST = 2
PRIZES = {1: 1, 2: 3, 3: 6, 4: 12, 5: 30}
PASS_CONDITIONS = {1: 2, 2: 3, 3: 4, 4: 5, 5: 6}
DIE_SIDES = 6
SLEEP_TIME = 0.5  # Adjustable sleep time for typing effect
ACCOUNT_FILE = "/Users/colinferreira/Library/CloudStorage/OneDrive-GreatSouthernGrammar/Methods Inv 25/account.csv"

def roll_die():
    return random.randint(1, DIE_SIDES)

def update_account(transaction_type, amount):
    with open(ACCOUNT_FILE, mode='a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([transaction_type, amount])

def play_game():
    print("🎲 Welcome to Lucky Ladders!")
    print("💰 Entry Fee: $5 | 🔁 Retry Cost: $2")
    print("🎁 Prizes: Level 1: $1, Level 2: $3, Level 3: $6, Level 4: $12, Level 5: $30")
    time.sleep(SLEEP_TIME)

    income = ENTRY_FEE
    expense = 0
    level = 1
    used_retry = False

    print("\n🎲 Starting the game!")
    time.sleep(SLEEP_TIME)

    while level <= 5:
        roll = roll_die()
        required = PASS_CONDITIONS[level]
        print(f"🎲 Rolling dice for Level {level}... Rolled {roll} (Needed {required})")
        time.sleep(SLEEP_TIME)

        if roll >= required:
            if level == 5:
                print(f"🎉 You made it to Level 5 and won the jackpot of ${PRIZES[5]}!")
                expense += PRIZES[5]
                break
            else:
                decision = input(f"➡️ You passed Level {level}. Do you want to continue or cash out? (continue/cash_out): ").strip().lower()
                if decision == "cash_out":
                    print(f"💰 You cashed out at Level {level} for ${PRIZES[level]}")
                    expense += PRIZES[level]
                    break
                else:
                    print(f"➡️ Continuing to Level {level + 1}.")
                    level += 1
        else:
            if not used_retry and level > 1:
                used_retry = True
                income += RETRY_COST
                print(f"🔁 You failed Level {level}. Paid ${RETRY_COST} to retry from Level {level - 1}.")
                level -= 1
            else:
                print(f"❌ You failed and lost everything.")
                break

    profit = income - expense
    print(f"\n💵 Income: ${income} | 🎁 Expenses: ${expense} | 🧾 Profit: ${profit}")
    update_account("income", income)
    update_account("expense", expense)

if __name__ == "__main__":
    play_game()
