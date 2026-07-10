import { ToggleGroup } from "../ui";
import type { TimeRange } from "../../types";

interface TimeRangeFilterProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

const options = [
  { value: "this_month" as TimeRange, label: "This Month" },
  { value: "last_month" as TimeRange, label: "Last Month" },
  { value: "last_3_months" as TimeRange, label: "3 Months" },
  { value: "this_year" as TimeRange, label: "This Year" },
  { value: "all_time" as TimeRange, label: "All Time" },
];

const LABEL_MAP: Record<TimeRange, string> = {
  this_month: "this month",
  last_month: "last month",
  last_3_months: "the last 3 months",
  this_year: "this year",
  all_time: "all time",
};

export function TimeRangeFilter({ value, onChange }: TimeRangeFilterProps) {
  return (
    <div>
      <ToggleGroup
        options={options}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export function getTimeRangeLabel(range: TimeRange): string {
  return LABEL_MAP[range];
}
