"""
Seed demo data for a specific user — 12 months of realistic income/expenses.

Usage:
    python seed_demo_data.py --email user@example.com
    python seed_demo_data.py --clerk-user-id user_2abc123def

This deletes any existing expense/income/custom-category data for the target
user first, so it's idempotent. Default categories are preserved.
"""

import argparse
import random
from datetime import date, timedelta

from app.database.database import SessionLocal
from app.models.models import Category, Expense, Income, User

random.seed(42)  # Reproducible but varied

# ── Category lookup helpers ─────────────────────────────────────────────

_CAT_CACHE: dict[str, int] | None = None


def _cat_map(db) -> dict[str, int]:
    global _CAT_CACHE
    if _CAT_CACHE is None:
        _CAT_CACHE = {c.name: c.id for c in db.query(Category).all()}
    return _CAT_CACHE


# ── Income template ─────────────────────────────────────────────────────

SALARY = 50_000.00

EXTRA_INCOME: list[dict] = [
    {"month": 1,  "day": 20, "amount": 8_000.00, "desc": "Freelance Website Fix"},
    {"month": 1,  "day": 25, "amount": 5_000.00, "desc": "Diwali Bonus"},
    {"month": 2,  "day": 15, "amount": 350.00,   "desc": "Cashback - Amazon Pay"},
    {"month": 3,  "day": 12, "amount": 6_000.00, "desc": "Freelance Landing Page"},
    {"month": 3,  "day": 31, "amount": 240.00,   "desc": "Bank Interest - Savings"},
    {"month": 4,  "day": 18, "amount": 4_000.00, "desc": "Freelance API Integration"},
    {"month": 5,  "day": 10, "amount": 200.00,   "desc": "Cashback - Flipkart Axis"},
    {"month": 6,  "day": 15, "amount": 550.00,   "desc": "Freelance UI Fixes"},
    {"month": 6,  "day": 30, "amount": 250.00,   "desc": "Bank Interest - Savings"},
    {"month": 7,  "day": 8,  "amount": 3_500.00, "desc": "Freelance Bug Fixes"},
    {"month": 7,  "day": 22, "amount": 150.00,   "desc": "Cashback - PhonePe"},
    {"month": 8,  "day": 5,  "amount": 4_200.00, "desc": "Freelance Dashboard"},
    {"month": 8,  "day": 25, "amount": 180.00,   "desc": "Bank Interest - Savings"},
    {"month": 9,  "day": 10, "amount": 2_800.00, "desc": "Freelance API Work"},
    {"month": 9,  "day": 30, "amount": 200.00,   "desc": "Cashback - Amazon Pay"},
    {"month": 10, "day": 12, "amount": 5_000.00, "desc": "Freelance App Prototype"},
    {"month": 10, "day": 28, "amount": 260.00,   "desc": "Bank Interest - Savings"},
    {"month": 11, "day": 7,  "amount": 3_000.00, "desc": "Consultation - Code Review"},
    {"month": 11, "day": 30, "amount": 180.00,   "desc": "Cashback - PhonePe"},
    {"month": 12, "day": 6,  "amount": 6_500.00, "desc": "Freelance Year-end Sprint"},
    {"month": 12, "day": 28, "amount": 300.00,   "desc": "Bank Interest - Savings"},
]


# ── Expense generator ───────────────────────────────────────────────────

# Each month has a "base" set and a few "spike" / category-specific items.
# Amounts are in INR with natural variation.

MONTHLY_FIXED = [
    # (day_range, category, base_amount, variance, desc_template)
    # Rent — steady, day 1
    (1,  "Bills",       13_000, 0,       "Rent - {month_name}"),
    # Electricity — varies by season
    (3,  "Bills",       1_200,  600,     "Electricity Bill - {month_name}"),
    # Internet — fixed
    (5,  "Bills",       799,    0,       "ACT Fibernet - {month_name}"),
    # Phone recharge — mostly fixed
    (5,  "Bills",       349,    50,      "Jio Recharge - {month_name}"),
    # Groceries — 2-3 per month
    (6,  "Food",        2_200,  800,     "DMart Weekly Groceries"),
    (14, "Food",        1_800,  500,     "Blinkit Grocery Order"),
    (22, "Food",        2_000,  600,     "Local Market - Weekly Haul"),
    # Dining / ordering out — several per month
    (8,  "Food",        350,    200,     "Zomato Dinner - {dish}"),
    (12, "Food",        280,    150,     "Swiggy Lunch - {dish2}"),
    (17, "Food",        400,    200,     "Dining Out - {restaurant}"),
    (25, "Food",        320,    180,     "Zomato Weekend Meal"),
    (30, "Food",        250,    150,     "Swiggy Quick Delivery"),
    # Petrol / travel
    (10, "Travel",      1_200,  300,     "Indian Oil - Petrol"),
    (20, "Travel",      1_100,  300,     "HP Petrol Pump"),
    (27, "Travel",      1_300,  350,     "Indian Oil - Petrol"),
    # Entertainment
    (15, "Entertainment", 200,  100,     "BookMyShow - {movie}"),
    (28, "Entertainment", 499,   0,      "Netflix Subscription - {month_name}"),
    # Gym
    (14, "Others",      1_500,  0,       "Gym Membership - {month_name}"),
    # Medical
    (18, "Medical",     250,    200,     "Apollo Pharmacy - {medicine}"),
]

# Dish / restaurant / movie / medicine pools for variety
DISHES = ["Biryani", "Pizza", "Pasta", "Butter Chicken", "Dosa", "Shawarma",
          "Panini", "Wrap", "Noodles", "Fried Rice", "Kebab", "Tandoori",
          "Pav Bhaji", "Chole Bhature", "Fish Curry", "Rogan Josh"]
DISHES2 = ["Roll", "Combo", "Thali", "Salad", "Bowl", "Burger", "Paratha",
           "Idli Sambar", "Vada Pav", "Frankie"]
RESTAURANTS = ["BBQ Nights", "Cafe Day", "The Social", "Dosa Plaza",
               "Barbeque Nation", "Chinese Night", "Pizza Express",
               "Mughlai Corner", "Sushi Express", "Continental Cafe"]
MOVIES = ["Bhool Bhulaiyaa 3", "Pushpa 2", "Kalki 2898 AD", "Fighter",
          "Dunki", "Animal", "Jawan", "Gadar 2", "Jailer", "Leo"]
MEDICINES = ["Vitamin D Supplements", "Allergy Meds", "Cold Relief",
             "Multivitamins", "Protein Powder", "Calcium Tablets",
             "Probiotics", "Pain Relief Gel", "Eye Drops", "Bandages"]


def _pick(items: list[str]) -> str:
    return random.choice(items)


def _mk_desc(template: str, month_name: str) -> str:
    return template.format(
        month_name=month_name,
        dish=_pick(DISHES),
        dish2=_pick(DISHES2),
        restaurant=_pick(RESTAURANTS),
        movie=_pick(MOVIES),
        medicine=_pick(MEDICINES),
    )


def _vary(amount: float, variance: float) -> float:
    if variance == 0:
        return amount
    return round(amount + random.uniform(-variance, variance), 2)


def _seasonal_multiplier(month: int, category: str) -> float:
    """Return a multiplier for certain categories in certain months."""
    if category == "Bills":
        # Higher electricity bills in summer (Apr-Jun), lower in winter
        if month in (4, 5, 6):
            return 1.5
        if month in (11, 12, 1):
            return 0.8
    if category == "Travel":
        # More travel in festival / holiday months
        if month in (5, 10, 12):
            return 1.3
    if category == "Shopping":
        # Festival / sale season
        if month in (10, 11, 12):
            return 1.4
    return 1.0


def generate_expenses(year: int, cat_map: dict) -> list[Expense]:
    expenses: list[Expense] = []
    month_names = ["January", "February", "March", "April", "May", "June",
                   "July", "August", "September", "October", "November", "December"]

    for month in range(1, 13):
        month_name = month_names[month - 1]
        # Get last day of the month
        if month == 12:
            last_day = 31
        else:
            last_day = (date(year, month + 1, 1) - timedelta(days=1)).day

        # Fixed patterns each month
        for day_range, cat, base, variance, template in MONTHLY_FIXED:
            d = min(day_range, last_day)
            mult = _seasonal_multiplier(month, cat)
            amount = _vary(base * mult, variance * mult)
            expenses.append(Expense(
                amount=round(amount, 2),
                category_id=cat_map[cat],
                description=_mk_desc(template, month_name),
                date=date(year, month, d),
            ))

        # Occasional shopping / travel / education / medical extras per month
        extra_budget = [
            ("Shopping",   2,  1_800,  1_200,    "Flipkart - {dish}"),
            ("Shopping",   3,  600,    400,      "Amazon - {dish2}"),
            ("Education",  4,  800,    600,      "Udemy - {dish} Course"),
            ("Medical",    7,  300,    250,      "Clinic Visit - {medicine}"),
            ("Entertainment", 22, 350, 200,      "{movie} - Weekend Show"),
        ]
        for cat, day_offset, base, var, template in extra_budget:
            # Only fire some of these each month (50-60% chance)
            if random.random() < 0.55:
                d = min(day_offset + random.randint(-1, 1), last_day)
                mult = _seasonal_multiplier(month, cat)
                amt = _vary(base * mult, var * mult)
                expenses.append(Expense(
                    amount=round(amt, 2),
                    category_id=cat_map[cat],
                    description=_mk_desc(template, month_name),
                    date=date(year, month, d),
                ))

        # Occasional "spike" month for Travel (e.g. a weekend trip)
        if month in (4, 10):
            if random.random() < 0.7:
                spike_day = random.randint(8, 20)
                expenses.append(Expense(
                    amount=random.choice([2_800, 3_500, 4_200, 5_000]),
                    category_id=cat_map["Travel"],
                    description=f"Weekend Trip to {random.choice(['Lonavala', 'Mahabaleshwar', 'Goa', 'Udaipur', 'Coorg', 'Manali'])}",
                    date=date(year, month, spike_day),
                ))

        # Occasional "spike" for shopping (e.g. gadget purchase)
        if month in (6, 11):
            if random.random() < 0.6:
                spike_day = random.randint(10, 25)
                expenses.append(Expense(
                    amount=random.choice([3_500, 4_500, 6_000, 2_500]),
                    category_id=cat_map["Shopping"],
                    description=f"Amazon - {random.choice(['Smartwatch', 'Wireless Earbuds', 'Bluetooth Speaker', 'Power Bank', 'Tablet Cover', 'Mechanical Keyboard'])}",
                    date=date(year, month, spike_day),
                ))

    return expenses


# ── Custom categories ───────────────────────────────────────────────────

CUSTOM_CATEGORIES = [
    {"name": "Pets",     "icon": "🐾", "color": "#f97316"},
    {"name": "Gifts",    "icon": "🎁", "color": "#ec4899"},
]

CUSTOM_CATEGORY_EXPENSES: dict[str, list[dict]] = {
    "Pets": [
        {"day": 8,  "month": 3,  "amount": 1_200, "desc": "Pet Food - Pedigree Pack"},
        {"day": 15, "month": 5,  "amount": 800,   "desc": "Cat Litter - 5kg"},
        {"day": 22, "month": 7,  "amount": 450,   "desc": "Pet Toys - Chew Bone Set"},
        {"day": 5,  "month": 9,  "amount": 1_500, "desc": "Vet Checkup + Vaccination"},
        {"day": 12, "month": 11, "amount": 600,   "desc": "Pet Shampoo + Grooming"},
    ],
    "Gifts": [
        {"day": 14, "month": 2,  "amount": 2_000, "desc": "Valentine's Gift - Flowers & Chocs"},
        {"day": 8,  "month": 3,  "amount": 1_500, "desc": "Women's Day Gift - Perfume"},
        {"day": 20, "month": 6,  "amount": 2_500, "desc": "Friend's Birthday - Amazon Voucher"},
        {"day": 5,  "month": 9,  "amount": 1_000, "desc": "Teacher's Day Gift"},
        {"day": 25, "month": 12, "amount": 3_000, "desc": "Christmas Gift - Sweater Set"},
    ],
}


# ── Main ────────────────────────────────────────────────────────────────


def _resolve_user(db, email: str | None, clerk_user_id: str | None) -> User | None:
    """Find user by email or clerk_user_id."""
    if email:
        return db.query(User).filter(User.email == email).first()
    if clerk_user_id:
        return db.query(User).filter(User.clerk_user_id == clerk_user_id).first()
    return None


def seed_for_user(email: str | None = None, clerk_user_id: str | None = None, year: int = 2026) -> None:
    db = SessionLocal()

    try:
        # 1. Find user
        user = _resolve_user(db, email, clerk_user_id)
        if not user:
            identifier = email or clerk_user_id or "?"
            print(f"❌ No user found with identifier: {identifier}")
            print(f"   Available users:")
            for u in db.query(User).all():
                clerk = f"  clerk={u.clerk_user_id}" if u.clerk_user_id else ""
                print(f"     id={u.id}  email={u.email}  {clerk}")
            return

        print(f"🎯 Targeting user: id={user.id}, email={user.email}")

        # 2. Delete existing data for this user
        existing_custom = db.query(Category).filter(Category.user_id == user.id).all()
        for cat in existing_custom:
            db.query(Expense).filter(Expense.category_id == cat.id).delete()
            db.delete(cat)

        existing_exp = db.query(Expense).filter(Expense.user_id == user.id).count()
        existing_inc = db.query(Income).filter(Income.user_id == user.id).count()
        db.query(Expense).filter(Expense.user_id == user.id).delete()
        db.query(Income).filter(Income.user_id == user.id).delete()
        print(f"  🗑  Deleted {existing_exp} expenses, {existing_inc} income records")

        cat_map = _cat_map(db)

        # 3. Create custom categories
        custom_cat_ids: dict[str, int] = {}
        for cc in CUSTOM_CATEGORIES:
            cat = Category(
                name=cc["name"],
                icon=cc["icon"],
                color=cc["color"],
                is_default=False,
                user_id=user.id,
            )
            db.add(cat)
            db.flush()
            custom_cat_ids[cc["name"]] = cat.id
            cat_map[cc["name"]] = cat.id

        print(f"  ✓ Created {len(CUSTOM_CATEGORIES)} custom categories")

        # 4. Generate and insert expenses
        expenses = generate_expenses(year, cat_map)
        for e in expenses:
            e.user_id = user.id
            db.add(e)
        db.flush()

        # 5. Custom category expenses
        for cat_name, items in CUSTOM_CATEGORY_EXPENSES.items():
            for item in items:
                d = min(item["day"], 28)
                exp = Expense(
                    amount=item["amount"],
                    category_id=custom_cat_ids[cat_name],
                    description=item["desc"],
                    date=date(year, item["month"], d),
                    user_id=user.id,
                )
                db.add(exp)

        db.flush()

        # 6. Generate income
        incomes: list[Income] = []
        for m in range(1, 13):
            incomes.append(Income(
                amount=SALARY,
                description=f"Salary - {date(year, m, 1):%B}",
                date=date(year, m, 1),
                user_id=user.id,
            ))

        for extra in EXTRA_INCOME:
            incomes.append(Income(
                amount=extra["amount"],
                description=extra["desc"],
                date=date(year, extra["month"], extra["day"]),
                user_id=user.id,
            ))

        for inc in incomes:
            db.add(inc)

        db.commit()

        # 7. Summary
        from sqlalchemy import func as sa_func

        exp_count = db.query(Expense).filter(Expense.user_id == user.id).count()
        inc_count = db.query(Income).filter(Income.user_id == user.id).count()
        exp_total = db.query(sa_func.sum(Expense.amount)).filter(Expense.user_id == user.id).scalar() or 0
        inc_total = db.query(sa_func.sum(Income.amount)).filter(Income.user_id == user.id).scalar() or 0
        cat_count = db.query(Category).filter(
            (Category.user_id == user.id) | (Category.user_id.is_(None))
        ).count()

        exp_min = db.query(sa_func.min(Expense.date)).filter(Expense.user_id == user.id).scalar()
        exp_max = db.query(sa_func.max(Expense.date)).filter(Expense.user_id == user.id).scalar()
        inc_min = db.query(sa_func.min(Income.date)).filter(Income.user_id == user.id).scalar()
        inc_max = db.query(sa_func.max(Income.date)).filter(Income.user_id == user.id).scalar()

        print()
        print(f"{'═' * 52}")
        print(f"  ✅ Seeding complete for {email}")
        print(f"{'═' * 52}")
        print(f"  Categories  : {cat_count} ({len(CUSTOM_CATEGORIES)} custom)")
        print(f"  Expenses    : {exp_count} records  |  {exp_min} → {exp_max}")
        print(f"                Total: ₹{exp_total:,.2f}")
        print(f"  Income      : {inc_count} records  |  {inc_min} → {inc_max}")
        print(f"                Total: ₹{inc_total:,.2f}")
        print(f"  Net savings : ₹{inc_total - exp_total:,.2f}")
        print(f"{'═' * 52}")
        print()

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()


# ── CLI ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed demo data for a specific user")
    parser.add_argument("--email", help="Email of the user to seed data for")
    parser.add_argument("--clerk-user-id", help="Clerk user ID to seed data for")
    parser.add_argument("--year", type=int, default=2026, help="Year for the data (default: 2026)")
    args = parser.parse_args()

    if not args.email and not args.clerk_user_id:
        parser.error("Provide either --email or --clerk-user-id")

    seed_for_user(email=args.email, clerk_user_id=args.clerk_user_id, year=args.year)
