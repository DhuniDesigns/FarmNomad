import { Apple, Carrot, Croissant, Milk, Sprout, UtensilsCrossed, type LucideIcon } from "lucide-react";

/**
 * Category → icon/tint mapping used by the market pill filter and listing
 * card placeholders. This is the visual-polish pass borrowing from Faire
 * (category pills as primary browse nav) and Misfits Market (bold,
 * hand-picked color per section rather than one flat brand green
 * everywhere) — see docs/DESIGN-SYSTEM.md.
 *
 * Deliberately a closed lookup, not a hash-of-string-to-color function:
 * these six categories are the same fixed list already hardcoded in
 * MarketExperience.tsx and ListingForm.tsx, so an unmapped category (a typo
 * or future addition) falls back to the neutral "Produce" entry rather than
 * silently generating an arbitrary color.
 */
export type CategoryVisual = {
  Icon: LucideIcon;
  bg: string;
  fg: string;
  ring: string;
};

const categoryVisuals: Record<string, CategoryVisual> = {
  Vegetables: { Icon: Carrot, bg: "bg-primary-50", fg: "text-primary-700", ring: "ring-primary-100" },
  Fruit: { Icon: Apple, bg: "bg-[#fbebe2]", fg: "text-accent-500", ring: "ring-[#f3d5c2]" },
  Dairy: { Icon: Milk, bg: "bg-sky-50", fg: "text-sky-600", ring: "ring-[#cfe1f4]" },
  Bakery: { Icon: Croissant, bg: "bg-[#f6ead8]", fg: "text-crate-500", ring: "ring-[#ecd7b8]" },
  "Prepared food": { Icon: UtensilsCrossed, bg: "bg-[#eef0ea]", fg: "text-ink-700", ring: "ring-[#dde1d6]" },
  Herbs: { Icon: Sprout, bg: "bg-[#eaf1e6]", fg: "text-sage", ring: "ring-[#d7e3d1]" }
};

const fallback: CategoryVisual = { Icon: Carrot, bg: "bg-soft", fg: "text-ink-700", ring: "ring-border" };

export function getCategoryVisual(category: string): CategoryVisual {
  return categoryVisuals[category] ?? fallback;
}
