import Link from "next/link";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-primary-600 text-white shadow-[0_8px_18px_rgba(29,74,52,0.16)] hover:bg-primary-700 active:shadow-[0_4px_12px_rgba(29,74,52,0.14)]",
  secondary: "border border-border bg-white text-ink-900 hover:border-sage hover:bg-soft active:bg-sand/35",
  ghost: "text-ink-700 hover:bg-soft active:bg-sand/35",
  danger: "bg-danger-600 text-white hover:brightness-95 active:brightness-90"
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: keyof typeof variants;
};

const base = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-[background-color,border-color,color,box-shadow,filter,transform] duration-150 ease-[var(--ease-farm-out)] active:scale-[0.98] focus-visible:ring-3 focus-visible:ring-accent-500/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 motion-reduce:transition-none motion-reduce:active:scale-100";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ className, variant = "primary", ...props }, ref) {
  return <button className={cn(base, variants[variant], className)} ref={ref} {...props} />;
});

export function ButtonLink({ className, variant = "primary", href, ...props }: ButtonLinkProps) {
  return <Link className={cn(base, variants[variant], className)} href={href} {...props} />;
}
