import { Search, X } from "lucide-react";
import { Input, Select, ToggleGroup } from "../ui";
import { DateRangePicker } from "../ui";
import type { DateRange } from "../ui/DateRangePicker";
import type { Category } from "../../types";

interface TransactionFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  type: string;
  onTypeChange: (v: string) => void;
  categoryId: number | undefined;
  onCategoryChange: (v: number | undefined) => void;
  dateRange: DateRange;
  onDateRangeChange: (v: DateRange) => void;
  categories: Category[];
  sort: string;
  onSortChange: (v: string) => void;
}

const typeOptions = [
  { value: "", label: "All" },
  { value: "expense", label: "Expenses" },
  { value: "income", label: "Income" },
];

const sortOptions = [
  { value: "date_desc", label: "Newest First" },
  { value: "date_asc", label: "Oldest First" },
  { value: "amount_desc", label: "Highest Amount" },
  { value: "amount_asc", label: "Lowest Amount" },
];

export function TransactionFilters({
  search,
  onSearchChange,
  type,
  onTypeChange,
  categoryId,
  onCategoryChange,
  dateRange,
  onDateRangeChange,
  categories,
  sort,
  onSortChange,
}: TransactionFiltersProps) {
  const hasFilters = search || type || categoryId || dateRange.start || dateRange.end;

  return (
    <div className="space-y-3">
      {/* Row 1: Search + Type */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search descriptions..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex gap-2">
          <ToggleGroup
            options={typeOptions}
            value={type}
            onChange={onTypeChange}
            size="md"
          />
        </div>
      </div>

      {/* Row 2: Category + Date + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div className="w-full sm:w-44">
          <Select
            placeholder="All Categories"
            value={categoryId ?? ""}
            onChange={(e) =>
              onCategoryChange(
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            options={categories.map((c) => ({
              value: c.id,
              label: `${c.icon} ${c.name}`,
            }))}
          />
        </div>

        <DateRangePicker value={dateRange} onChange={onDateRangeChange} />

        <div className="w-full sm:w-44">
          <Select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            options={sortOptions.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
          />
        </div>

        {hasFilters && (
          <button
            onClick={() => {
              onSearchChange("");
              onTypeChange("");
              onCategoryChange(undefined);
              onDateRangeChange({ start: null, end: null });
              onSortChange("date_desc");
            }}
            className="flex items-center gap-1 text-xs font-medium text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] whitespace-nowrap py-2"
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
