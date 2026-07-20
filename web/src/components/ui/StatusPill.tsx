import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  ACTIVE: "bg-soft text-primary-700",
  DRAFT: "bg-sand/40 text-ink-700",
  SOLD_OUT: "bg-ink-900 text-white",
  EXPIRED: "bg-[#f3e5d7] text-warning-600",
  ARCHIVED: "bg-sand/60 text-ink-700",
  PENDING: "bg-[#f3e5d7] text-warning-600",
  ACCEPTED: "bg-[#e8efea] text-sky-600",
  READY: "bg-soft text-primary-700",
  COMPLETED: "bg-ink-900 text-white",
  CANCELLED: "bg-red-50 text-danger-600",
  VERIFIED: "bg-soft text-primary-700",
  REJECTED: "bg-red-50 text-danger-600"
};

export function StatusPill({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn("inline-flex rounded-md px-2.5 py-1 text-xs font-semibold", styles[value] ?? styles.DRAFT, className)}>
      {value.replace("_", " ").toLowerCase()}
    </span>
  );
}
