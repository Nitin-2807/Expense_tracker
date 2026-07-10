import { Moon, Sun, Monitor } from "lucide-react";
import { UserButton } from "@clerk/react";
import { useThemeStore } from "../stores/theme-store";
import { cn } from "../lib/utils";

export interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { mode, setMode } = useThemeStore();

  const cycleTheme = () => {
    const modes: Array<"light" | "dark" | "system"> = ["light", "dark", "system"];
    const idx = modes.indexOf(mode);
    setMode(modes[(idx + 1) % modes.length]);
  };

  const themeIcon = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };
  const ThemeIcon = themeIcon[mode];

  return (
    <header className="sticky top-0 z-30 bg-[rgb(var(--background)_/_0.8)] backdrop-blur-lg border-b border-[rgb(var(--border))]">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-[rgb(var(--foreground))] truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[rgb(var(--muted-foreground))] truncate">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {actions}

          {/* Theme toggle */}
          <button
            onClick={cycleTheme}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
              "text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]",
            )}
            title={`Theme: ${mode}`}
          >
            <ThemeIcon className="h-[18px] w-[18px]" />
          </button>

          {/* Clerk user button */}
          <UserButton />
        </div>
      </div>
    </header>
  );
}
