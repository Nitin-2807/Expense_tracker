import { ArrowUpRight, ArrowDownRight, ChevronRight, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, Badge } from "../ui";
import { cn } from "../../lib/utils";
import type { RecentTransaction } from "../../types";
import { EmptyState } from "../ui";

interface RecentTransactionsProps {
  transactions: RecentTransaction[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[rgb(var(--foreground))]">
          Recent Transactions
        </h3>
        <button
          onClick={() => navigate("/transactions")}
          className="flex items-center gap-0.5 text-xs font-medium text-[rgb(var(--brand))] hover:underline"
        >
          View all
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="h-8 w-8" />}
          title="No transactions yet"
          description="Add your first transaction to get started."
          className="py-8"
        />
      ) : (
        <div className="divide-y divide-[rgb(var(--border))] -mx-5">
          {transactions.map((t) => (
            <div
              key={`${t.type}-${t.id}`}
              className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[rgb(var(--muted))]"
            >
              {/* Icon */}
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
                  t.type === "income"
                    ? "bg-[rgb(var(--success)_/_0.1)]"
                    : "bg-[rgb(var(--destructive)_/_0.1)]",
                )}
              >
                {t.type === "income" ? (
                  <ArrowUpRight className="h-4 w-4 text-[rgb(var(--success))]" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-[rgb(var(--destructive))]" />
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[rgb(var(--foreground))] truncate">
                  {t.description || <span className="text-[rgb(var(--muted-foreground))] italic">—</span>}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-[rgb(var(--muted-foreground))]">
                    {formatDate(t.date)}
                  </span>
                  {t.type === "expense" && t.category && (
                    <Badge variant="default" size="sm">
                      {t.category}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Amount */}
              <span
                className={cn(
                  "text-sm font-semibold shrink-0",
                  t.type === "income"
                    ? "text-[rgb(var(--success))]"
                    : "text-[rgb(var(--foreground))]",
                )}
              >
                {t.type === "income" ? "+" : "-"}
                {formatCurrency(t.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
