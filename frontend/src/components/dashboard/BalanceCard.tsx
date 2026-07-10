import { Card } from "../ui";
import { cn } from "../../lib/utils";

interface BalanceCardProps {
  balance: number;
  income: number;
  expense: number;
  timeRangeLabel: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function BalanceCard({
  balance,
  income,
  expense,
  timeRangeLabel,
}: BalanceCardProps) {
  const isPositive = balance >= 0;

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-[rgb(var(--brand)_/_0.05)] to-transparent">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
            Net {timeRangeLabel}
          </p>
          <p
            className={cn(
              "mt-1 text-3xl font-bold tracking-tight sm:text-4xl",
              isPositive
                ? "text-[rgb(var(--success))]"
                : "text-[rgb(var(--destructive))]",
            )}
          >
            {formatCurrency(balance)}
          </p>
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div>
              <span className="text-[rgb(var(--muted-foreground))]">Income </span>
              <span className="font-semibold text-[rgb(var(--success))]">
                {formatCurrency(income)}
              </span>
            </div>
            <div>
              <span className="text-[rgb(var(--muted-foreground))]">Expenses </span>
              <span className="font-semibold text-[rgb(var(--destructive))]">
                {formatCurrency(expense)}
              </span>
            </div>
          </div>
        </div>
      </div>

    </Card>
  );
}
