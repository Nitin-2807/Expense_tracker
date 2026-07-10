from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.models import Income, User
from app.routers.auth import get_current_user
from app.schemas.schemas import IncomeCreate, IncomeOut, IncomeUpdate

router = APIRouter(prefix="/income", tags=["Income"])

VALID_SORT_OPTIONS = {"date_desc", "date_asc", "amount_desc", "amount_asc"}


@router.get("")
def list_income(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    search: str | None = Query(None, description="Search by description"),
    sort: str = Query("date_desc", description="Sort: date_desc, date_asc, amount_desc, amount_asc"),
    start_date: date | None = Query(None, description="Filter start date (YYYY-MM-DD)"),
    end_date: date | None = Query(None, description="Filter end date (YYYY-MM-DD)"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(25, ge=1, le=100, description="Items per page"),
):
    if sort not in VALID_SORT_OPTIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid sort option: {sort}")

    query = db.query(Income).filter(Income.user_id == current_user.id)

    if search:
        query = query.filter(Income.description.ilike(f"%{search}%"))

    if start_date:
        query = query.filter(Income.date >= start_date)

    if end_date:
        query = query.filter(Income.date <= end_date)

    total = query.count()

    if sort == "date_asc":
        query = query.order_by(Income.date.asc())
    elif sort == "amount_desc":
        query = query.order_by(Income.amount.desc(), Income.date.desc())
    elif sort == "amount_asc":
        query = query.order_by(Income.amount.asc(), Income.date.desc())
    else:
        query = query.order_by(Income.date.desc())

    items = query.offset((page - 1) * per_page).limit(per_page).all()
    income_out = [IncomeOut.model_validate(i) for i in items]

    return {
        "items": income_out,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": max(1, (total + per_page - 1) // per_page),
    }


@router.post("", response_model=IncomeOut, status_code=status.HTTP_201_CREATED)
def add_income(
    income_data: IncomeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Income:
    income = Income(**income_data.model_dump(), user_id=current_user.id)
    db.add(income)
    db.commit()
    db.refresh(income)
    return income


@router.put("/{income_id}", response_model=IncomeOut)
def update_income(
    income_id: int,
    income_data: IncomeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Income:
    income = db.query(Income).filter(
        Income.id == income_id, Income.user_id == current_user.id
    ).first()
    if not income:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income not found")

    for field, value in income_data.model_dump().items():
        setattr(income, field, value)
    db.commit()
    db.refresh(income)
    return income


@router.delete("/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    income = db.query(Income).filter(
        Income.id == income_id, Income.user_id == current_user.id
    ).first()
    if not income:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income not found")

    db.delete(income)
    db.commit()
