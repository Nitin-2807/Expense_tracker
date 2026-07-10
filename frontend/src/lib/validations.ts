import { z } from "zod";

export const transactionFormSchema = z
  .object({
    type: z.enum(["income", "expense"]),
    amount: z.coerce
      .number({ message: "Amount must be a number" })
      .positive("Amount must be greater than 0")
      .max(9_999_999.99, "Amount is too large"),
    description: z
      .string()
      .max(500, "Description must be under 500 characters")
      .default(""),
    category_id: z.coerce.number().int().positive().nullable().optional(),
    date: z.string().min(1, "Date is required"),
  })
  .refine(
    (data) => {
      if (data.type === "expense" && !data.category_id) {
        return false;
      }
      return true;
    },
    { message: "Category is required for expenses", path: ["category_id"] },
  );

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
