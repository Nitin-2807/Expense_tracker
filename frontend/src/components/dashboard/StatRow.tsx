import { Card } from "../ui";
import { cn } from "../../lib/utils";

interface StatRowProps {
  todayExpense: number;
  last7DaysExpense: number;
  last30DaysExpense: number;
  averageDaily: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function StatRow({
  todayExpense,
  last7DaysExpense,
  last30DaysExpense,
  averageDaily,
}: StatRowProps) {
  const stats = [
    {
      label: "Today",
      value: todayExpense,
      highlight: todayExpense > 0,
    },
    {
      label: "Last 7 Days",
      value: last7DaysExpense,
    },
    {
      label: "Last 30 Days",
      value: last30DaysExpense,
    },
    {
      label: "Daily Avg.",
      value: averageDaily,
      suffix: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="py-3 px-4">
          <p className="text-xs text-[rgb(var(--muted-foreground))]">
            {stat.label}
          </p>
          <p
            className={cn(
              "mt-0.5 text-lg font-bold",
              stat.highlight
                ? "text-[rgb(var(--brand))]"
                : "text-[rgb(var(--foreground))]",
            )}
          >
            {formatCurrency(stat.value)}
          </p>
        </Card>
      ))}
    </div>
  );
}
