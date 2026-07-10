from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.models import Category, User
from app.routers.auth import get_current_user
from app.schemas.schemas import CategoryCreate, CategoryOut, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["Categories"])


def _get_owned_or_404(db: Session, category_id: int, user_id: int) -> Category:
    """Fetch a category only if it belongs to the user or is a global default."""
    cat = db.query(Category).filter(
        Category.id == category_id,
        or_(Category.user_id == user_id, Category.user_id.is_(None)),
    ).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return cat


@router.get("", response_model=list[CategoryOut])
def list_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Category]:
    """Return global defaults + user's own custom categories."""
    return db.query(Category).filter(
        or_(Category.user_id == current_user.id, Category.user_id.is_(None)),
    ).order_by(Category.name).all()


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Category:
    existing = db.query(Category).filter(Category.name == data.name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category already exists")
    cat = Category(**data.model_dump(), is_default=False, user_id=current_user.id)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.put("/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Category:
    cat = _get_owned_or_404(db, category_id, current_user.id)
    if cat.is_default:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify a default category",
        )
    # Only the owner can update their custom categories
    if cat.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only modify your own categories",
        )
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(cat, field, value)
    # Check name uniqueness if name was changed
    if data.name is not None:
        clash = db.query(Category).filter(Category.name == data.name, Category.id != category_id).first()
        if clash:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category name already exists")
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    cat = _get_owned_or_404(db, category_id, current_user.id)
    if cat.is_default:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a default category",
        )
    # Only the owner can delete their custom categories
    if cat.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own categories",
        )
    # Reassign expenses to "Others" (or first default category)
    others = db.query(Category).filter(Category.is_default == True, Category.name == "Others").first()
    if others:
        from app.models.models import Expense
        db.query(Expense).filter(
            Expense.category_id == category_id,
            Expense.user_id == current_user.id,
        ).update({"category_id": others.id})
    db.delete(cat)
    db.commit()
