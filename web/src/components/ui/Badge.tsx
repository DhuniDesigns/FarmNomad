type BadgeProps = {
  children: React.ReactNode;
  tone?: "green" | "amber" | "blue";
};

const toneClassName = {
  green: "bg-soft text-primary-700",
  amber: "bg-[#f3e5d7] text-warning-600",
  blue: "bg-[#e8efea] text-sky-600"
};

export function Badge({ children, tone = "green" }: BadgeProps) {
  return (
    <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${toneClassName[tone]}`}>
      {children}
    </span>
  );
}
