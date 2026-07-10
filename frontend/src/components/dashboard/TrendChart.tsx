import { useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { Card } from "../ui";
import type { MonthlyItem } from "../../types";

interface TrendChartProps {
  expenses: MonthlyItem[];
  income: MonthlyItem[];
}

const MONTH_NAMES = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface ChartEntry {
  month: string;
  monthNum: number;
  expense: number;
  income: number;
}

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 py-2 shadow-card text-sm">
      <p className="font-medium text-[rgb(var(--foreground))] mb-1.5">
        {label}
      </p>
      {payload.map((entry) => (
        <p
          key={entry.name}
          className="flex items-center gap-2"
          style={{ color: entry.color }}
        >
          <span className="font-medium">{entry.name}:</span>
          <span>₹{entry.value.toLocaleString("en-IN")}</span>
        </p>
      ))}
    </div>
  );
}

export function TrendChart({ expenses, income }: TrendChartProps) {
  const [activeBar, setActiveBar] = useState<number | null>(null);

  // Merge expense and income by month
  const monthMap = new Map<number, ChartEntry>();

  for (const e of expenses) {
    monthMap.set(e.month, {
      month: MONTH_NAMES[e.month] || String(e.month),
      monthNum: e.month,
      expense: e.amount,
      income: 0,
    });
  }

  for (const i of income) {
    const existing = monthMap.get(i.month);
    if (existing) {
      existing.income = i.amount;
    } else {
      monthMap.set(i.month, {
        month: MONTH_NAMES[i.month] || String(i.month),
        monthNum: i.month,
        expense: 0,
        income: i.amount,
      });
    }
  }

  const chartData = Array.from(monthMap.values())
    .sort((a, b) => a.monthNum - b.monthNum);

  const hasMultipleMonths = chartData.length >= 2;

  const handleMouseEnter = useCallback(
    (_: unknown, idx: number) => setActiveBar(idx),
    [],
  );
  const handleMouseLeave = useCallback(() => setActiveBar(null), []);

  return (
    <Card>
      <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-4">
        Income vs Expenses
      </h3>

      {!hasMultipleMonths ? (
        <div className="flex items-center justify-center h-48 text-sm text-[rgb(var(--muted-foreground))]">
          <div className="text-center">
            <p>Not enough data for a trend chart</p>
            {chartData.length === 1 && (
              <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
                {chartData[0].month}: ₹{chartData[0].expense.toLocaleString("en-IN")} expenses
              </p>
            )}
          </div>
        </div>
      ) : (
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              barCategoryGap="20%"
              barGap={4}
              onMouseLeave={() => setActiveBar(null)}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgb(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "rgb(var(--muted-foreground))" }}
                axisLine={{ stroke: "rgb(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "rgb(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgb(var(--muted) / 0.3)" }} />
              <Bar
                dataKey="income"
                name="Income"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {chartData.map((_entry, idx) => (
                  <Cell
                    key={`income-${idx}`}
                    fill={activeBar === idx ? "rgb(var(--success))" : "rgb(var(--success) / 0.75)"}
                    stroke={activeBar === idx ? "rgb(var(--success))" : "transparent"}
                    strokeWidth={activeBar === idx ? 2 : 0}
                  />
                ))}
              </Bar>
              <Bar
                dataKey="expense"
                name="Expenses"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {chartData.map((_entry, idx) => (
                  <Cell
                    key={`expense-${idx}`}
                    fill={activeBar === idx ? "rgb(var(--destructive))" : "rgb(var(--destructive) / 0.75)"}
                    stroke={activeBar === idx ? "rgb(var(--destructive))" : "transparent"}
                    strokeWidth={activeBar === idx ? 2 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
