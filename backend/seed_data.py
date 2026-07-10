"""
Seed the database with categories, expenses, and income.

Usage:
    python seed_data.py

Run this from the backend/ directory.
"""

from datetime import date, timedelta

from app.database.database import SessionLocal
from app.models.models import Category, Expense, Income

# ── Category definitions ───────────────────────────────────────────────

CATEGORIES = [
    {"name": "Food", "icon": "🍕", "color": "#ef4444", "is_default": True},
    {"name": "Shopping", "icon": "🛒", "color": "#f97316", "is_default": True},
    {"name": "Travel", "icon": "✈️", "color": "#eab308", "is_default": True},
    {"name": "Bills", "icon": "📄", "color": "#22c55e", "is_default": True},
    {"name": "Education", "icon": "📚", "color": "#3b82f6", "is_default": True},
    {"name": "Entertainment", "icon": "🎬", "color": "#a855f7", "is_default": True},
    {"name": "Medical", "icon": "🏥", "color": "#ec4899", "is_default": True},
    {"name": "Others", "icon": "📁", "color": "#64748b", "is_default": True},
]

# ── Expense records ────────────────────────────────────────────────────

EXPENSES: list[dict] = []


def exp(day: int, month: int, amount: float, category: str, description: str):
    EXPENSES.append({
        "amount": amount,
        "category": category,
        "description": description,
        "date": date(2026, month, day),
    })


# ─── JANUARY ───────────────────────────────────────────────────────────
exp( 2, 1, 13_000.00, "Bills",        "Rent - January")
exp( 3, 1, 1_200.00,  "Bills",        "Electricity Bill - Jan")
exp( 5, 1,   799.00,  "Bills",        "ACT Fibernet - Jan")
exp( 5, 1,   349.00,  "Bills",        "Jio Recharge - Jan")
exp( 3, 1, 2_500.00,  "Shopping",     "Amazon Noise Headphones")
exp( 6, 1, 1_850.00,  "Food",         "DMart Weekly Groceries")
exp( 8, 1,   520.00,  "Food",         "Swiggy Dinner - Biryani")
exp(10, 1,   450.00,  "Food",         "Zomato Lunch - Paneer")
exp(12, 1, 1_200.00,  "Travel",       "Indian Oil - Petrol")
exp(13, 1, 1_800.00,  "Food",         "DMart Weekly Groceries")
exp(15, 1, 1_500.00,  "Others",       "Gym Membership - Jan")
exp(17, 1,   320.00,  "Food",         "Swiggy Dinner - Pizza")
exp(19, 1, 1_300.00,  "Travel",       "HP Petrol Pump")
exp(20, 1,   180.00,  "Travel",       "Uber to Office")
exp(22, 1, 1_900.00,  "Food",         "Blinkit Grocery Order")
exp(24, 1, 1_200.00,  "Entertainment","BookMyShow - Movie Night")
exp(26, 1,   650.00,  "Food",         "Dining Out - BBQ Nights")
exp(27, 1, 1_400.00,  "Travel",       "Indian Oil - Petrol")
exp(29, 1,   499.00,  "Entertainment","Netflix Subscription - Jan")
exp(30, 1,   600.00,  "Medical",      "Apollo Pharmacy - Meds")

# ─── FEBRUARY ─────────────────────────────────────────────────────────
exp( 1, 2, 13_000.00, "Bills",        "Rent - February")
exp( 3, 2,   980.00,  "Bills",        "Electricity Bill - Feb")
exp( 5, 2,   799.00,  "Bills",        "ACT Fibernet - Feb")
exp( 5, 2,   349.00,  "Bills",        "Jio Recharge - Feb")
exp( 4, 2, 2_100.00,  "Food",         "DMart Weekly Groceries")
exp( 7, 2,   240.00,  "Food",         "Starbucks Coffee")
exp( 9, 2,   480.00,  "Food",         "Zomato Dinner - Pasta")
exp(11, 2, 1_200.00,  "Travel",       "Indian Oil - Petrol")
exp(12, 2,   550.00,  "Food",         "McDonald's Lunch")
exp(14, 2, 1_500.00,  "Others",       "Gym Membership - Feb")
exp(16, 2, 2_300.00,  "Shopping",     "Flipkart - Running Shoes")
exp(18, 2, 1_100.00,  "Travel",       "HP Petrol Pump")
exp(20, 2,   350.00,  "Food",         "Swiggy Quick Delivery")
exp(22, 2, 1_850.00,  "Food",         "Blinkit Grocery Run")
exp(24, 2,   200.00,  "Travel",       "Ola to Metro Station")
exp(25, 2,   450.00,  "Food",         "Dining Out - Cafe Day")
exp(27, 2, 1_300.00,  "Travel",       "Indian Oil - Petrol")
exp(28, 2,   699.00,  "Entertainment","Amazon Prime - Feb")

# ─── MARCH ─────────────────────────────────────────────────────────────
exp( 1, 3, 13_000.00, "Bills",        "Rent - March")
exp( 3, 3, 1_100.00,  "Bills",        "Electricity Bill - Mar")
exp( 5, 3,   799.00,  "Bills",        "ACT Fibernet - Mar")
exp( 6, 3,   349.00,  "Bills",        "Airtel Recharge - Mar")
exp( 4, 3, 2_200.00,  "Food",         "DMart Monthly Groceries")
exp( 7, 3,   420.00,  "Food",         "Zomato Lunch - Roll")
exp(10, 3, 2_500.00,  "Shopping",     "Amazon Wireless Keyboard")
exp(12, 3,   600.00,  "Food",         "Dining Out - Social")
exp(13, 3, 1_300.00,  "Travel",       "Indian Oil - Petrol")
exp(15, 3, 1_500.00,  "Others",       "Gym Membership - Mar")
exp(17, 3,   380.00,  "Food",         "Swiggy Dinner - Shawarma")
exp(18, 3,   250.00,  "Medical",      "Apollo Pharmacy - Vitamins")
exp(20, 3, 1_100.00,  "Travel",       "HP Petrol Pump")
exp(22, 3,   550.00,  "Food",         "Zomato Weekend Meal")
exp(23, 3, 2_000.00,  "Food",         "Blinkit Grocery Stock-up")
exp(25, 3,   200.00,  "Travel",       "Uber to Friend's Place")
exp(27, 3, 1_400.00,  "Travel",       "Indian Oil - Petrol")
exp(28, 3, 1_600.00,  "Entertainment","BookMyShow - Concert Ticket")
exp(30, 3,   499.00,  "Entertainment","Netflix Subscription - Mar")
exp(31, 3,   800.00,  "Entertainment","Spotify Family - Mar")

# ─── APRIL ─────────────────────────────────────────────────────────────
exp( 1, 4, 13_000.00, "Bills",        "Rent - April")
exp( 3, 4, 1_300.00,  "Bills",        "Electricity Bill - Apr (Summer)")
exp( 5, 4,   799.00,  "Bills",        "ACT Fibernet - Apr")
exp( 5, 4,   349.00,  "Bills",        "Jio Recharge - Apr")
exp( 4, 4, 2_400.00,  "Food",         "DMart Groceries")
exp( 8, 4,   580.00,  "Food",         "Swiggy Dinner - Mughlai")
exp(10, 4,   350.00,  "Food",         "Starbucks Cold Coffee")
exp(12, 4, 1_200.00,  "Travel",       "Indian Oil - Petrol")
exp(14, 4, 1_500.00,  "Others",       "Gym Membership - Apr")
exp(15, 4,   280.00,  "Medical",      "Apollo Pharmacy - Allergy Meds")
exp(17, 4, 2_800.00,  "Travel",       "Weekend Trip to Lonavala")
exp(20, 4, 1_100.00,  "Travel",       "HP Petrol Pump")
exp(22, 4,   450.00,  "Food",         "Dining Out - Pizza Express")
exp(24, 4, 1_900.00,  "Food",         "Blinkit Grocery Order")
exp(26, 4,   200.00,  "Travel",       "Ola to Mall")
exp(28, 4, 1_300.00,  "Travel",       "Indian Oil - Petrol")
exp(29, 4,   499.00,  "Entertainment","Netflix Subscription - Apr")
exp(30, 4,   750.00,  "Shopping",     "Amazon Books - DSA Guide")

# ─── MAY ───────────────────────────────────────────────────────────────
exp( 1, 5, 13_000.00, "Bills",        "Rent - May")
exp( 3, 5, 1_800.00,  "Bills",        "Electricity Bill - May (Summer)")
exp( 5, 5,   799.00,  "Bills",        "ACT Fibernet - May")
exp( 6, 5,   349.00,  "Bills",        "Airtel Recharge - May")
exp( 4, 5, 2_600.00,  "Food",         "DMart Weekly Groceries")
exp( 7, 5,   350.00,  "Food",         "Swiggy Lunch - Biryani")
exp( 9, 5, 1_000.00,  "Shopping",     "Amazon T-Shirts - Combo")
exp(11, 5, 1_400.00,  "Travel",       "Indian Oil - Petrol")
exp(12, 5,   450.00,  "Food",         "Zomato Dinner - Noodles")
exp(14, 5, 1_500.00,  "Others",       "Gym Membership - May")
exp(16, 5,   280.00,  "Food",         "Chai Point - Quick Bite")
exp(18, 5, 1_200.00,  "Travel",       "HP Petrol Pump")
exp(20, 5,   180.00,  "Travel",       "Uber to Doctor")
exp(21, 5, 1_200.00,  "Medical",      "Clinic Visit + Meds")
exp(23, 5, 2_100.00,  "Food",         "Blinkit Grocery Stock-up")
exp(25, 5,   550.00,  "Food",         "Dining Out - Barbeque Nation")
exp(27, 5, 1_300.00,  "Travel",       "Indian Oil - Petrol")
exp(29, 5,   499.00,  "Entertainment","Netflix Subscription - May")
exp(30, 5,   119.00,  "Entertainment","Hotstar Subscription")
exp(31, 5,   350.00,  "Food",         "Zomato Weekend Dessert")

# ─── JUNE ──────────────────────────────────────────────────────────────
exp( 1, 6, 13_000.00, "Bills",        "Rent - June")
exp( 3, 6, 2_200.00,  "Bills",        "Electricity Bill - Jun (Peak Summer)")
exp( 5, 6,   799.00,  "Bills",        "ACT Fibernet - Jun")
exp( 5, 6,   599.00,  "Bills",        "Jio Recharge - Plan Upgrade")
exp( 4, 6, 2_800.00,  "Food",         "DMart Monthly Groceries")
exp( 7, 6,   420.00,  "Food",         "Swiggy Dinner - Burger")
exp( 9, 6,   380.00,  "Food",         "Zomato Lunch - Wrap")
exp(11, 6, 1_300.00,  "Travel",       "Indian Oil - Petrol")
exp(13, 6, 1_500.00,  "Others",       "Gym Membership - Jun")
exp(15, 6, 4_500.00,  "Shopping",     "Flipkart - Smartwatch Sale")
exp(17, 6,   250.00,  "Food",         "Starbucks Frappuccino")
exp(19, 6, 1_200.00,  "Travel",       "HP Petrol Pump")
exp(21, 6,   300.00,  "Travel",       "Ola to Railway Station")
exp(23, 6, 2_300.00,  "Food",         "Blinkit Grocery Order")
exp(25, 6,   480.00,  "Food",         "Dining Out - Dosa Plaza")
exp(27, 6, 1_400.00,  "Travel",       "Indian Oil - Petrol")
exp(28, 6,   599.00,  "Entertainment","BookMyShow - Movie Weekend")
exp(29, 6,   499.00,  "Entertainment","Netflix Subscription - Jun")
exp(30, 6, 1_000.00,  "Education",    "Udemy Course - React Advanced")

# ─── JULY ──────────────────────────────────────────────────────────────
exp( 1, 7, 13_000.00, "Bills",        "Rent - July")
exp( 3, 7, 2_500.00,  "Bills",        "Electricity Bill - Jul (Peak)")
exp( 5, 7,   799.00,  "Bills",        "ACT Fibernet - Jul")
exp( 5, 7,   349.00,  "Bills",        "Airtel Recharge - Jul")
exp( 4, 7, 2_400.00,  "Food",         "DMart Weekly Groceries")
exp( 6, 7,   380.00,  "Food",         "Zomato Lunch - Combo")
exp( 8, 7,   550.00,  "Food",         "Swiggy Dinner - Kebab")
exp(10, 7, 1_300.00,  "Travel",       "Indian Oil - Petrol")
exp(12, 7, 1_500.00,  "Others",       "Gym Membership - Jul")
exp(14, 7,   200.00,  "Food",         "Local Kirana - Milk & Bread")
exp(16, 7, 1_100.00,  "Travel",       "HP Petrol Pump")
exp(18, 7, 2_000.00,  "Shopping",     "Amazon - Backpack")
exp(20, 7,   350.00,  "Entertainment","BookMyShow - Movie Night")
exp(22, 7, 2_650.00,  "Food",         "Blinkit Bulk Grocery Order")
exp(24, 7,   250.00,  "Travel",       "Uber to Airport")
exp(24, 7, 2_500.00,  "Travel",       "IRCTC Train Ticket - Weekend")
exp(25, 7,   600.00,  "Food",         "Dining Out - Chinese Night")
exp(27, 7, 1_400.00,  "Travel",       "Indian Oil - Petrol")
exp(29, 7,   499.00,  "Entertainment","Netflix Subscription - Jul")
exp(30, 7,   350.00,  "Food",         "Zomato Weekend Meal")

# ── Income records ─────────────────────────────────────────────────────

INCOME_RECORDS: list[dict] = []

for m in range(1, 8):  # January (1) → July (7)
    INCOME_RECORDS.append({
        "amount": 50_000.00,
        "description": f"Salary - {date(2026, m, 1):%B}",
        "date": date(2026, m, 1),
    })

INCOME_RECORDS.extend([
    {"amount": 8_000.00,  "description": "Freelance Website Fix",     "date": date(2026, 1, 20)},
    {"amount": 5_000.00,  "description": "Diwali Bonus",             "date": date(2026, 1, 25)},
    {"amount": 350.00,    "description": "Cashback - Amazon Pay",     "date": date(2026, 2, 15)},
    {"amount": 6_000.00,  "description": "Freelance Landing Page",    "date": date(2026, 3, 12)},
    {"amount": 240.00,    "description": "Bank Interest - Savings",   "date": date(2026, 3, 31)},
    {"amount": 4_000.00,  "description": "Freelance API Integration", "date": date(2026, 4, 18)},
    {"amount": 200.00,    "description": "Cashback - Flipkart Axis",  "date": date(2026, 5, 10)},
    {"amount": 250.00,    "description": "Bank Interest - Savings",   "date": date(2026, 6, 30)},
    {"amount": 3_500.00,  "description": "Freelance Bug Fixes",       "date": date(2026, 7, 8)},
    {"amount": 150.00,    "description": "Cashback - PhonePe",        "date": date(2026, 7, 22)},
])


# ── Seeding logic ──────────────────────────────────────────────────────

def seed():
    db = SessionLocal()

    try:
        # Skip if already seeded
        if db.query(Category).count() > 0:
            print("Database already seeded, skipping.")
            return

        # Create categories
        cat_objects = []
        for cd in CATEGORIES:
            cat = Category(**cd)
            db.add(cat)
            cat_objects.append(cat)
        db.commit()

        # Refresh to get IDs
        for cat in cat_objects:
            db.refresh(cat)

        cat_map = {c.name: c.id for c in cat_objects}
        print(f"  ✓ Created {len(cat_objects)} categories")

        # Insert expenses
        for r in EXPENSES:
            expense = Expense(
                amount=r["amount"],
                category_id=cat_map[r["category"]],
                description=r["description"],
                date=r["date"],
            )
            db.add(expense)
        print(f"  ✓ Inserted {len(EXPENSES)} expense records")

        # Insert income
        for r in INCOME_RECORDS:
            income = Income(**r)
            db.add(income)
        print(f"  ✓ Inserted {len(INCOME_RECORDS)} income records")

        db.commit()

        # Summary
        from sqlalchemy import func as sa_func

        inc_count = db.query(sa_func.count(Income.id)).scalar()
        exp_count = db.query(sa_func.count(Expense.id)).scalar()
        inc_total = db.query(sa_func.sum(Income.amount)).scalar() or 0
        exp_total = db.query(sa_func.sum(Expense.amount)).scalar() or 0

        inc_min = db.query(sa_func.min(Income.date)).scalar()
        inc_max = db.query(sa_func.max(Income.date)).scalar()
        exp_min = db.query(sa_func.min(Expense.date)).scalar()
        exp_max = db.query(sa_func.max(Expense.date)).scalar()

        print(f"\n{'═' * 50}")
        print("  ✅ Seeding complete!")
        print(f"{'═' * 50}")
        print(f"  Income  : {inc_count} records  |  {inc_min} → {inc_max}")
        print(f"            Total: ₹{inc_total:,.2f}")
        print(f"  Expense : {exp_count} records  |  {exp_min} → {exp_max}")
        print(f"            Total: ₹{exp_total:,.2f}")
        print(f"  Savings : ₹{inc_total - exp_total:,.2f}")
        print(f"{'═' * 50}")

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
