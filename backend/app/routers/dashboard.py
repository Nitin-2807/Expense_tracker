from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import extract, func, literal_column
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.models import Category, Expense, Income, User
from app.routers.auth import get_current_user
from app.schemas.schemas import CategoryDetail, CategoryTransactionItem, DashboardStats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

TODAY = date.today()

VALID_TIME_RANGES = {"this_month", "last_month", "last_3_months", "this_year", "all_time"}


def _get_date_range(time_range: str) -> tuple[date | None, date | None]:
    """Return (start_date, end_date) for the given time_range string.

    Returns (None, None) for "all_time".
    """
    if time_range == "all_time":
        return None, None

    if time_range == "this_month":
        return date(TODAY.year, TODAY.month, 1), TODAY

    if time_range == "last_month":
        first_current = date(TODAY.year, TODAY.month, 1)
        end = first_current - timedelta(days=1)
        return date(end.year, end.month, 1), end

    if time_range == "last_3_months":
        first_current = date(TODAY.year, TODAY.month, 1)
        start_month = TODAY.month - 3
        if start_month <= 0:
            start = date(TODAY.year - 1, 12 + start_month, 1)
        else:
            start = date(TODAY.year, start_month, 1)
        return start, TODAY

    if time_range == "this_year":
        return date(TODAY.year, 1, 1), TODAY

    return None, None


def _apply_date_filter(query, model, start_date, end_date):
    if start_date:
        query = query.filter(model.date >= start_date)
    if end_date:
        query = query.filter(model.date <= end_date)
    return query


def _validate_time_range(time_range: str) -> None:
    if time_range not in VALID_TIME_RANGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid time_range: {time_range}. Valid: {', '.join(sorted(VALID_TIME_RANGES))}",
        )


def _validate_category(category_name: str, db: Session) -> None:
    cat = db.query(Category).filter(Category.name == category_name).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid expense category")


@router.get("", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    time_range: str = Query("this_month", description="Time range filter"),
) -> DashboardStats:
    _validate_time_range(time_range)
    start_date, end_date = _get_date_range(time_range)

    # Totals (filtered by time range + user)
    total_income = _apply_date_filter(
        db.query(func.coalesce(func.sum(Income.amount), 0)).filter(Income.user_id == current_user.id),
        Income, start_date, end_date,
    ).scalar()
    total_expense = _apply_date_filter(
        db.query(func.coalesce(func.sum(Expense.amount), 0)).filter(Expense.user_id == current_user.id),
        Expense, start_date, end_date,
    ).scalar()

    # Category breakdown (with transaction count, icon, and color)
    cat_query = _apply_date_filter(
        db.query(Category.name, Category.icon, Category.color, func.sum(Expense.amount), func.count(Expense.id))
        .join(Expense, Expense.category_id == Category.id)
        .where(Expense.user_id == current_user.id)
        .group_by(Category.name, Category.icon, Category.color),
        Expense,
        start_date,
        end_date,
    )
    category_rows = cat_query.all()

    # Monthly expense breakdown (always current year, scoped to user)
    month_query = (
        db.query(extract("month", Expense.date), func.sum(Expense.amount))
        .filter(extract("year", Expense.date) == TODAY.year)
        .filter(Expense.user_id == current_user.id)
        .group_by(extract("month", Expense.date))
        .order_by(extract("month", Expense.date))
    )
    month_rows = month_query.all()

    # Monthly income breakdown (always current year, scoped to user)
    income_month_query = (
        db.query(extract("month", Income.date), func.sum(Income.amount))
        .filter(extract("year", Income.date) == TODAY.year)
        .filter(Income.user_id == current_user.id)
        .group_by(extract("month", Income.date))
        .order_by(extract("month", Income.date))
    )
    income_month_rows = income_month_query.all()

    # Time-based analytics (scoped to user)
    today_expense = (
        db.query(func.coalesce(func.sum(Expense.amount), 0))
        .filter(Expense.date == TODAY, Expense.user_id == current_user.id)
        .scalar()
    )
    seven_days_ago = TODAY - timedelta(days=7)
    last_7_days_expense = (
        db.query(func.coalesce(func.sum(Expense.amount), 0))
        .filter(Expense.date >= seven_days_ago, Expense.user_id == current_user.id)
        .scalar()
    )
    thirty_days_ago = TODAY - timedelta(days=30)
    last_30_days_expense = (
        db.query(func.coalesce(func.sum(Expense.amount), 0))
        .filter(Expense.date >= thirty_days_ago, Expense.user_id == current_user.id)
        .scalar()
    )

    # Average daily spending (within time range, scoped to user)
    daily_avg_query = _apply_date_filter(
        db.query(func.avg(Expense.amount)).filter(Expense.user_id == current_user.id),
        Expense, start_date, end_date,
    )
    daily_avg_result = daily_avg_query.scalar()
    average_daily_spending = round(float(daily_avg_result), 2) if daily_avg_result else 0

    # Largest single expense (within time range, scoped to user)
    largest_query = _apply_date_filter(
        db.query(Expense).filter(Expense.user_id == current_user.id).order_by(Expense.amount.desc()),
        Expense, start_date, end_date,
    )
    largest = largest_query.first()
    largest_expense = (
        {
            "amount": round(float(largest.amount), 2),
            "description": largest.description,
            "category": largest.category.name,
            "date": str(largest.date),
        }
        if largest
        else None
    )

    # Most used category by count (within time range, scoped to user)
    most_used_query = _apply_date_filter(
        db.query(Category.name, func.count(Expense.id))
        .join(Expense, Expense.category_id == Category.id)
        .where(Expense.user_id == current_user.id)
        .group_by(Category.name)
        .order_by(func.count(Expense.id).desc()),
        Expense,
        start_date,
        end_date,
    )
    most_used = most_used_query.first()
    most_used_category = most_used[0] if most_used else None

    # Recent transactions (scoped to user)
    recent_income_query = _apply_date_filter(
        db.query(
            Income.id,
            Income.amount,
            Income.description,
            Income.date,
            literal_column("'income'").label("type"),
            literal_column("''").label("category"),
        ).filter(Income.user_id == current_user.id),
        Income,
        start_date,
        end_date,
    ).order_by(Income.date.desc()).limit(5)
    recent_incomes = recent_income_query.all()

    recent_expense_query = _apply_date_filter(
        db.query(
            Expense.id,
            Expense.amount,
            Expense.description,
            Expense.date,
            literal_column("'expense'").label("type"),
            Category.name.label("category"),
        )
        .join(Category, Expense.category_id == Category.id)
        .where(Expense.user_id == current_user.id),
        Expense,
        start_date,
        end_date,
    ).order_by(Expense.date.desc()).limit(5)
    recent_expenses = recent_expense_query.all()

    all_recent = list(recent_incomes) + list(recent_expenses)
    all_recent.sort(key=lambda x: x.date, reverse=True)
    recent_transactions = [
        {
            "id": r.id,
            "amount": round(float(r.amount), 2),
            "description": r.description,
            "date": str(r.date),
            "type": r.type,
            "category": r.category if r.type == "expense" else "",
        }
        for r in all_recent[:5]
    ]

    return DashboardStats(
        total_income=round(float(total_income), 2),
        total_expense=round(float(total_expense), 2),
        balance=round(float(total_income - total_expense), 2),
        savings=round(float(total_income - total_expense), 2),
        expenses_by_category=[
            {
                "category": category,
                "icon": icon,
                "color": color,
                "amount": round(float(amount), 2),
                "count": count,
            }
            for category, icon, color, amount, count in category_rows
        ],
        monthly_expenses=[{"month": int(month), "amount": round(float(amount), 2)} for month, amount in month_rows],
        monthly_income=[{"month": int(month), "amount": round(float(amount), 2)} for month, amount in income_month_rows],
        today_expense=round(float(today_expense), 2),
        last_7_days_expense=round(float(last_7_days_expense), 2),
        last_30_days_expense=round(float(last_30_days_expense), 2),
        average_daily_spending=average_daily_spending,
        largest_expense=largest_expense,
        most_used_category=most_used_category,
        recent_transactions=recent_transactions,
    )


@router.get("/category/{category_name}", response_model=CategoryDetail)
def get_category_detail(
    category_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    time_range: str = Query("this_month", description="Time range filter"),
) -> CategoryDetail:
    _validate_category(category_name, db)
    _validate_time_range(time_range)
    start_date, end_date = _get_date_range(time_range)

    cat = db.query(Category).filter(Category.name == category_name).first()
    query = _apply_date_filter(
        db.query(Expense).filter(
            Expense.category_id == cat.id,
            Expense.user_id == current_user.id,
        ),
        Expense,
        start_date,
        end_date,
    )
    transactions = query.order_by(Expense.date.desc()).all()

    total_spent = sum(t.amount for t in transactions)
    count = len(transactions)
    avg_amount = round(total_spent / count, 2) if count > 0 else 0

    return CategoryDetail(
        category=category_name,
        total_spent=round(total_spent, 2),
        avg_amount=avg_amount,
        transaction_count=count,
        transactions=[
            CategoryTransactionItem(
                id=t.id,
                amount=round(float(t.amount), 2),
                description=t.description,
                date=str(t.date),
            )
            for t in transactions
        ],
    )
