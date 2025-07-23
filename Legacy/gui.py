import tkinter as tk
from tkinter import messagebox, simpledialog
import csv
import random
import time

# Constants
ACCOUNT_FILE = "/Users/colinferreira/Library/CloudStorage/OneDrive-GreatSouthernGrammar/Methods Inv 25/account.csv"
ENTRY_FEE = 5
RETRY_COST = 2
PRIZES = {1: 1, 2: 3, 3: 6, 4: 12, 5: 30}
PASS_CONDITIONS = {1: 2, 2: 3, 3: 4, 4: 5, 5: 6}
DIE_SIDES = 6

def update_account(transaction_type, amount):
    with open(ACCOUNT_FILE, mode='a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([transaction_type, amount])

def view_account_summary():
    total_income = 0
    total_expense = 0
    total_add = 0
    total_remove = 0

    try:
        with open(ACCOUNT_FILE, mode='r') as file:
            reader = csv.reader(file)
            next(reader)  # Skip header
            for row in reader:
                transaction_type, amount = row
                amount = float(amount)
                if transaction_type == "income":
                    total_income += amount
                elif transaction_type == "expense":
                    total_expense += amount
                elif transaction_type == "add":
                    total_add += amount
                elif transaction_type == "remove":
                    total_remove += amount

        balance = total_add - total_remove + total_income - total_expense
        profit = total_income - total_expense

        summary = (
            f"💰 Total Income: ${total_income}\n"
            f"🎁 Total Expense: ${total_expense}\n"
            f"➕ Total Added: ${total_add}\n"
            f"➖ Total Removed: ${total_remove}\n"
            f"💵 Current Balance: ${balance}\n"
            f"📈 Profit: ${profit}"
        )
        messagebox.showinfo("Account Summary", summary)
    except FileNotFoundError:
        messagebox.showerror("Error", "Account file not found. Please ensure the account file exists.")

def add_money(amount):
    update_account("add", amount)
    messagebox.showinfo("Success", f"✅ Added ${amount} to the account.")

def remove_money(amount):
    update_account("remove", amount)
    messagebox.showinfo("Success", f"✅ Removed ${amount} from the account.")

def play_game():
    # Create a new window for the game
    game_window = tk.Toplevel()
    game_window.title("Lucky Ladders Game")
    game_window.geometry("500x600")
    game_window.configure(bg="#f0f0f0")
    
    # Game variables
    income = ENTRY_FEE
    expense = 0
    level = 1
    used_retry = False
    game_state = "ready"  # ready, rolling, decision, game_over
    
    # Create game information display
    info_frame = tk.Frame(game_window, bg="#f0f0f0")
    info_frame.pack(pady=10, fill=tk.X)
    
    level_label = tk.Label(info_frame, text=f"Level: {level}", font=("Arial", 14, "bold"), bg="#f0f0f0")
    level_label.pack(side=tk.LEFT, padx=20)
    
    fee_label = tk.Label(info_frame, text=f"Entry Fee: ${ENTRY_FEE}", font=("Arial", 12), bg="#f0f0f0")
    fee_label.pack(side=tk.RIGHT, padx=20)
    
    # Create dice canvas
    dice_frame = tk.Frame(game_window, bg="#f0f0f0")
    dice_frame.pack(pady=20)
    
    dice_canvas = tk.Canvas(dice_frame, width=150, height=150, bg="white", highlightthickness=2, highlightbackground="black")
    dice_canvas.pack()
    
    # Create message display
    message_var = tk.StringVar()
    message_var.set("Click the dice to roll!")
    
    message_label = tk.Label(game_window, textvariable=message_var, font=("Arial", 12), wraplength=400, bg="#f0f0f0", height=4)
    message_label.pack(pady=10)
    
    # Create history display
    history_frame = tk.Frame(game_window, bg="#f0f0f0")
    history_frame.pack(pady=10, fill=tk.BOTH, expand=True)
    
    history_label = tk.Label(history_frame, text="Game History", font=("Arial", 12, "bold"), bg="#f0f0f0")
    history_label.pack()
    
    history_text = tk.Text(history_frame, height=10, width=50, wrap=tk.WORD)
    history_scrollbar = tk.Scrollbar(history_frame, command=history_text.yview)
    history_text.configure(yscrollcommand=history_scrollbar.set)
    
    history_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
    history_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=10)
    
    # Add starting message to history
    history_text.insert(tk.END, f"🎲 Starting the game!\n💰 Entry Fee: ${ENTRY_FEE}\n")
    
    # Create buttons frame
    buttons_frame = tk.Frame(game_window, bg="#f0f0f0")
    buttons_frame.pack(pady=10, fill=tk.X)
    
    # Create cashout button (initially disabled)
    cashout_button = tk.Button(buttons_frame, text="Cash Out", state=tk.DISABLED, width=15)
    cashout_button.pack(side=tk.LEFT, padx=20)
    
    # Create continue button (initially disabled)
    continue_button = tk.Button(buttons_frame, text="Continue", state=tk.DISABLED, width=15)
    continue_button.pack(side=tk.RIGHT, padx=20)

    # Function to draw dice based on value
    def draw_dice(value):
        dice_canvas.delete("all")
        
        # Draw the dice outline
        dice_canvas.create_rectangle(10, 10, 140, 140, fill="white", outline="black", width=2)
        
        # Define dot positions based on dice value
        dot_positions = {
            1: [(75, 75)],
            2: [(40, 40), (110, 110)],
            3: [(40, 40), (75, 75), (110, 110)],
            4: [(40, 40), (40, 110), (110, 40), (110, 110)],
            5: [(40, 40), (40, 110), (75, 75), (110, 40), (110, 110)],
            6: [(40, 40), (40, 75), (40, 110), (110, 40), (110, 75), (110, 110)]
        }
        
        # Draw the dots
        for x, y in dot_positions[value]:
            dice_canvas.create_oval(x-10, y-10, x+10, y+10, fill="black")
    
    # Draw initial empty dice
    draw_dice(1)
    
    # Function to animate dice roll
    def animate_roll(roll_value, frames=10):
        nonlocal game_state
        game_state = "rolling"
        
        for _ in range(frames):
            temp_value = random.randint(1, 6)
            draw_dice(temp_value)
            game_window.update()
            time.sleep(0.1)
        
        # Draw the final value
        draw_dice(roll_value)
        game_state = "decision"

    # Function to handle game progression
    def progress_game(roll=None):
        nonlocal level, used_retry, income, expense, game_state
        
        if game_state == "ready":
            # Get required roll value
            required = PASS_CONDITIONS[level]
            
            # Get a random roll or use provided value
            if roll is None:
                roll = random.randint(1, DIE_SIDES)
            
            # Animate the roll
            animate_roll(roll)
            
            # Update message and history
            message = f"You rolled {roll}. You need {required} to pass level {level}."
            message_var.set(message)
            history_text.insert(tk.END, f"🎲 Level {level}: Rolled {roll} (Needed {required})\n")
            history_text.see(tk.END)
            
            # Check result
            if roll >= required:
                if level == 5:
                    # Won the jackpot
                    expense += PRIZES[5]
                    message = f"🎉 You made it to Level 5 and won the jackpot of ${PRIZES[5]}!"
                    message_var.set(message)
                    history_text.insert(tk.END, message + "\n")
                    history_text.see(tk.END)
                    game_over()
                else:
                    # Passed the level, can continue or cash out
                    message = f"You passed Level {level}! Continue to Level {level+1} or cash out with ${PRIZES[level]}?"
                    message_var.set(message)
                    
                    # Enable decision buttons
                    cashout_button.config(
                        state=tk.NORMAL, 
                        command=lambda: cash_out(level)
                    )
                    continue_button.config(
                        state=tk.NORMAL, 
                        command=lambda: continue_game(level)
                    )
            else:
                # Failed the roll
                if not used_retry and level > 1:
                    used_retry = True
                    income += RETRY_COST
                    
                    message = f"You failed Level {level}. Pay ${RETRY_COST} to retry from Level {level - 1}?"
                    message_var.set(message)
                    history_text.insert(tk.END, f"🔁 Failed Level {level}. Paid ${RETRY_COST} to retry.\n")
                    history_text.see(tk.END)
                    
                    # Set up buttons for retry decision
                    continue_button.config(
                        state=tk.NORMAL, 
                        text="Retry",
                        command=lambda: retry_level()
                    )
                    cashout_button.config(
                        state=tk.NORMAL, 
                        text="Give Up",
                        command=lambda: give_up()
                    )
                else:
                    # Game over - failed with no retry available
                    message = f"❌ You failed and lost everything."
                    message_var.set(message)
                    history_text.insert(tk.END, message + "\n")
                    history_text.see(tk.END)
                    game_over()
    
    # Function to handle continuing to next level
    def continue_game(current_level):
        nonlocal level, game_state
        level += 1
        
        # Reset buttons
        cashout_button.config(state=tk.DISABLED, text="Cash Out")
        continue_button.config(state=tk.DISABLED, text="Continue")
        
        # Update level display
        level_label.config(text=f"Level: {level}")
        
        # Update message
        message = f"Moving to Level {level}. Click the dice to roll!"
        message_var.set(message)
        history_text.insert(tk.END, f"➡️ Continuing to Level {level}.\n")
        history_text.see(tk.END)
        
        game_state = "ready"
    
    # Function to handle cash out
    def cash_out(current_level):
        nonlocal expense
        expense += PRIZES[current_level]
        
        message = f"💰 You cashed out at Level {current_level} for ${PRIZES[current_level]}"
        message_var.set(message)
        history_text.insert(tk.END, message + "\n")
        history_text.see(tk.END)
        
        game_over()
    
    # Function to handle retry
    def retry_level():
        nonlocal level, game_state
        level -= 1
        
        # Reset buttons
        cashout_button.config(state=tk.DISABLED, text="Cash Out")
        continue_button.config(state=tk.DISABLED, text="Continue")
        
        # Update level display
        level_label.config(text=f"Level: {level}")
        
        # Update message
        message = f"Going back to Level {level}. Click the dice to roll!"
        message_var.set(message)
        
        game_state = "ready"
    
    # Function to handle giving up (when failed a level)
    def give_up():
        message = "❌ You gave up and lost everything."
        message_var.set(message)
        history_text.insert(tk.END, message + "\n")
        history_text.see(tk.END)
        
        game_over()
    
    # Function to end the game and show summary
    def game_over():
        nonlocal game_state
        game_state = "game_over"
        
        # Disable decision buttons
        cashout_button.config(state=tk.DISABLED)
        continue_button.config(state=tk.DISABLED)
        
        # Calculate profit
        profit = income - expense
        
        # Show summary
        summary = f"\n💵 Income: ${income} | 🎁 Expenses: ${expense} | 🧾 Profit: ${profit}"
        history_text.insert(tk.END, summary + "\n")
        history_text.see(tk.END)
        
        # Update account
        update_account("income", income)
        update_account("expense", expense)
        
        # Add "Play Again" button
        tk.Button(
            buttons_frame, 
            text="Play Again", 
            command=lambda: [game_window.destroy(), play_game()],
            width=15
        ).pack(pady=10)
    
    # Bind click on dice to roll
    dice_canvas.bind("<Button-1>", lambda e: progress_game() if game_state == "ready" else None)

def simulate_players():
    try:
        num_players = int(simpledialog.askstring("Simulation", "Enter the number of players to simulate:"))
        if num_players <= 0:
            messagebox.showerror("Error", "Number of players must be greater than 0.")
            return

        # Create a new window to display simulation results
        sim_window = tk.Toplevel()
        sim_window.title("Simulation Results")
        sim_window.geometry("600x500")
        
        # Create a scrollable text widget
        result_text = tk.Text(sim_window, wrap=tk.WORD, width=70, height=25)
        scrollbar = tk.Scrollbar(sim_window, command=result_text.yview)
        result_text.config(yscrollcommand=scrollbar.set)
        
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        result_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        total_income = 0
        total_expense = 0
        total_profit = 0

        result_text.insert(tk.END, f"👥 Starting simulation for {num_players} players...\n\n")
        
        for player_id in range(1, num_players + 1):
            income = ENTRY_FEE
            expense = 0
            level = 1
            used_retry = False
            history = []
            
            result_text.insert(tk.END, f"\n🎲 Player {player_id} begins their Lucky Ladders run!\n")
            sim_window.update()

            while level <= 5:
                roll = random.randint(1, DIE_SIDES)
                required = PASS_CONDITIONS[level]
                history.append(f"Level {level}: Rolled {roll} (Needed {required})")
                
                result_text.insert(tk.END, f"🎲 Rolling dice for Level {level}... Rolled {roll} (Needed {required})\n")
                sim_window.update()
                
                if roll >= required:
                    if level == 5:
                        result_text.insert(tk.END, f"🎉 Player {player_id} made it to Level 5 and won the jackpot of ${PRIZES[5]}!\n")
                        expense += PRIZES[5]
                        break
                    else:
                        # Randomly simulate caution (10% chance to cash out)
                        decision = "continue"
                        if level in [2, 3, 4]:
                            if random.random() < 0.1:
                                decision = "cash_out"
                        
                        if decision == "cash_out":
                            result_text.insert(tk.END, f"💰 Player {player_id} cashed out at Level {level} for ${PRIZES[level]}\n")
                            expense += PRIZES[level]
                            break
                        else:
                            result_text.insert(tk.END, f"➡️ Player {player_id} continues to Level {level + 1}.\n")
                            level += 1
                else:
                    if not used_retry and level > 1:
                        used_retry = True
                        income += RETRY_COST
                        result_text.insert(tk.END, f"🔁 Player {player_id} failed Level {level}. Paid ${RETRY_COST} to retry from Level {level - 1}.\n")
                        level -= 1
                    else:
                        result_text.insert(tk.END, f"❌ Player {player_id} failed and lost everything.\n")
                        break

                sim_window.update()
                
            profit = income - expense
            total_income += income
            total_expense += expense
            total_profit += profit

            result_text.insert(tk.END, "📜 Outcome Summary:\n")
            for event in history:
                result_text.insert(tk.END, f"  - {event}\n")
            result_text.insert(tk.END, f"💵 Income: ${income} | 🎁 Expenses: ${expense} | 🧾 Profit: ${profit}\n\n")
            sim_window.update()

        update_account("income", total_income)
        update_account("expense", total_expense)

        result_text.insert(tk.END, f"\n📊 FINAL SIMULATION SUMMARY\n")
        result_text.insert(tk.END, f"👥 Total Players: {num_players}\n")
        result_text.insert(tk.END, f"💰 Total Income: ${total_income}\n")
        result_text.insert(tk.END, f"🎁 Total Expenses: ${total_expense}\n")
        result_text.insert(tk.END, f"📈 Total Profit: ${total_profit}\n")
        
        result_text.configure(state='disabled')  # Make text read-only

    except ValueError:
        messagebox.showerror("Error", "Invalid number of players.")

def create_gui():
    root = tk.Tk()
    root.title("Lucky Ladders")

    tk.Label(root, text="Lucky Ladders Game", font=("Arial", 16)).pack(pady=10)

    tk.Button(root, text="Play Game", command=play_game, width=20).pack(pady=5)
    tk.Button(root, text="Simulate Players", command=simulate_players, width=20).pack(pady=5)
    tk.Button(root, text="View Account Summary", command=view_account_summary, width=20).pack(pady=5)

    tk.Label(root, text="Manage Account", font=("Arial", 14)).pack(pady=10)
    tk.Button(root, text="Add Money", command=lambda: add_money(float(simpledialog.askstring("Add Money", "Enter amount:"))), width=20).pack(pady=5)
    tk.Button(root, text="Remove Money", command=lambda: remove_money(float(simpledialog.askstring("Remove Money", "Enter amount:"))), width=20).pack(pady=5)

    root.mainloop()

if __name__ == "__main__":
    create_gui()
