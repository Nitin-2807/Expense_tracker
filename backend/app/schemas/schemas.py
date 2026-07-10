from datetime import date

from pydantic import BaseModel, Field


class IncomeBase(BaseModel):
    amount: float = Field(gt=0)
    description: str = Field(default="", max_length=300)
    date: date


class IncomeCreate(IncomeBase):
    pass


class IncomeUpdate(IncomeBase):
    pass


class IncomeOut(IncomeBase):
    id: int

    model_config = {"from_attributes": True}


# ── Expense ─────────────────────────────────────────────────────


class ExpenseBase(BaseModel):
    amount: float = Field(gt=0)
    category_id: int
    description: str = Field(default="", max_length=300)
    date: date


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(ExpenseBase):
    pass


class ExpenseOut(BaseModel):
    id: int
    amount: float
    category_id: int
    category: str
    description: str
    date: date


# ── Category ────────────────────────────────────────────────────


class CategoryBase(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    icon: str = Field(default="📁", max_length=10)
    color: str = Field(default="#64748b", max_length=7)


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: str | None = None
    icon: str | None = None
    color: str | None = None


class CategoryOut(CategoryBase):
    id: int
    is_default: bool

    model_config = {"from_attributes": True}


# ── Transaction (unified income + expense) ─────────────────────


class TransactionOut(BaseModel):
    id: int
    amount: float
    description: str
    date: str
    type: str  # "income" | "expense"
    category: str
    category_id: int | None = None


# ── Dashboard ───────────────────────────────────────────────────


class DashboardStats(BaseModel):
    total_income: float
    total_expense: float
    balance: float
    savings: float
    expenses_by_category: list[dict]
    monthly_expenses: list[dict]
    monthly_income: list[dict]
    today_expense: float
    last_7_days_expense: float
    last_30_days_expense: float
    average_daily_spending: float
    largest_expense: dict | None
    most_used_category: str | None
    recent_transactions: list[dict]


class CategoryTransactionItem(BaseModel):
    id: int
    amount: float
    description: str
    date: str


class CategoryDetail(BaseModel):
    category: str
    total_spent: float
    avg_amount: float
    transaction_count: int
    transactions: list[CategoryTransactionItem]


# ── Auth ──────────────────────────────────────────────────────────


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    avatar: str | None = None
    is_disabled: bool = False
    created_at: date

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: str | None = None
    avatar: str | None = None


class UserProfile(UserOut):
    """Extended profile with stats."""
    transaction_count: int = 0
    expense_count: int = 0
    income_count: int = 0
    category_count: int = 0
