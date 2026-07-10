from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database.database import get_db
from app.models.models import Category, Expense, Income, User
from app.schemas.schemas import UserOut, UserProfile, UserUpdate



# ── Clerk SDK ─────────────────────────────────────────────────────────────

_clerk_auth_available = bool(settings.CLERK_SECRET_KEY)

if _clerk_auth_available:
    from clerk_backend_api.security import (
        AuthStatus,
        AuthenticateRequestOptions,
        authenticate_request,
    )
else:
    authenticate_request = None
    AuthStatus = None
    AuthenticateRequestOptions = None

router = APIRouter(prefix="/auth", tags=["Auth"])


# ── Clerk auth dependency ─────────────────────────────────────────────────


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """Resolve the current user via Clerk Bearer token.

    Creates a local profile lazily on the first request from a new
    Clerk user. Raises 401 if no valid Clerk session is present.
    """
    if not _clerk_auth_available:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured (CLERK_SECRET_KEY is missing)",
        )

    try:
        options = AuthenticateRequestOptions(
            secret_key=settings.CLERK_SECRET_KEY,
        )
        state = authenticate_request(request, options)

        if not state.is_signed_in or not state.payload:
            reason = state.reason.value[0] if state.reason else "unknown"
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Clerk authentication failed: {reason}",
            )

        clerk_user_id: str | None = state.payload.get("sub")
        if not clerk_user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Clerk session token",
            )

        # Look up existing user by clerk_user_id
        user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()
        if user:
            if user.is_disabled:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Account disabled",
                )
            return user

        # Lazy-create: check for existing user by email first
        email: str = state.payload.get("email", "") or ""
        name: str = state.payload.get("name", "") or ""

        if email:
            existing = db.query(User).filter(User.email == email).first()
            if existing:
                existing.clerk_user_id = clerk_user_id
                if name:
                    existing.name = name
                db.commit()
                if existing.is_disabled:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Account disabled",
                    )
                return existing

        # Create brand-new local profile
        user = User(
            email=email or f"clerk_{clerk_user_id[:12]}@placeholder.local",
            name=name or "User",
            clerk_user_id=clerk_user_id,
            hashed_password=None,
            created_at=date.today(),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {type(exc).__name__}",
        )


# ── Endpoints ─────────────────────────────────────────────────────────────


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(current_user)


@router.get("/me/profile")
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> UserProfile:
    expense_count = db.query(Expense).filter(Expense.user_id == current_user.id).count()
    income_count = db.query(Income).filter(Income.user_id == current_user.id).count()
    category_count = db.query(Category).filter(Category.user_id == current_user.id).count()

    return UserProfile(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        avatar=current_user.avatar,
        is_disabled=current_user.is_disabled,
        created_at=current_user.created_at,
        transaction_count=expense_count + income_count,
        expense_count=expense_count,
        income_count=income_count,
        category_count=category_count,
    )


@router.put("/me")
def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserOut:
    if data.name is not None:
        current_user.name = data.name
    if data.avatar is not None:
        current_user.avatar = data.avatar
    db.commit()
    db.refresh(current_user)
    return UserOut.model_validate(current_user)
