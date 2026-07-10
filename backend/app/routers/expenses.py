from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.models import Category, Expense, User
from app.routers.auth import get_current_user
from app.schemas.schemas import ExpenseCreate, ExpenseOut, ExpenseUpdate

router = APIRouter(prefix="/expenses", tags=["Expenses"])

VALID_SORT_OPTIONS = {"date_desc", "date_asc", "amount_desc", "amount_asc"}


def _validate_category_id(category_id: int, user_id: int, db: Session) -> Category:
    """Ensure the category exists and is visible to the user (global default or owned)."""
    cat = db.query(Category).filter(
        Category.id == category_id,
        or_(Category.user_id == user_id, Category.user_id.is_(None)),
    ).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category")
    return cat


def _expense_to_out(e: Expense) -> ExpenseOut:
    return ExpenseOut(
        id=e.id,
        amount=round(float(e.amount), 2),
        category_id=e.category_id,
        category=e.category.name,
        description=e.description,
        date=e.date,
    )


@router.get("")
def list_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    search: str | None = Query(None, description="Search by description"),
    category_id: int | None = Query(None, description="Filter by category ID"),
    sort: str = Query("date_desc", description="Sort: date_desc, date_asc, amount_desc, amount_asc"),
    start_date: date | None = Query(None, description="Filter start date (YYYY-MM-DD)"),
    end_date: date | None = Query(None, description="Filter end date (YYYY-MM-DD)"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(25, ge=1, le=100, description="Items per page"),
):
    if sort not in VALID_SORT_OPTIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid sort option: {sort}")

    query = db.query(Expense).filter(Expense.user_id == current_user.id)

    if search:
        query = query.filter(Expense.description.ilike(f"%{search}%"))

    if category_id:
        query = query.filter(Expense.category_id == category_id)

    if start_date:
        query = query.filter(Expense.date >= start_date)

    if end_date:
        query = query.filter(Expense.date <= end_date)

    # Total before pagination
    total = query.count()

    if sort == "date_asc":
        query = query.order_by(Expense.date.asc())
    elif sort == "amount_desc":
        query = query.order_by(Expense.amount.desc(), Expense.date.desc())
    elif sort == "amount_asc":
        query = query.order_by(Expense.amount.asc(), Expense.date.desc())
    else:
        query = query.order_by(Expense.date.desc())

    items = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "items": [_expense_to_out(e) for e in items],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": max(1, (total + per_page - 1) // per_page),
    }


@router.post("", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def add_expense(
    expense_data: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ExpenseOut:
    _validate_category_id(expense_data.category_id, current_user.id, db)
    expense = Expense(**expense_data.model_dump(), user_id=current_user.id)
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return _expense_to_out(expense)


@router.put("/{expense_id}", response_model=ExpenseOut)
def update_expense(
    expense_id: int,
    expense_data: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ExpenseOut:
    _validate_category_id(expense_data.category_id, current_user.id, db)
    expense = db.query(Expense).filter(
        Expense.id == expense_id, Expense.user_id == current_user.id
    ).first()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")

    for field, value in expense_data.model_dump().items():
        setattr(expense, field, value)
    db.commit()
    db.refresh(expense)
    return _expense_to_out(expense)


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    expense = db.query(Expense).filter(
        Expense.id == expense_id, Expense.user_id == current_user.id
    ).first()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")

    db.delete(expense)
    db.commit()
