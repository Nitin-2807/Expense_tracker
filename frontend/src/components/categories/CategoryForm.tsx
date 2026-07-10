import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, SlideOver } from "../ui";
import { IconPicker } from "./icon-picker";
import { ColorPicker } from "./color-picker";
import type { Category } from "../../types";

export interface CategoryFormValues {
  name: string;
  icon: string;
  color: string;
}

export interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => void;
  editCategory?: Category | null;
  loading?: boolean;
}

export function CategoryForm({
  open,
  onClose,
  onSubmit,
  editCategory,
  loading = false,
}: CategoryFormProps) {
  const isEditing = !!editCategory;

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } =
    useForm<CategoryFormValues>({
      defaultValues: {
        name: "",
        icon: "MoreHorizontal",
        color: "#64748b",
      },
    });

  // Populate form when editing
  useEffect(() => {
    if (editCategory) {
      reset({
        name: editCategory.name,
        icon: editCategory.icon || "MoreHorizontal",
        color: editCategory.color || "#64748b",
      });
    } else {
      reset({
        name: "",
        icon: "MoreHorizontal",
        color: "#64748b",
      });
    }
  }, [editCategory, reset]);

  const selectedIcon = watch("icon");
  const selectedColor = watch("color");

  const onFormSubmit = (values: CategoryFormValues) => {
    onSubmit(values);
  };

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Category" : "Add Category"}
      width="md"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
        {/* Name */}
        <Input
          label="Name"
          placeholder="e.g. Groceries, Transport, Salary"
          error={errors.name?.message}
          {...register("name", {
            required: "Name is required",
            maxLength: { value: 50, message: "Name must be under 50 characters" },
          })}
        />

        {/* Icon picker */}
        <IconPicker
          value={selectedIcon}
          onChange={(icon) => setValue("icon", icon)}
        />

        {/* Color picker */}
        <ColorPicker
          value={selectedColor}
          onChange={(color) => setValue("color", color)}
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
            {isEditing ? "Save Changes" : "Add Category"}
          </Button>
        </div>
      </form>
    </SlideOver>
  );
}
