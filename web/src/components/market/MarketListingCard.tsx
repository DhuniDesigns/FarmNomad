"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Listing } from "@/types/listing";
import { formatCurrency } from "@/lib/utils";

type MarketListingCardProps = {
  listing: Listing;
  returnHref?: string;
};

/**
 * Presentational card for listings fetched from the real backend (GET
 * /api/listings). Deliberately simpler than the demo-data ListingCard: the
 * backend's ListingSummary doesn't carry images, an organic flag, distance, or
 * a collection window yet, so this card only renders fields that genuinely
 * exist today rather than inventing placeholder data.
 */
export function MarketListingCard({ listing, returnHref }: MarketListingCardProps) {
  const reduceMotion = useReducedMotion();
  const detailHref = returnHref ? `/market/${listing.id}?from=${encodeURIComponent(returnHref)}` : `/market/${listing.id}`;
  const initial = listing.title.trim().charAt(0).toUpperCase() || "F";

  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="group overflow-hidden rounded-xl border border-border bg-white shadow-[0_1px_12px_rgba(23,35,27,0.04)] will-change-transform"
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      layout
      transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1], layout: { duration: 0.22 } }}
      whileHover={reduceMotion ? undefined : { y: -3, boxShadow: "0 18px 42px rgba(23,35,27,0.10)" }}
    >
      <Link href={detailHref} aria-label={`View ${listing.title}`}>
        <div aria-hidden="true" className="flex aspect-[4/3] items-center justify-center bg-primary-50 text-6xl font-semibold text-primary-700">
          {initial}
        </div>
      </Link>
      <div className="grid gap-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{listing.category}</Badge>
          {listing.surplus ? <Badge tone="amber">Surplus</Badge> : null}
        </div>
        <div className="min-w-0">
          <Link href={detailHref} className="block text-[20px] font-semibold leading-snug text-ink-900 transition-colors duration-150 ease-[var(--ease-farm-out)] group-hover:text-primary-700">
            {listing.title}
          </Link>
          <p className="mt-1 flex min-w-0 items-center gap-1 text-sm font-medium text-ink-500">
            <MapPin aria-hidden="true" className="shrink-0" size={15} />
            <span className="truncate">{listing.location}</span>
          </p>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xl font-semibold text-ink-900">{listing.pricePence === 0 ? "Donation" : formatCurrency(listing.pricePence)}</p>
            <p className="text-sm font-semibold text-ink-500">{listing.quantity} {listing.unit} available</p>
          </div>
        </div>
        <div className="border-t border-border pt-3 text-sm leading-6 text-ink-700">
          <span className="font-semibold text-ink-900">{listing.vendorName}</span>
        </div>
      </div>
    </motion.article>
  );
}
