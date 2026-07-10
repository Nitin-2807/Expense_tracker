import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import { TransactionFilters } from "../components/transactions/TransactionFilters";
import { TransactionTable } from "../components/transactions/TransactionTable";
import { TransactionForm } from "../components/transactions/TransactionForm";
import { Button } from "../components/ui";
import {
  useTransactions,
  useDeleteExpense,
  useDeleteIncome,
  useUpdateExpense,
  useUpdateIncome,
  useCreateExpense,
  useCreateIncome,
} from "../hooks/useTransactions";
import { useCategories } from "../hooks/useCategories";
import type { Transaction, TransactionQueryParams } from "../types";
import type { TransactionFormValues } from "../lib/validations";
import type { DateRange } from "../components/ui/DateRangePicker";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function Transactions() {
  const location = useLocation();

  // ── SlideOver state ─────────────────────────────────────────
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);

  // Open add slideover when navigated from Dashboard
  useEffect(() => {
    if (location.state?.openAdd) {
      setSlideOverOpen(true);
      setEditTransaction(null);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ── Filter state ──────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [sort, setSort] = useState("date_desc");
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });

  const debouncedSearch = useDebounce(search, 300);

  // ── API hooks ─────────────────────────────────────────────────
  const params: TransactionQueryParams = {
    search: debouncedSearch || undefined,
    type: (type || undefined) as TransactionQueryParams["type"],
    category_id: categoryId,
    sort: sort as TransactionQueryParams["sort"],
    page,
    per_page: 25,
    start_date: dateRange.start?.toISOString().split("T")[0],
    end_date: dateRange.end?.toISOString().split("T")[0],
  };

  const { data, isLoading, isError, error, refetch } = useTransactions(params);
  const categoriesQuery = useCategories();

  const deleteExpense = useDeleteExpense();
  const deleteIncome = useDeleteIncome();
  const updateExpense = useUpdateExpense();
  const updateIncome = useUpdateIncome();
  const createExpense = useCreateExpense();
  const createIncome = useCreateIncome();

  const categories = categoriesQuery.data ?? [];

  // Reset page when filters change
  const prevFilters = useRef("");
  useEffect(() => {
    const filters = JSON.stringify({ search: debouncedSearch, type, categoryId, sort, dateRange });
    if (prevFilters.current && prevFilters.current !== filters) {
      setPage(1);
    }
    prevFilters.current = filters;
  }, [debouncedSearch, type, categoryId, sort, dateRange]);

  // ── CRUD handlers ─────────────────────────────────────────────
  const handleDelete = useCallback(
    (id: number, ttype: "income" | "expense") => {
      if (ttype === "expense") {
        deleteExpense.mutate(id);
      } else {
        deleteIncome.mutate(id);
      }
    },
    [deleteExpense, deleteIncome],
  );

  const handleEditClick = useCallback((transaction: Transaction) => {
    setEditTransaction(transaction);
    setSlideOverOpen(true);
  }, []);

  const closeSlideOver = useCallback(() => {
    setSlideOverOpen(false);
    setEditTransaction(null);
  }, []);

  const isSubmitting =
    createExpense.isPending ||
    createIncome.isPending ||
    updateExpense.isPending ||
    updateIncome.isPending;

  const handleFormSubmit = useCallback(
    (values: TransactionFormValues) => {
      const dateStr = values.date;
      if (editTransaction) {
        // ── Update ──
        if (editTransaction.type === "expense") {
          updateExpense.mutate(
            {
              id: editTransaction.id,
              data: {
                amount: values.amount,
                description: values.description,
                category_id: values.category_id ?? undefined,
                date: dateStr,
              },
            },
            { onSuccess: () => closeSlideOver() },
          );
        } else {
          updateIncome.mutate(
            {
              id: editTransaction.id,
              data: {
                amount: values.amount,
                description: values.description,
                date: dateStr,
              },
            },
            { onSuccess: () => closeSlideOver() },
          );
        }
      } else {
        // ── Create ──
        if (values.type === "expense") {
          createExpense.mutate(
            {
              amount: values.amount,
              category_id: values.category_id!,
              description: values.description,
              date: dateStr,
            },
            { onSuccess: () => closeSlideOver() },
          );
        } else {
          createIncome.mutate(
            {
              amount: values.amount,
              description: values.description,
              date: dateStr,
            },
            { onSuccess: () => closeSlideOver() },
          );
        }
      }
    },
    [
      editTransaction,
      updateExpense,
      updateIncome,
      createExpense,
      createIncome,
      closeSlideOver,
    ],
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <TransactionFilters
        search={search}
        onSearchChange={setSearch}
        type={type}
        onTypeChange={(v) => {
          setType(v);
          if (v !== "expense") setCategoryId(undefined);
        }}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        categories={categories}
        sort={sort}
        onSortChange={setSort}
      />

      {/* Add button */}
      <div className="flex items-center justify-end">
        <Button
          icon={<Plus className="h-4 w-4" />}
          onClick={() => {
            setEditTransaction(null);
            setSlideOverOpen(true);
          }}
        >
          Add Transaction
        </Button>
      </div>

      {/* Table */}
      <TransactionTable
        data={data}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        page={page}
        onPageChange={setPage}
        categories={categories}
        onDelete={handleDelete}
        onEditClick={handleEditClick}
      />

      {/* Add / Edit SlideOver */}
      <TransactionForm
        open={slideOverOpen}
        onClose={closeSlideOver}
        onSubmit={handleFormSubmit}
        editTransaction={editTransaction}
        loading={isSubmitting}
      />
    </div>
  );
}
