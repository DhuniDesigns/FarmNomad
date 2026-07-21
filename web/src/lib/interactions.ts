type HapticKind = "selection" | "success" | "warning" | "error";

const patterns: Record<HapticKind, number | number[]> = {
  selection: 10,
  success: [12, 35, 18],
  warning: [18, 45, 18],
  error: [16, 40, 16, 40, 16]
};

export function triggerHaptic(kind: HapticKind = "selection") {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("vibrate" in navigator)) return;

  navigator.vibrate(patterns[kind]);
}
