import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  ACTIVE: "border border-brand-border bg-primary-50 text-primary-800",
  DRAFT: "bg-sand/40 text-ink-700",
  SOLD_OUT: "bg-ink-900 text-white",
  EXPIRED: "border border-[#e0b889] bg-[#f3e5d7] text-warning-600",
  ARCHIVED: "bg-sand/60 text-ink-700",
  PENDING: "border border-[#e0b889] bg-[#f3e5d7] text-warning-600",
  ACCEPTED: "border border-[#b8d4ef] bg-info-50 text-info-600",
  READY: "border border-brand-border bg-primary-50 text-primary-800",
  COMPLETED: "bg-ink-900 text-white",
  CANCELLED: "bg-red-50 text-danger-600",
  VERIFIED: "border border-brand-border bg-primary-50 text-primary-800",
  REJECTED: "bg-red-50 text-danger-600"
};

export function StatusPill({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn("inline-flex min-h-7 w-fit items-center justify-center self-start justify-self-start whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11px] font-bold leading-none tracking-[0.02em] md:self-center", styles[value] ?? styles.DRAFT, className)}>
      {value.replace("_", " ").toLowerCase()}
    </span>
  );
}
