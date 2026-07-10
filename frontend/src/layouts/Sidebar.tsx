import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowDownUp,
  Tags,
  User,
  Wallet,
} from "lucide-react";
import { cn } from "../lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/transactions", label: "Transactions", icon: ArrowDownUp },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/profile", label: "Profile", icon: User },
];

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col fixed left-0 top-0 h-full bg-[rgb(var(--background))] border-r border-[rgb(var(--border))] transition-all duration-200 z-40",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 border-b border-[rgb(var(--border))] px-4 h-16",
          collapsed && "justify-center px-0",
        )}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgb(var(--brand))] text-white">
          <Wallet className="h-5 w-5" />
        </div>
        {!collapsed && (
          <span className="text-base font-bold text-[rgb(var(--foreground))]">
            ExpenseTracker
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return item.disabled ? (
            <div
              key={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[rgb(var(--muted-foreground))] opacity-40 cursor-not-allowed",
                collapsed && "justify-center px-0",
              )}
              title={`${item.label} (coming soon)`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[rgb(var(--brand)_/_0.1)] text-[rgb(var(--brand))]"
                    : "text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]",
                  collapsed && "justify-center px-0",
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
