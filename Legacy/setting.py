import csv

ACCOUNT_FILE = "/Users/colinferreira/Library/CloudStorage/OneDrive-GreatSouthernGrammar/Methods Inv 25/account.csv"

def update_account(transaction_type, amount):
    with open(ACCOUNT_FILE, mode='a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([transaction_type, amount])

def add_money(amount):
    update_account("add", amount)
    print(f"✅ Added ${amount} to the account.")

def remove_money(amount):
    update_account("remove", amount)
    print(f"✅ Removed ${amount} from the account.")

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

        print("\n📊 ACCOUNT SUMMARY")
        print(f"💰 Total Income: ${total_income}")
        print(f"🎁 Total Expense: ${total_expense}")
        print(f"➕ Total Added: ${total_add}")
        print(f"➖ Total Removed: ${total_remove}")
        print(f"💵 Current Balance: ${balance}")
        print(f"📈 Profit: ${profit}")
    except FileNotFoundError:
        print("❌ Account file not found. Please ensure the account file exists.")

if __name__ == "__main__":
    action = input("Do you want to add, remove, or view the account summary? (add/remove/view): ").strip().lower()
    try:
        if action == "add":
            amount = float(input("Enter the amount to add: "))
            add_money(amount)
        elif action == "remove":
            amount = float(input("Enter the amount to remove: "))
            remove_money(amount)
        elif action == "view":
            view_account_summary()
        else:
            print("❌ Invalid action.")
    except ValueError:
        print("❌ Invalid amount.")
