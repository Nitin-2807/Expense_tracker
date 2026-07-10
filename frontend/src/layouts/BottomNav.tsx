import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowDownUp,
  Tags,
  User,
} from "lucide-react";
import { cn } from "../lib/utils";

interface MobileNavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
  disabled?: boolean;
}

const mobileNavItems: MobileNavItem[] = [
  { to: "/", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/transactions", label: "Transactions", icon: ArrowDownUp },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[rgb(var(--background))] border-t border-[rgb(var(--border))] safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return item.disabled ? (
            <div
              key={item.to}
              className="flex flex-col items-center justify-center gap-0.5 px-3 py-1 opacity-40 cursor-not-allowed text-[rgb(var(--muted-foreground))]"
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-0.5 px-3 py-1 transition-colors",
                  isActive
                    ? "text-[rgb(var(--brand))]"
                    : "text-[rgb(var(--muted-foreground))]",
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
