import { useState, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "../hooks/useCategories";
import { CategoryForm, type CategoryFormValues } from "../components/categories/CategoryForm";
import { getIconComponent } from "../components/categories/icon-picker";
import { TimeRangeFilter, getTimeRangeLabel } from "../components/dashboard/TimeRangeFilter";
import { Button, Card, Badge, ConfirmDialog, EmptyState, ErrorState, CardSkeleton } from "../components/ui";
import { cn } from "../lib/utils";
import type { TimeRange, Category } from "../types";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Categories() {
  const [timeRange, setTimeRange] = useState<TimeRange>("this_month");

  // ── Data ───────────────────────────────────────────────────────
  const { data: categories, isLoading, isError, error, refetch } = useCategories();
  const { data: dashboard } = useDashboard(timeRange);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  // Build spend lookup: category name → amount
  const spendByCategory = new Map<string, number>();
  if (dashboard?.expenses_by_category) {
    for (const item of dashboard.expenses_by_category) {
      spendByCategory.set(item.category, item.amount);
    }
  }

  // ── SlideOver state ────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  const openAdd = useCallback(() => {
    setEditCategory(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((cat: Category) => {
    setEditCategory(cat);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditCategory(null);
  }, []);

  // ── Delete confirm ─────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // ── Form submission ────────────────────────────────────────────
  const handleSubmit = useCallback(
    (values: CategoryFormValues) => {
      if (editCategory) {
        updateCategory.mutate(
          { id: editCategory.id, data: values },
          { onSuccess: () => closeForm() },
        );
      } else {
        createCategory.mutate(values, { onSuccess: () => closeForm() });
      }
    },
    [editCategory, createCategory, updateCategory, closeForm],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      deleteCategory.mutate(deleteTarget.id);
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteCategory]);

  const isPending =
    createCategory.isPending || updateCategory.isPending || deleteCategory.isPending;

  // ── Loading state ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-10 w-72">
            <div className="h-full w-full rounded-lg bg-[rgb(var(--muted))] animate-pulse" />
          </div>
          <div className="h-10 w-40 rounded-lg bg-[rgb(var(--muted))] animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────
  if (isError) {
    return (
      <ErrorState
        title="Failed to load categories"
        message={error instanceof Error ? error.message : "Unable to fetch categories"}
        onRetry={() => refetch()}
      />
    );
  }

  // ── Empty state ────────────────────────────────────────────────
  if (!categories || categories.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
          <Button icon={<Plus className="h-4 w-4" />} onClick={openAdd}>
            Add Category
          </Button>
        </div>
        <EmptyState
          title="No categories yet"
          description="Create your first category to start organising expenses."
          action={<Button onClick={openAdd}>Create Category</Button>}
        />
        <CategoryForm
          open={formOpen}
          onClose={closeForm}
          onSubmit={handleSubmit}
          editCategory={editCategory}
          loading={isPending}
        />
      </div>
    );
  }

  // ── Data state ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
        <Button icon={<Plus className="h-4 w-4" />} onClick={openAdd}>
          Add Category
        </Button>
      </div>

      {/* Spend summary */}
      {dashboard && (
        <p className="text-sm text-[rgb(var(--muted-foreground))]">
          Total expenses {getTimeRangeLabel(timeRange)}:{" "}
          <span className="font-semibold text-[rgb(var(--foreground))]">
            {formatCurrency(dashboard.total_expense)}
          </span>
        </p>
      )}

      {/* Category cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const Icon = getIconComponent(cat.icon);
          const spend = spendByCategory.get(cat.name) ?? 0;

          return (
            <Card
              key={cat.id}
              className={cn(
                "relative flex items-center gap-4 p-4 transition-colors",
                cat.is_default && "border-dashed opacity-80",
              )}
            >
              {/* Color + Icon */}
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${cat.color}20` }}
              >
                <Icon className="h-6 w-6" style={{ color: cat.color }} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[rgb(var(--foreground))] truncate">
                    {cat.name}
                  </span>
                  {cat.is_default && (
                    <Badge variant="info" size="sm">Default</Badge>
                  )}
                </div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">
                  {spend > 0 ? formatCurrency(spend) : "No expenses"}
                </p>
              </div>

              {/* Actions — hidden for defaults */}
              {!cat.is_default && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(cat)}
                    icon={<Pencil className="h-4 w-4" />}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(cat)}
                    icon={<Trash2 className="h-4 w-4 text-[rgb(var(--destructive))]" />}
                  />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add / Edit SlideOver */}
      <CategoryForm
        open={formOpen}
        onClose={closeForm}
        onSubmit={handleSubmit}
        editCategory={editCategory}
        loading={isPending}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete "${deleteTarget?.name}"?`}
        message={`Are you sure you want to delete this category? Existing expenses in this category will be reassigned to the "Others" default category. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteCategory.isPending}
      />
    </div>
  );
}
