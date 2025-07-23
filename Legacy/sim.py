import random
import time  # Added import for typing effect

# Define constants
ENTRY_FEE = 5
RETRY_COST = 2
PRIZES = {1: 1, 2: 3, 3: 6, 4: 12, 5: 30}
PASS_CONDITIONS = {1: 2, 2: 3, 3: 4, 4: 5, 5: 6}
DIE_SIDES = 6
SLEEP_TIME = 0  # Global variable for sleep time

# Tracking totals
total_players = 0
total_income = 0
total_expenses = 0
total_profit = 0

def roll_die():
    return random.randint(1, DIE_SIDES)

def simulate_player(player_id):
    global total_players, total_income, total_expenses, total_profit

    total_players += 1
    income = ENTRY_FEE
    expense = 0
    level = 1
    used_retry = False
    history = []

    print(f"\n🎲 Player {player_id} begins their Lucky Ladders run!")
    time.sleep(SLEEP_TIME)

    while level <= 5:
        roll = roll_die()
        required = PASS_CONDITIONS[level]
        history.append(f"Level {level}: Rolled {roll} (Needed {required})")

        print(f"🎲 Rolling dice for Level {level}... Rolled {roll}")
        time.sleep(SLEEP_TIME)

        if roll >= required:
            if level == 5:
                print(f"🎉 Player {player_id} made it to Level 5 and won the jackpot of ${PRIZES[5]}!")
                time.sleep(SLEEP_TIME)
                expense += PRIZES[5]
                break
            else:
                decision = "continue"
                if level in [2, 3, 4]:
                    if random.random() < 0.1:
                        decision = "cash_out"
                if decision == "cash_out":
                    print(f"💰 Player {player_id} cashed out at Level {level} for ${PRIZES[level]}")
                    time.sleep(SLEEP_TIME)
                    expense += PRIZES[level]
                    break
                else:
                    print(f"➡️ Player {player_id} continues to Level {level + 1}.")
                    time.sleep(SLEEP_TIME)
                    level += 1
        else:
            if not used_retry and level > 1:
                used_retry = True
                income += RETRY_COST
                print(f"🔁 Player {player_id} failed Level {level}. Paid ${RETRY_COST} to retry from Level {level - 1}.")
                time.sleep(SLEEP_TIME)
                level -= 1
            else:
                print(f"❌ Player {player_id} failed and lost everything.")
                time.sleep(SLEEP_TIME)
                break

    profit = income - expense
    total_income += income
    total_expenses += expense
    total_profit += profit

    print("📜 Outcome Summary:")
    time.sleep(SLEEP_TIME)
    for event in history:
        print("  -", event)
        time.sleep(SLEEP_TIME / 2)  # Typing effect for each event
    print(f"💵 Income: ${income} | 🎁 Expenses: ${expense} | 🧾 Profit: ${profit}")
    time.sleep(SLEEP_TIME)

def run_simulation():
    player_counter = 1
    while True:
        try:
            num_players = int(input("\n👥 How many players would you like to simulate? (Enter 0 to end the fair): "))
        except ValueError:
            print("Please enter a valid number.")
            continue

        if num_players <= 0:
            print("\n📊 FINAL FAIR SUMMARY")
            print(f"👥 Total Players: {total_players}")
            print(f"💰 Total Income: ${total_income}")
            print(f"🎁 Total Expenses: ${total_expenses}")
            print(f"📈 Total Profit: ${total_profit}")
            break

        for _ in range(num_players):
            simulate_player(player_counter)
            player_counter += 1

        print("\n📊 CURRENT FAIR SUMMARY")
        print(f"👥 Players so far: {total_players}")
        print(f"💰 Income so far: ${total_income}")
        print(f"🎁 Expenses so far: ${total_expenses}")
        print(f"📈 Profit so far: ${total_profit}")

run_simulation()
