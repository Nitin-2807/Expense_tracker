import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { useCreateExpense, useCreateIncome } from "../hooks/useTransactions";
import type { TimeRange } from "../types";
import type { TransactionFormValues } from "../lib/validations";
import { Button, CardSkeleton, ErrorState } from "../components/ui";
import { BalanceCard } from "../components/dashboard/BalanceCard";
import { StatRow } from "../components/dashboard/StatRow";
import { CategoryChart } from "../components/dashboard/CategoryChart";
import { TrendChart } from "../components/dashboard/TrendChart";
import { RecentTransactions } from "../components/dashboard/RecentTransactions";
import { TimeRangeFilter, getTimeRangeLabel } from "../components/dashboard/TimeRangeFilter";
import { TransactionForm } from "../components/transactions/TransactionForm";

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("this_month");
  const { data, isLoading, isError, error, refetch } = useDashboard(timeRange);

  // ── Add Transaction SlideOver ────────────────────────────────
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const createExpense = useCreateExpense();
  const createIncome = useCreateIncome();

  const handleFormSubmit = useCallback(
    (values: TransactionFormValues) => {
      const dateStr = values.date;
      if (values.type === "expense") {
        createExpense.mutate(
          {
            amount: values.amount,
            category_id: values.category_id!,
            description: values.description,
            date: dateStr,
          },
          { onSuccess: () => setSlideOverOpen(false) },
        );
      } else {
        createIncome.mutate(
          {
            amount: values.amount,
            description: values.description,
            date: dateStr,
          },
          { onSuccess: () => setSlideOverOpen(false) },
        );
      }
    },
    [createExpense, createIncome],
  );

  // ── Loading state ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-72">
          <div className="h-full w-full rounded-lg bg-[rgb(var(--muted))] animate-pulse" />
        </div>
        <CardSkeleton />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[rgb(var(--border))] p-4 space-y-2">
              <div className="h-3 w-16 rounded bg-[rgb(var(--muted))] animate-pulse" />
              <div className="h-6 w-24 rounded bg-[rgb(var(--muted))] animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────
  if (isError) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        message={error instanceof Error ? error.message : "Unable to fetch dashboard data"}
        onRetry={() => refetch()}
      />
    );
  }

  // ── Empty / zero state ─────────────────────────────────────────────
  if (!data) {
    return (
      <ErrorState
        title="No data available"
        message="Could not retrieve dashboard data from the server."
        onRetry={() => refetch()}
      />
    );
  }

  // ── Data state ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header row: filter + FAB */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
        <Button
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setSlideOverOpen(true)}
        >
          Add Transaction
        </Button>
      </div>

      {/* Hero balance */}
      <BalanceCard
        balance={data.balance}
        income={data.total_income}
        expense={data.total_expense}
        timeRangeLabel={getTimeRangeLabel(timeRange)}
      />

      {/* Stats row: today / 7-day / 30-day / daily avg */}
      <StatRow
        todayExpense={data.today_expense}
        last7DaysExpense={data.last_7_days_expense}
        last30DaysExpense={data.last_30_days_expense}
        averageDaily={data.average_daily_spending}
      />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart
          data={data.expenses_by_category}
          onCategoryClick={() => {
            /* TODO: open category detail in SlideOver (post-Phase 4) */
          }}
        />
        <TrendChart
          expenses={data.monthly_expenses}
          income={data.monthly_income}
        />
      </div>

      {/* Recent transactions */}
      <RecentTransactions transactions={data.recent_transactions} />

      {/* Add Transaction SlideOver */}
      <TransactionForm
        open={slideOverOpen}
        onClose={() => setSlideOverOpen(false)}
        onSubmit={handleFormSubmit}
        editTransaction={null}
        loading={createExpense.isPending || createIncome.isPending}
      />
    </div>
  );
}
