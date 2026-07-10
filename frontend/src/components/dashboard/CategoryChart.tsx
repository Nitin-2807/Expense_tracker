import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card } from "../ui";
import { cn } from "../../lib/utils";
import type { CategoryBreakdownItem } from "../../types";

interface CategoryChartProps {
  data: CategoryBreakdownItem[];
  onCategoryClick?: (category: string) => void;
}

// Category color fallback — only used when the API doesn't send a color
const FALLBACK_COLOR = "#64748b";

interface PayloadEntry {
  name: string;
  value: number;
  payload: { category: string; amount: number; count: number; color: string };
}

function CustomTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: PayloadEntry[];
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0.0";
  return (
    <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 py-2 shadow-card text-sm">
      <p className="font-medium text-[rgb(var(--foreground))]">{entry.name}</p>
      <p className="text-[rgb(var(--foreground))]">
        ₹{entry.value.toLocaleString("en-IN")}
      </p>
      <p className="text-xs text-[rgb(var(--muted-foreground))]">
        {pct}% of total
      </p>
    </div>
  );
}

export function CategoryChart({ data, onCategoryClick }: CategoryChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const hasData = data.length > 0;

  const total = data.reduce((sum, d) => sum + d.amount, 0);

  const chartData = data.map((d) => ({
    ...d,
    name: d.category,
    value: d.amount,
    color: d.color || FALLBACK_COLOR,
  }));

  return (
    <Card>
      <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-4">
        Spending by Category
      </h3>

      {!hasData ? (
        <div className="flex items-center justify-center h-48 text-sm text-[rgb(var(--muted-foreground))]">
          No spending data for this period
        </div>
      ) : (
        <div
          className="flex flex-col sm:flex-row items-center gap-6"
          onMouseLeave={() => setActiveIndex(null)}
        >
          {/* Donut chart */}
          <div className="shrink-0" style={{ width: 180, height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  cursor={onCategoryClick ? "pointer" : "default"}
                  onMouseEnter={(_data, idx) => setActiveIndex(idx)}
                  onClick={(entry) => {
                    const payload =
                      entry as unknown as {
                        payload?: { category: string };
                      };
                    if (payload.payload?.category)
                      onCategoryClick?.(payload.payload.category);
                  }}
                >
                  {chartData.map((entry, idx) => (
                    <Cell
                      key={entry.category}
                      fill={entry.color}
                      opacity={
                        activeIndex === null || activeIndex === idx
                          ? 1
                          : 0.35
                      }
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip total={total} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2 w-full">
            {chartData.map((entry) => {
              const idx = chartData.indexOf(entry);
              return (
                <button
                  key={entry.category}
                  onClick={() => onCategoryClick?.(entry.category)}
                  className={cn(
                    "flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-sm transition-colors hover:bg-[rgb(var(--muted))]",
                    activeIndex === null || activeIndex === idx
                      ? "opacity-100"
                      : "opacity-35",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-[rgb(var(--foreground))]">
                      {entry.category}
                    </span>
                  </div>
                  <span className="font-medium text-[rgb(var(--foreground))]">
                    ₹{entry.amount.toLocaleString("en-IN")}
                  </span>
                </button>
              );
            })}

            {/* Total */}
            <div className="flex items-center justify-between border-t border-[rgb(var(--border))] pt-2 mt-2 px-2">
              <span className="text-xs font-medium text-[rgb(var(--muted-foreground))]">
                Total
              </span>
              <span className="text-sm font-bold text-[rgb(var(--foreground))]">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
