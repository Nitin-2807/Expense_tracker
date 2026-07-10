import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Button, Input, Select, SlideOver } from "../../components/ui";
import { useCategories } from "../../hooks/useCategories";
import {
  transactionFormSchema,
  type TransactionFormValues,
} from "../../lib/validations";
import type { Transaction } from "../../types";

export interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TransactionFormValues) => void;
  /** Pass an existing transaction to enter edit mode */
  editTransaction?: Transaction | null;
  /** Whether a submit is in progress */
  loading?: boolean;
}

export function TransactionForm({
  open,
  onClose,
  onSubmit,
  editTransaction,
  loading = false,
}: TransactionFormProps) {
  const { data: categories = [] } = useCategories();
  const isEditing = !!editTransaction;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema) as any,
    defaultValues: {
      type: "expense",
      amount: undefined as unknown as number,
      description: "",
      category_id: undefined,
      date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const transactionType = watch("type");

  // Populate form when editing
  useEffect(() => {
    if (editTransaction) {
      reset({
        type: editTransaction.type,
        amount: editTransaction.amount,
        description: editTransaction.description,
        category_id: editTransaction.category_id ?? undefined,
        date:
          typeof editTransaction.date === "string"
            ? editTransaction.date
            : format(new Date(editTransaction.date), "yyyy-MM-dd"),
      });
    } else {
      reset({
        type: "expense",
        amount: undefined as unknown as number,
        description: "",
        category_id: undefined,
        date: format(new Date(), "yyyy-MM-dd"),
      });
    }
  }, [editTransaction, reset]);

  const onFormSubmit = (values: TransactionFormValues) => {
    onSubmit(values);
  };

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Transaction" : "Add Transaction"}
      width="md"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
        {/* Type toggle */}
        <div>
          <label className="text-sm font-medium text-[rgb(var(--foreground))] block mb-2">
            Type
          </label>
          <div className="flex rounded-lg border border-[rgb(var(--border))] overflow-hidden">
            <button
              type="button"
              onClick={() => setValue("type", "expense")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                transactionType === "expense"
                  ? "bg-[rgb(var(--destructive))] text-white"
                  : "bg-transparent text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setValue("type", "income")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                transactionType === "income"
                  ? "bg-[rgb(var(--success))] text-white"
                  : "bg-transparent text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]"
              }`}
            >
              Income
            </button>
          </div>
        </div>

        {/* Amount */}
        <Input
          label="Amount *"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          error={errors.amount?.message}
          {...register("amount")}
        />

        {/* Description */}
        <div>
          <Input
            label="Description"
            placeholder="What was this for? (optional)"
            error={errors.description?.message}
            {...register("description")}
          />
          <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
            {watch("description")?.length || 0}/500
          </p>
        </div>

        {/* Category — only for expenses */}
        {transactionType === "expense" && (
          <Select
            label="Category *"
            placeholder="Select a category"
            error={errors.category_id?.message}
            value={watch("category_id") ?? ""}
            options={categories.map((c) => ({
              value: c.id,
              label: `${c.icon} ${c.name}`,
            }))}
            onChange={(e) => {
              const v = (e as unknown as React.ChangeEvent<HTMLSelectElement>).target?.value;
              setValue("category_id", v ? Number(v) : undefined, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            onBlur={() => trigger("category_id")}
          />
        )}

        {/* Date */}
        <Input
          label="Date *"
          type="date"
          error={errors.date?.message}
          {...register("date")}
        />

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="flex-1"
          >
            {isEditing ? "Save Changes" : "Add Transaction"}
          </Button>
        </div>
      </form>
    </SlideOver>
  );
}
