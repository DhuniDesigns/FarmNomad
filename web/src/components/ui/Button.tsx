import Link from "next/link";
import { forwardRef } from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "border border-primary-700 bg-primary-700 text-white shadow-[0_8px_18px_rgba(21,126,70,0.16)] hover:border-[#147a44] hover:bg-[#147a44] hover:text-white hover:shadow-[0_16px_38px_rgba(21,126,70,0.28)] active:border-primary-800 active:bg-primary-800 active:text-white active:shadow-[0_4px_12px_rgba(18,111,62,0.18)]",
  secondary: "border border-brand-border bg-white text-ink-900 hover:border-primary-700 hover:bg-primary-700 hover:text-white hover:shadow-[0_14px_34px_rgba(21,126,70,0.24)] active:border-primary-800 active:bg-primary-800 active:text-white",
  ghost: "border border-transparent text-ink-700 hover:bg-primary-50 hover:text-primary-800 active:bg-primary-100",
  darkGhost: "border border-white/35 bg-white/10 text-white hover:border-white/55 hover:bg-white/18 hover:text-white active:bg-white/24",
  tertiary: "border border-transparent text-ink-700 hover:bg-primary-50 hover:text-primary-800 active:bg-primary-100",
  link: "min-h-0 rounded-md border border-transparent bg-transparent px-0 py-0 text-primary-700 shadow-none hover:text-primary-800 hover:underline active:text-primary-800",
  icon: "border border-brand-border bg-white px-0 text-ink-900 hover:border-primary-700 hover:bg-primary-700 hover:text-white hover:shadow-[0_14px_34px_rgba(21,126,70,0.24)] active:border-primary-800 active:bg-primary-800 active:text-white",
  onDark: "border border-white/45 bg-white text-ink-900 shadow-none hover:border-primary-700 hover:bg-primary-700 hover:text-white hover:shadow-[0_16px_38px_rgba(21,126,70,0.3)] active:border-primary-800 active:bg-primary-800 active:text-white",
  onBrand: "border border-black/35 bg-white text-ink-900 shadow-none hover:border-primary-700 hover:bg-primary-700 hover:text-white hover:shadow-[0_16px_38px_rgba(21,126,70,0.3)] active:border-primary-800 active:bg-primary-800 active:text-white",
  danger: "border border-danger-600 bg-danger-600 text-white hover:border-danger-700 hover:bg-danger-700 active:border-danger-800 active:bg-danger-800",
  destructive: "border border-danger-600 bg-danger-600 text-white hover:border-danger-700 hover:bg-danger-700 active:border-danger-800 active:bg-danger-800"
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  loading?: boolean;
  loadingLabel?: string;
};

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: keyof typeof variants;
};

const base = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-[background-color,border-color,color,box-shadow,filter,transform] duration-150 ease-[var(--ease-farm-out)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-600/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-border disabled:bg-disabled-bg disabled:text-disabled-fg disabled:shadow-none disabled:active:scale-100 aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:border-border aria-disabled:bg-disabled-bg aria-disabled:text-disabled-fg aria-disabled:shadow-none motion-reduce:transition-none motion-reduce:active:scale-100";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ children, className, disabled, loading = false, loadingLabel = "Loading...", style, variant = "primary", ...props }, ref) {
  return (
    <button aria-busy={loading || undefined} className={cn(base, variants[variant], className)} disabled={disabled || loading} ref={ref} style={style} {...props}>
      {loading ? (
        <>
          <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
          <span>{loadingLabel}</span>
        </>
      ) : children}
    </button>
  );
});

export function ButtonLink({ className, href, style, variant = "primary", ...props }: ButtonLinkProps) {
  return <Link className={cn(base, variants[variant], className)} href={href} style={style} {...props} />;
}
