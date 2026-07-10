import { cn } from "../../lib/utils";

export interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  default:
    "bg-[rgb(var(--muted))] text-[rgb(var(--foreground))]",
  success:
    "bg-[rgb(var(--success)_/_0.15)] text-[rgb(var(--success))]",
  warning:
    "bg-[rgb(var(--warning)_/_0.15)] text-[rgb(var(--warning))]",
  danger:
    "bg-[rgb(var(--destructive)_/_0.15)] text-[rgb(var(--destructive))]",
  info:
    "bg-[rgb(var(--brand)_/_0.15)] text-[rgb(var(--brand))]",
};

const sizeStyles = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
};

export function Badge({
  variant = "default",
  size = "md",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
