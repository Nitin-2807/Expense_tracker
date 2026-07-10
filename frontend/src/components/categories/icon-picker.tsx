import { useState } from "react";
import * as LucideIcons from "lucide-react";

// ── Registry of category icons ─────────────────────────────────────
// Maps icon name strings to lucide-react components for rendering.
export const CATEGORY_ICONS = [
  "UtensilsCrossed",
  "Coffee",
  "ShoppingCart",
  "ShoppingBag",
  "Shirt",
  "Car",
  "Bus",
  "Plane",
  "Home",
  "Building",
  "Zap",
  "Droplet",
  "Flame",
  "Wifi",
  "Smartphone",
  "Tv",
  "Music",
  "Gamepad2",
  "Film",
  "BookOpen",
  "GraduationCap",
  "Heart",
  "Stethoscope",
  "Briefcase",
  "PiggyBank",
  "Gift",
  "Dumbbell",
  "PawPrint",
  "CreditCard",
  "Receipt",
  "Star",
  "Smile",
  "MoreHorizontal",
] as const;

export type CategoryIconName = (typeof CATEGORY_ICONS)[number];

export function getIconComponent(
  name: string,
): React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }> {
  const icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }>>)[name];
  return icon ?? LucideIcons.HelpCircle;
}

// ── Searchable Icon Picker ─────────────────────────────────────────

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [search, setSearch] = useState("");

  const filtered = CATEGORY_ICONS.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[rgb(var(--foreground))] block">
        Icon
      </label>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search icons…"
        className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 py-2 text-sm text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] outline-none focus:border-[rgb(var(--ring))] focus:ring-1 focus:ring-[rgb(var(--ring))] transition-colors"
      />
      <div className="grid grid-cols-7 gap-2 max-h-48 overflow-y-auto rounded-lg border border-[rgb(var(--border))] p-3">
        {filtered.map((name) => {
          const Icon = getIconComponent(name);
          const isSelected = value === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name)}
              title={name}
              className={`flex items-center justify-center rounded-lg p-2 transition-colors ${
                isSelected
                  ? "bg-[rgb(var(--brand)_/_0.15)] text-[rgb(var(--brand))] ring-2 ring-[rgb(var(--brand))]"
                  : "text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]"
              }`}
            >
              <Icon className="h-5 w-5" />
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-7 py-4 text-center text-sm text-[rgb(var(--muted-foreground))]">
            No icons found
          </p>
        )}
      </div>
    </div>
  );
}
