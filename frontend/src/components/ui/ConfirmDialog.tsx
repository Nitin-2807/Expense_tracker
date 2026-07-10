import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";
import { Modal } from "./Modal";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirm",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center">
        <div
          className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
            variant === "danger"
              ? "bg-[rgb(var(--destructive)_/_0.15)]"
              : "bg-[rgb(var(--muted))]"
          }`}
        >
          <AlertTriangle
            className={`h-6 w-6 ${
              variant === "danger"
                ? "text-[rgb(var(--destructive))]"
                : "text-[rgb(var(--muted-foreground))]"
            }`}
          />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-[rgb(var(--foreground))]">
          {title}
        </h3>
        <p className="mb-6 text-sm text-[rgb(var(--muted-foreground))]">
          {message}
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
