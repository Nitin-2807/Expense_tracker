import { useState } from "react";
import { cn } from "../../lib/utils";

// ── Preset colour palette ──────────────────────────────────────────
// Balanced across hues — good for category badges and charts.
export const CATEGORY_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
  "#64748b", // slate
  "#78716c", // stone
  "#44403c", // neutral
] as const;

// ── Color Picker ───────────────────────────────────────────────────

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState("");

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[rgb(var(--foreground))] block">
        Colour
      </label>
      <div className="flex flex-wrap gap-2.5">
        {CATEGORY_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            title={color}
            className={cn(
              "h-8 w-8 rounded-full transition-transform hover:scale-110",
              value === color && "ring-2 ring-offset-2 ring-[rgb(var(--ring))] scale-110",
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* Custom hex input */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded border border-[rgb(var(--border))] bg-transparent"
        />
        <input
          type="text"
          value={customColor || value}
          onChange={(e) => {
            setCustomColor(e.target.value);
            if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
              onChange(e.target.value);
            }
          }}
          onBlur={() => setCustomColor("")}
          placeholder="#hex"
          className="flex-1 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 py-1.5 text-sm text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] outline-none focus:border-[rgb(var(--ring))] focus:ring-1 focus:ring-[rgb(var(--ring))] transition-colors"
        />
      </div>
    </div>
  );
}
