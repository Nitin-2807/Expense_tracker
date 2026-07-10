from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, literal_column, select, union_all
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.models import Category, Expense, Income, User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])

VALID_SORT_OPTIONS = {"date_desc", "date_asc", "amount_desc", "amount_asc"}


def _apply_select_filters(stmt, model, search, start_date, end_date):
    """Apply filters to a select() statement (uses .where() instead of .filter())."""
    if search:
        stmt = stmt.where(model.description.ilike(f"%{search}%"))
    if start_date:
        stmt = stmt.where(model.date >= start_date)
    if end_date:
        stmt = stmt.where(model.date <= end_date)
    return stmt


@router.get("")
def list_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    search: str | None = Query(None, description="Search by description"),
    type: str | None = Query(None, description="Filter by type: income or expense"),
    category_id: int | None = Query(None, description="Filter by category ID (expenses only)"),
    start_date: date | None = Query(None, description="Filter start date (YYYY-MM-DD)"),
    end_date: date | None = Query(None, description="Filter end date (YYYY-MM-DD)"),
    sort: str = Query("date_desc", description="Sort: date_desc, date_asc, amount_desc, amount_asc"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(25, ge=1, le=100, description="Items per page"),
):
    if sort not in VALID_SORT_OPTIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid sort option: {sort}")

    # Build income select statement (scoped to current user)
    income_stmt = select(
        Income.id.label("id"),
        Income.amount.label("amount"),
        Income.description.label("description"),
        Income.date.label("date"),
        literal_column("'income'").label("type"),
        literal_column("''").label("category"),
        literal_column("NULL").label("category_id"),
    ).select_from(Income).where(Income.user_id == current_user.id)
    income_stmt = _apply_select_filters(
        income_stmt, Income,
        search if type in (None, "income") else None,
        start_date, end_date,
    )

    # Build expense select statement (scoped to current user)
    expense_stmt = select(
        Expense.id.label("id"),
        Expense.amount.label("amount"),
        Expense.description.label("description"),
        Expense.date.label("date"),
        literal_column("'expense'").label("type"),
        Category.name.label("category"),
        Expense.category_id.label("category_id"),
    ).select_from(Expense).join(Category, Expense.category_id == Category.id).where(Expense.user_id == current_user.id)
    expense_stmt = _apply_select_filters(
        expense_stmt, Expense,
        search if type in (None, "expense") else None,
        start_date, end_date,
    )
    if category_id:
        expense_stmt = expense_stmt.where(Expense.category_id == category_id)

    # Build total count per type (before pagination)
    if type == "income":
        total = db.execute(
            select(func.count()).select_from(income_stmt.subquery())
        ).scalar()
        union = income_stmt
    elif type == "expense":
        total = db.execute(
            select(func.count()).select_from(expense_stmt.subquery())
        ).scalar()
        union = expense_stmt
    else:
        total_income = db.execute(
            select(func.count()).select_from(
                _apply_select_filters(
                    select(Income.id).where(Income.user_id == current_user.id),
                    Income, search, start_date, end_date,
                ).subquery()
            )
        ).scalar() or 0
        total_expense = db.execute(
            select(func.count()).select_from(
                _apply_select_filters(
                    select(Expense.id).where(Expense.user_id == current_user.id),
                    Expense, search, start_date, end_date,
                ).subquery()
            )
        ).scalar() or 0
        total = total_income + total_expense
        union = union_all(income_stmt, expense_stmt)

    # Order
    if sort == "date_asc":
        union = union.order_by(literal_column("date").asc())
    elif sort == "amount_desc":
        union = union.order_by(literal_column("amount").desc())
    elif sort == "amount_asc":
        union = union.order_by(literal_column("amount").asc())
    else:
        union = union.order_by(literal_column("date").desc())

    # Paginate and execute
    union = union.offset((page - 1) * per_page).limit(per_page)
    rows = db.execute(union).all()

    return {
        "items": [
            {
                "id": r.id,
                "amount": round(float(r.amount), 2),
                "description": r.description,
                "date": str(r.date),
                "type": r.type,
                "category": r.category if r.type == "expense" else "",
                "category_id": r.category_id if r.type == "expense" else None,
            }
            for r in rows
        ],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": max(1, (total + per_page - 1) // per_page),
    }
