import { Inbox } from "lucide-react";
import { cn } from "../../lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className,
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--muted))]">
        {icon || <Inbox className="h-8 w-8 text-[rgb(var(--muted-foreground))]" />}
      </div>
      <h3 className="mb-1 text-base font-semibold text-[rgb(var(--foreground))]">
        {title}
      </h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-[rgb(var(--muted-foreground))]">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
