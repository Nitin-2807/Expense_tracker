import { useState } from "react";
import {
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  Card,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  TableSkeleton,
  Pagination,
} from "../../components/ui";
import { cn } from "../../lib/utils";
import type {
  Transaction,
  Category,
  PaginatedResponse,
} from "../../types";

interface TransactionTableProps {
  data: PaginatedResponse<Transaction> | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
  page: number;
  onPageChange: (p: number) => void;
  categories: Category[];
  onDelete: (id: number, type: "income" | "expense") => void;
  onEditClick: (transaction: Transaction) => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TransactionTable({
  data,
  isLoading,
  isError,
  error,
  onRetry,
  page,
  onPageChange,
  categories: _categories,
  onDelete,
  onEditClick,
}: TransactionTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: number;
    type: "income" | "expense";
  } | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // ── Helper to make unique key from Transaction ──────────────
  const tkey = (t: Transaction) => `${t.type}-${t.id}`;

  const isAllSelected =
    data?.items.length &&
    data.items.every((t) => selected.has(tkey(t)));

  // ── Selection ──────────────────────────────────────────────
  const toggleSelect = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!data) return;
    if (isAllSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.items.map(tkey)));
    }
  };

  // ── Loading state ──────────────────────────────────────────
  if (isLoading) {
    return (
      <Card>
        <div className="space-y-4">
          <div className="h-5 w-32 rounded bg-[rgb(var(--muted))] animate-pulse" />
          <TableSkeleton rows={6} />
        </div>
      </Card>
    );
  }

  // ── Error state ────────────────────────────────────────────
  if (isError) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[rgb(var(--destructive)_/_0.1)]">
            <Trash2 className="h-7 w-7 text-[rgb(var(--destructive))]" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-[rgb(var(--foreground))]">
            Failed to load transactions
          </h3>
          <p className="mb-6 max-w-sm text-sm text-[rgb(var(--muted-foreground))]">
            {error?.message || "An unexpected error occurred"}
          </p>
          <Button variant="secondary" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  // ── Empty state ────────────────────────────────────────────
  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        title="No transactions found"
        description={
          selected.size > 0
            ? "Try adjusting your filters or search terms."
            : "Add your first transaction to get started."
        }
      />
    );
  }

  // ── Bulk selection bar ─────────────────────────────────────
  const renderBulkBar = () => {
    if (selected.size === 0) return null;
    return (
      <div className="flex items-center justify-between rounded-lg bg-[rgb(var(--brand)_/_0.1)] px-4 py-2.5 mb-3 animate-slide-up">
        <span className="text-sm font-medium text-[rgb(var(--brand))]">
          {selected.size} selected
        </span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelected(new Set())}
          >
            Deselect all
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setBulkDeleteConfirm(true)}
            icon={<Trash2 className="h-4 w-4" />}
          >
            Delete
          </Button>
        </div>
      </div>
    );
  };

  // ── Bulk delete confirm ────────────────────────────────────
  const handleBulkDelete = () => {
    selected.forEach((key) => {
      const [type, idStr] = key.split("-");
      onDelete(Number(idStr), type as "income" | "expense");
    });
    setSelected(new Set());
    setBulkDeleteConfirm(false);
  };

  // ── Table ──────────────────────────────────────────────────
  return (
    <div>
      {renderBulkBar()}

      <Card className="overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {/* Header */}
            <thead>
              <tr className="border-b border-[rgb(var(--border))] bg-[rgb(var(--muted))]">
                <th className="w-10 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={!!isAllSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-[rgb(var(--border))] text-[rgb(var(--brand))] focus:ring-[rgb(var(--brand))]"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
                  Amount
                </th>
                <th className="w-20 px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-[rgb(var(--border))]">
              {data.items.map((t) => {
                const key = tkey(t);

                return (
                  <tr
                    key={key}
                    className={cn(
                      "transition-colors hover:bg-[rgb(var(--muted)_/_0.5)]",
                      selected.has(key) && "bg-[rgb(var(--brand)_/_0.04)]",
                    )}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(key)}
                        onChange={() => toggleSelect(key)}
                        className="h-4 w-4 rounded border-[rgb(var(--border))] text-[rgb(var(--brand))] focus:ring-[rgb(var(--brand))]"
                      />
                    </td>

                    {/* Type icon */}
                    <td className="px-4 py-3">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg",
                          t.type === "income"
                            ? "bg-[rgb(var(--success)_/_0.1)]"
                            : "bg-[rgb(var(--destructive)_/_0.1)]",
                        )}
                      >
                        {t.type === "income" ? (
                          <ArrowUpRight className="h-4 w-4 text-[rgb(var(--success))]" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-[rgb(var(--destructive))]" />
                        )}
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-4 py-3 max-w-[200px]">
                      <span className="font-medium text-[rgb(var(--foreground))] truncate block">
                        {t.description || (
                          <span className="text-[rgb(var(--muted-foreground))] italic">—</span>
                        )}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      {t.type === "expense" ? (
                        <Badge variant="default" size="sm">
                          {t.category}
                        </Badge>
                      ) : (
                        <span className="text-xs text-[rgb(var(--muted-foreground))]">
                          —
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3">
                      <span className="text-[rgb(var(--foreground))]">
                        {formatDate(t.date)}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 text-right">
                      <span
                        className={cn(
                          "font-semibold",
                          t.type === "income"
                            ? "text-[rgb(var(--success))]"
                            : "text-[rgb(var(--foreground))]",
                        )}
                      >
                        {t.type === "income" ? "+" : "-"}
                        {formatCurrency(t.amount)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditClick(t)}
                          icon={<Pencil className="h-4 w-4" />}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setDeleteConfirm({
                              id: t.id,
                              type: t.type,
                            })
                          }
                          icon={<Trash2 className="h-4 w-4 text-[rgb(var(--destructive))]" />}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          page={page}
          pages={data.pages}
          onPageChange={onPageChange}
        />
      </div>

      {/* Single delete confirm */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            onDelete(deleteConfirm.id, deleteConfirm.type);
            setDeleteConfirm(null);
          }
        }}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />

      {/* Bulk delete confirm */}
      <ConfirmDialog
        open={bulkDeleteConfirm}
        onClose={() => setBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selected.size} transactions?`}
        message={`Are you sure you want to delete ${selected.size} selected transactions? This action cannot be undone.`}
        confirmLabel={`Delete ${selected.size}`}
        variant="danger"
      />
    </div>
  );
}
