import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className,
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--destructive)_/_0.1)]">
        <AlertCircle className="h-8 w-8 text-[rgb(var(--destructive))]" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-[rgb(var(--foreground))]">
        {title}
      </h3>
      <p className="mb-6 max-w-sm text-sm text-[rgb(var(--muted-foreground))]">
        {message}
      </p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} icon={<RefreshCw className="h-4 w-4" />}>
          Try Again
        </Button>
      )}
    </div>
  );
}
