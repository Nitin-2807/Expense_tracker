import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  subMonths,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isBefore,
  isAfter,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { cn } from "../../lib/utils";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const presets = [
  { label: "Last 7 days", getValue: () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    return { start, end };
  }},
  { label: "Last 30 days", getValue: () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 29);
    return { start, end };
  }},
  { label: "This month", getValue: () => {
    const now = new Date();
    return { start: startOfMonth(now), end: now };
  }},
  { label: "Last month", getValue: () => {
    const lm = subMonths(new Date(), 1);
    return { start: startOfMonth(lm), end: endOfMonth(lm) };
  }},
  { label: "This year", getValue: () => {
    const now = new Date();
    return { start: new Date(now.getFullYear(), 0, 1), end: now };
  }},
];

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [viewDate, setViewDate] = useState(new Date());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (date: Date) => {
    if (!value.start || (value.start && value.end)) {
      // Start new range
      onChange({ start: date, end: null });
    } else {
      // Complete range
      if (isBefore(date, value.start)) {
        onChange({ start: date, end: value.start });
      } else {
        onChange({ start: value.start, end: date });
      }
    }
  };

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewDate)),
    end: endOfWeek(endOfMonth(viewDate)),
  });

  const isInRange = (date: Date) => {
    if (!value.start) return false;
    const end = value.end || hoverDate;
    if (!end) return false;
    return isAfter(date, value.start) && isBefore(date, end);
  };

  const isRangeStart = (date: Date) => value.start && isSameDay(date, value.start);
  const isRangeEnd = (date: Date) => value.end && isSameDay(date, value.end);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-transparent px-3 py-2 text-sm text-[rgb(var(--foreground))] transition-colors hover:bg-[rgb(var(--muted))]"
      >
        <Calendar className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
        <span>
          {value.start && value.end
            ? `${format(value.start, "MMM d")} - ${format(value.end, "MMM d, yyyy")}`
            : "Select date range"}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-12 z-50 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--background))] p-4 shadow-soft animate-scale-in min-w-[320px]">
          {/* Presets */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  onChange(preset.getValue());
                  setOpen(false);
                }}
                className="rounded-md px-2.5 py-1 text-xs font-medium text-[rgb(var(--muted-foreground))] transition-colors hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="border-t border-[rgb(var(--border))] pt-3">
            {/* Month nav */}
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={() => setViewDate(subMonths(viewDate, 1))}
                className="rounded-lg p-1 text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold text-[rgb(var(--foreground))]">
                {format(viewDate, "MMMM yyyy")}
              </span>
              <button
                onClick={() => setViewDate(addMonths(viewDate, 1))}
                className="rounded-lg p-1 text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Day headers */}
            <div className="mb-1 grid grid-cols-7 text-center text-xs font-medium text-[rgb(var(--muted-foreground))]">
              {DAYS.map((d) => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {days.map((date) => {
                const today = isSameDay(date, new Date());
                const sameMonth = isSameMonth(date, viewDate);
                const selected = isRangeStart(date) || isRangeEnd(date);
                const rangeStart = isRangeStart(date);
                const rangeEnd = isRangeEnd(date);
                const inRange = isInRange(date);

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => handleSelect(date)}
                    onMouseEnter={() => setHoverDate(date)}
                    disabled={!sameMonth}
                    className={cn(
                      "relative h-9 w-full text-sm transition-colors rounded-lg",
                      "disabled:opacity-30 disabled:cursor-not-allowed",
                      !sameMonth && "text-transparent pointer-events-none",
                      (rangeStart || rangeEnd) &&
                        "bg-[rgb(var(--brand))] text-white font-semibold",
                      inRange && !selected &&
                        "bg-[rgb(var(--brand)_/_0.1)]",
                      !selected && !inRange && sameMonth &&
                        "text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]",
                      today && !selected &&
                        "ring-1 ring-[rgb(var(--brand))]",
                    )}
                  >
                    {format(date, "d")}
                  </button>
                );
              })}
            </div>

            {/* Apply button */}
            {value.start && value.end && (
              <button
                onClick={() => setOpen(false)}
                className="mt-3 w-full rounded-lg bg-[rgb(var(--brand))] py-2 text-sm font-medium text-white transition-colors hover:brightness-110"
              >
                Apply
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
