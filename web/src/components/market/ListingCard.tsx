"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Heart, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { Button } from "@/components/ui/Button";
import type { DemoState, Listing } from "@/lib/demo/types";
import { formatCurrency } from "@/lib/utils";

type ListingCardProps = {
  listing: Listing;
  state: DemoState;
  favourite: boolean;
  onToggleFavourite: (id: string) => void;
};

export function ListingCard({ listing, state, favourite, onToggleFavourite }: ListingCardProps) {
  const vendor = state.vendors.find((candidate) => candidate.id === listing.vendorId);
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="group overflow-hidden rounded-xl border border-border bg-white shadow-[0_1px_12px_rgba(23,35,27,0.04)] will-change-transform"
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      layout
      transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1], layout: { duration: 0.22 } }}
      whileHover={reduceMotion ? undefined : { y: -3, boxShadow: "0 18px 42px rgba(23,35,27,0.10)" }}
      whileTap={reduceMotion ? undefined : { scale: 0.995 }}
    >
      <Link href={`/market/${listing.id}`} aria-label={`View ${listing.title}`}>
        <EditorialImage
          alt={listing.imageAlt}
          className="aspect-[4/3]"
          colour={listing.colour}
          label={listing.imageLabel}
          src={listing.imageUrl}
        />
      </Link>
      <div className="grid gap-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{listing.category}</Badge>
          {listing.surplus ? <Badge tone="amber">Surplus</Badge> : null}
          {listing.organic ? <Badge tone="blue">Organic</Badge> : null}
        </div>
        <div className="min-w-0">
          <Link href={`/market/${listing.id}`} className="block text-[20px] font-semibold leading-snug text-ink-900 transition-colors duration-150 ease-[var(--ease-farm-out)] group-hover:text-primary-700">
            {listing.title}
          </Link>
          <p className="mt-1 flex min-w-0 items-center gap-1 text-sm font-medium text-ink-500">
            <MapPin aria-hidden="true" className="shrink-0" size={15} />
            <span className="truncate">{listing.region} - {listing.distanceMiles} mi</span>
          </p>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xl font-semibold text-ink-900">{listing.pricePence === 0 ? "Donation" : formatCurrency(listing.pricePence)}</p>
            <p className="text-sm font-semibold text-ink-500">{listing.quantity} {listing.unit} available</p>
          </div>
          <Button
            aria-label={favourite ? "Remove saved listing" : "Save listing"}
            className="size-11 shrink-0 px-0"
            type="button"
            variant={favourite ? "primary" : "secondary"}
            onClick={(event) => {
              event.preventDefault();
              onToggleFavourite(listing.id);
            }}
          >
            <motion.span
              animate={favourite && !reduceMotion ? { scale: [1, 1.16, 1] } : { scale: 1 }}
              transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <Heart aria-hidden="true" fill={favourite ? "currentColor" : "none"} size={18} />
            </motion.span>
          </Button>
        </div>
        <div className="border-t border-border pt-3 text-sm leading-6 text-ink-700">
          <span className="font-semibold text-ink-900">{vendor?.name ?? "FarmNomad Vendor"}</span>
          <span> - {listing.collectionWindow}</span>
        </div>
      </div>
    </motion.article>
  );
}
