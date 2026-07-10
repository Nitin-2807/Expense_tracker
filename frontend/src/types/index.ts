// ── Category ──────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
}

export interface CategoryCreate {
  name: string;
  icon?: string;
  color?: string;
}

export interface CategoryUpdate {
  name?: string;
  icon?: string;
  color?: string;
}

// ── Expense ───────────────────────────────────────────────────────────

export interface ExpenseCreate {
  amount: number;
  category_id: number;
  description: string;
  date: string;
}

export type ExpenseUpdate = ExpenseCreate;

export interface ExpenseOut {
  id: number;
  amount: number;
  category_id: number;
  category: string;
  description: string;
  date: string;
}

// ── Income ────────────────────────────────────────────────────────────

export interface IncomeBase {
  amount: number;
  description: string;
  date: string;
}

export type IncomeCreate = IncomeBase;

export type IncomeUpdate = IncomeBase;

export interface IncomeOut extends IncomeBase {
  id: number;
}

// ── Transaction (unified) ─────────────────────────────────────────────

export interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  type: "income" | "expense";
  category: string;
  category_id: number | null;
}

// ── Dashboard ─────────────────────────────────────────────────────────

export interface DashboardStats {
  total_income: number;
  total_expense: number;
  balance: number;
  savings: number;
  expenses_by_category: CategoryBreakdownItem[];
  monthly_expenses: MonthlyItem[];
  monthly_income: MonthlyItem[];
  today_expense: number;
  last_7_days_expense: number;
  last_30_days_expense: number;
  average_daily_spending: number;
  largest_expense: LargestExpense | null;
  most_used_category: string | null;
  recent_transactions: RecentTransaction[];
}

export interface CategoryBreakdownItem {
  category: string;
  icon: string;
  color: string;
  amount: number;
  count: number;
}

export interface MonthlyItem {
  month: number;
  amount: number;
}

export interface LargestExpense {
  amount: number;
  description: string;
  category: string;
  date: string;
}

export interface RecentTransaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  type: "income" | "expense";
  category: string;
}

export interface CategoryTransactionItem {
  id: number;
  amount: number;
  description: string;
  date: string;
}

export interface CategoryDetail {
  category: string;
  total_spent: number;
  avg_amount: number;
  transaction_count: number;
  transactions: CategoryTransactionItem[];
}

// ── Paginated Response ────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

// ── Query Params ──────────────────────────────────────────────────────

export interface TransactionQueryParams {
  search?: string;
  type?: "income" | "expense";
  category_id?: number;
  start_date?: string;
  end_date?: string;
  sort?: "date_desc" | "date_asc" | "amount_desc" | "amount_asc";
  page?: number;
  per_page?: number;
}

export interface ExpenseQueryParams {
  search?: string;
  category_id?: number;
  sort?: "date_desc" | "date_asc" | "amount_desc" | "amount_asc";
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
}

export interface IncomeQueryParams {
  search?: string;
  sort?: "date_desc" | "date_asc" | "amount_desc" | "amount_asc";
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
}

export type TimeRange =
  | "this_month"
  | "last_month"
  | "last_3_months"
  | "this_year"
  | "all_time";

// ── Theme ─────────────────────────────────────────────────────────────

export type ThemeMode = "light" | "dark" | "system";

// ── Auth ──────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  name: string;
  avatar: string | null;
  is_disabled: boolean;
  created_at: string;
}

export interface UserProfile extends User {
  transaction_count: number;
  expense_count: number;
  income_count: number;
  category_count: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}
