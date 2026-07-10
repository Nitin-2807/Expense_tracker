import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "../../lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      options,
      placeholder,
      value,
      onChange,
      onBlur,
      name,
      id,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const activeDescendantId = useRef<string | undefined>(undefined);

    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    const selected = options.find((o) => String(o.value) === String(value));

    // Close on outside click
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setOpen(false);
        }
      };
      if (open) document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    // Close on Escape
    useEffect(() => {
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      if (open) document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }, [open]);

    const handleSelect = useCallback(
      (newValue: string | number) => {
        // react-hook-form's onChange reads event.target.value
        onChange?.({
          target: { value: newValue },
          currentTarget: { value: newValue },
        } as unknown as React.ChangeEvent<HTMLSelectElement>);
        activeDescendantId.current = undefined;
        setOpen(false);
        // Restore focus to the trigger button
        containerRef.current?.querySelector<HTMLButtonElement>("button[aria-haspopup]")?.focus();
      },
      [onChange],
    );

    return (
      <div className="space-y-1.5" ref={containerRef}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-[rgb(var(--foreground))]"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {/* Hidden native select for react-hook-form registration */}
          <select
            ref={ref}
            name={name}
            value={value ?? ""}
            onChange={onChange}
            onBlur={onBlur}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          >
            {placeholder && <option value="" />}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} />
            ))}
          </select>

          {/* Visible custom trigger */}
          <button
            type="button"
            id={selectId}
            onClick={() => setOpen(!open)}
            onBlur={onBlur as unknown as React.FocusEventHandler<HTMLButtonElement>}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={selectId ? `${selectId}-listbox` : undefined}
            role="combobox"
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors",
              "border-[rgb(var(--border))] bg-transparent",
              open && "ring-2 ring-[rgb(var(--ring))] ring-offset-1 ring-offset-[rgb(var(--background))]",
              error && "border-[rgb(var(--destructive))]",
              !selected && placeholder
                ? "text-[rgb(var(--muted-foreground))]"
                : "text-[rgb(var(--foreground))]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))]",
              className,
            )}
            {...(props as React.HTMLAttributes<HTMLButtonElement>)}
          >
            <span className="truncate">
              {selected
                ? selected.label
                : placeholder || "Select..."}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-[rgb(var(--muted-foreground))] transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </button>

          {/* Custom dropdown panel */}
          {open && (
            <div
              ref={listRef}
              id={selectId ? `${selectId}-listbox` : undefined}
              role="listbox"
              className={cn(
                "absolute z-50 mt-1 w-full rounded-lg border py-1 shadow-soft",
                "border-[rgb(var(--border))] bg-[rgb(var(--background))]",
                "max-h-60 overflow-auto",
                "animate-fade-in",
              )}
            >
              {options.length === 0 ? (
                <div className="px-3 py-2 text-sm text-[rgb(var(--muted-foreground))]">
                  No options available
                </div>
              ) : (
                options.map((opt) => {
                  const isSelected = String(opt.value) === String(value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(opt.value)}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm transition-colors",
                        isSelected
                          ? "bg-[rgb(var(--brand)_/_0.1)] text-[rgb(var(--brand))] font-medium"
                          : "text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]",
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-[rgb(var(--destructive))]">{error}</p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
