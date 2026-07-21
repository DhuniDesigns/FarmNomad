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
    <span className={cn("inline-flex rounded-md px-2.5 py-1 text-xs font-semibold", styles[value] ?? styles.DRAFT, className)}>
      {value.replace("_", " ").toLowerCase()}
    </span>
  );
}
