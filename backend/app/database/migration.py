"""
Database migration: add multi-user support + token_version + clerk_user_id.

This migration:
  1. Adds `user_id` columns to existing `expenses`, `incomes`, and `categories` tables.
  2. Adds `token_version` column to the `users` table.
  3. Adds `clerk_user_id` column to the `users` table.
  4. Creates a seed user and assigns all existing records to it.
  5. Prints the seed user's randomly-generated password for initial access.

Run automatically on application startup (via main.py).
"""

import secrets
from datetime import date

from passlib.context import CryptContext
from sqlalchemy import inspect, text

from app.database.database import Base, engine, SessionLocal
from app.models.models import Expense, Income, User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SEED_EMAIL = "seed@expense-tracker.local"
SEED_NAME = "Seed User"

_PENDING_MSG = "• Set a new password through the Profile page once logged in."


def _column_exists(table: str, column: str) -> bool:
    inspector = inspect(engine)
    cols = [c["name"] for c in inspector.get_columns(table)]
    return column in cols


def _table_exists(table: str) -> bool:
    inspector = inspect(engine)
    return table in inspector.get_table_names()


def _add_column(table: str, column_def: str) -> None:
    with engine.connect() as conn:
        conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column_def}"))
        conn.commit()


def migrate() -> None:
    """Run the migration if needed. Prints seed credentials if a seed user was created."""

    # ── Ad-hoc column additions (run every startup, guarded by existence) ─
    needs_work = False

    if not _column_exists("expenses", "user_id"):
        _add_column("expenses", "user_id INTEGER REFERENCES users(id)")
        print("  ✓ Added user_id to expenses")
        needs_work = True

    if not _column_exists("incomes", "user_id"):
        _add_column("incomes", "user_id INTEGER REFERENCES users(id)")
        print("  ✓ Added user_id to incomes")
        needs_work = True

    if not _column_exists("categories", "user_id"):
        _add_column("categories", "user_id INTEGER REFERENCES users(id)")
        print("  ✓ Added user_id to categories")
        needs_work = True

    if _table_exists("users") and not _column_exists("users", "token_version"):
        _add_column("users", "token_version INTEGER NOT NULL DEFAULT 0")
        print("  ✓ Added token_version to users")
        needs_work = True

    if _table_exists("users") and not _column_exists("users", "clerk_user_id"):
        _add_column("users", "clerk_user_id VARCHAR(255)")
        print("  ✓ Added clerk_user_id to users")
        needs_work = True

    # ── Guard: skip seed-user logic if everything is already in place ────
    already_migrated = (
        not needs_work
        and _table_exists("users")
        and _column_exists("expenses", "user_id")
        and _column_exists("incomes", "user_id")
        and _column_exists("users", "token_version")
        and _column_exists("users", "clerk_user_id")
    )
    if already_migrated:
        with SessionLocal() as db:
            if db.query(User).filter(User.email == SEED_EMAIL).first():
                return  # Nothing to do — columns + seed exist

    print("→ Running multi-user migration...")

    # Ensure the users table itself has the right schema
    Base.metadata.create_all(bind=engine)

    # ── 2. Find or create seed user ────────────────────────────────────
    with SessionLocal() as db:
        seed = db.query(User).filter(User.email == SEED_EMAIL).first()

        if seed:
            seed_user_id = seed.id
            print(f"  ✓ Seed user already exists (id={seed_user_id})")
        else:
            seed_password = secrets.token_urlsafe(16)
            hashed = pwd_context.hash(seed_password)
            seed = User(
                email=SEED_EMAIL,
                name=SEED_NAME,
                hashed_password=hashed,
                created_at=date.today(),
            )
            db.add(seed)
            db.commit()
            db.refresh(seed)
            seed_user_id = seed.id
            print(f"\n  ╔══════════════════════════════════════════════════╗")
            print(f"  ║  Seed user created                               ║")
            print(f"  ║  Email: {SEED_EMAIL:<36}  ║")
            print(f"  ║  Password: {seed_password:<33}  ║")
            print(f"  ║  {_PENDING_MSG:<48}  ║")
            print(f"  ╚══════════════════════════════════════════════════╝\n")

        # ── 3. Assign existing records to seed user ─────────────────────
        exp_count = db.query(Expense).filter(Expense.user_id.is_(None)).count()
        inc_count = db.query(Income).filter(Income.user_id.is_(None)).count()

        if exp_count or inc_count:
            db.query(Expense).filter(Expense.user_id.is_(None)).update(
                {"user_id": seed_user_id}, synchronize_session=False
            )
            db.query(Income).filter(Income.user_id.is_(None)).update(
                {"user_id": seed_user_id}, synchronize_session=False
            )
            print(f"  ✓ Assigned {exp_count} expenses, {inc_count} incomes → seed user")

        db.commit()
        print("  ✓ Migration complete\n")
