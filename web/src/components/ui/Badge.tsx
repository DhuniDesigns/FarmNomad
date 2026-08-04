type BadgeProps = {
  children: React.ReactNode;
  tone?: "green" | "amber" | "blue";
};

const toneClassName = {
  green: "border border-brand-border bg-primary-50 text-primary-800",
  amber: "border border-[#e0b889] bg-[#f3e5d7] text-warning-600",
  blue: "border border-[#b8d4ef] bg-info-50 text-info-600"
};

export function Badge({ children, tone = "green" }: BadgeProps) {
  return (
    <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${toneClassName[tone]}`}>
      {children}
    </span>
  );
}
