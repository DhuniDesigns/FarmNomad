import { forwardRef } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BaseProps = {
  label: string;
  error?: string;
  hint?: string;
};

export const TextField = forwardRef<HTMLInputElement, BaseProps & InputHTMLAttributes<HTMLInputElement>>(function TextField({ label, error, hint, className, ...props }, ref) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-ink-900">
      {label}
      <input ref={ref} className={cn("min-h-11 rounded-lg border border-border bg-white px-3 text-base font-medium text-ink-900 transition-[background-color,border-color,box-shadow,color] duration-150 ease-[var(--ease-farm-out)] placeholder:text-ink-500 hover:border-primary-600 disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-fg focus-visible:border-primary-600 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-600/30", className)} {...props} />
      {hint ? <span className="text-xs font-normal text-ink-500">{hint}</span> : null}
      {error ? <span className="text-sm font-medium text-danger-600">{error}</span> : null}
    </label>
  );
});

export const TextAreaField = forwardRef<HTMLTextAreaElement, BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextAreaField({ label, error, hint, className, ...props }, ref) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-ink-900">
      {label}
      <textarea ref={ref} className={cn("min-h-28 rounded-lg border border-border bg-white px-3 py-2 text-base font-medium text-ink-900 transition-[background-color,border-color,box-shadow,color] duration-150 ease-[var(--ease-farm-out)] placeholder:text-ink-500 hover:border-primary-600 disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-fg focus-visible:border-primary-600 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-600/30", className)} {...props} />
      {hint ? <span className="text-xs font-normal text-ink-500">{hint}</span> : null}
      {error ? <span className="text-sm font-medium text-danger-600">{error}</span> : null}
    </label>
  );
});

export const SelectField = forwardRef<HTMLSelectElement, BaseProps & SelectHTMLAttributes<HTMLSelectElement>>(function SelectField({ label, error, hint, className, children, ...props }, ref) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-ink-900">
      {label}
      <select ref={ref} className={cn("min-h-11 rounded-lg border border-border bg-white px-3 text-base font-medium text-ink-900 transition-[background-color,border-color,box-shadow,color] duration-150 ease-[var(--ease-farm-out)] hover:border-primary-600 disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-fg focus-visible:border-primary-600 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-600/30", className)} {...props}>
        {children}
      </select>
      {hint ? <span className="text-xs font-normal text-ink-500">{hint}</span> : null}
      {error ? <span className="text-sm font-medium text-danger-600">{error}</span> : null}
    </label>
  );
});
