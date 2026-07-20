import { cn } from "@/lib/utils";

export function ProduceVisual({ colour, label, className }: { colour: string; label: string; className?: string }) {
  return (
    <div
      className={cn("relative min-h-48 overflow-hidden bg-[#f4f8f2]", className)}
      style={{
        background:
          `radial-gradient(circle at 16% 22%, ${colour} 0 11%, transparent 12%),` +
          `radial-gradient(circle at 72% 30%, ${colour} 0 8%, transparent 9%),` +
          `radial-gradient(circle at 46% 70%, ${colour} 0 13%, transparent 14%),` +
          "linear-gradient(135deg, #f8fbf6 0%, #e8f4ec 100%)"
      }}
      aria-label={label}
    >
      <div className="absolute left-4 top-4 rounded bg-white/85 px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink-900">
        {label}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-[repeating-linear-gradient(90deg,#8b5a2b_0_12px,#a96b32_12px_24px)] opacity-80" />
    </div>
  );
}
