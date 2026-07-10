import { cn } from "../../lib/utils";

export interface ToggleOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

export interface ToggleGroupProps<T extends string = string> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
}

export function ToggleGroup<T extends string = string>({
  options,
  value,
  onChange,
  className,
  size = "sm",
}: ToggleGroupProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-[rgb(var(--border))] overflow-hidden",
        className,
      )}
      role="radiogroup"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          role="radio"
          aria-checked={value === opt.value}
          className={cn(
            "flex items-center gap-1.5 font-medium transition-colors",
            size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
            value === opt.value
              ? "bg-[rgb(var(--brand))] text-white"
              : "bg-transparent text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]",
          )}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
