"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusPill } from "@/components/ui/StatusPill";
import { useDemoStore } from "@/lib/demo/store";
import { triggerHaptic } from "@/lib/interactions";
import { formatCurrency, formatDate } from "@/lib/utils";

export function ListingsManager() {
  const { state, currentVendor, actions } = useDemoStore();
  const listings = state.listings.filter((listing) => listing.vendorId === currentVendor.id);
  const [pendingArchiveId, setPendingArchiveId] = useState<string | null>(null);
  const pendingArchive = listings.find((listing) => listing.id === pendingArchiveId);
  const reduceMotion = useReducedMotion();

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Listing management</p>
          <h1 className="font-editorial mt-2 text-5xl leading-none text-ink-900 md:text-6xl">My listings</h1>
        </div>
        <ButtonLink href="/listings/new" onClick={() => triggerHaptic("selection")}>
          <Plus size={18} /> New listing
        </ButtonLink>
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-[0_1px_18px_rgba(23,35,27,0.04)]">
        <div className="hidden grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr_180px] border-b border-border bg-soft/60 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 md:grid">
          <span>Listing</span><span>Status</span><span>Quantity</span><span>Price</span><span>Actions</span>
        </div>
        <div className="divide-y divide-border">
          {listings.map((listing, index) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-3 p-5 transition-colors duration-150 ease-[var(--ease-farm-out)] hover:bg-soft md:grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr_180px] md:items-center"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              key={listing.id}
              layout
              transition={{ duration: reduceMotion ? 0 : 0.18, delay: reduceMotion ? 0 : index * 0.025, ease: [0.16, 1, 0.3, 1], layout: { duration: 0.18 } }}
              whileHover={reduceMotion ? undefined : { x: 3 }}
            >
              <div>
                <Link className="font-semibold text-ink-900 hover:text-primary-700" href={`/market/${listing.id}`} onClick={() => triggerHaptic("selection")}>{listing.title}</Link>
                <p className="mt-1 text-sm text-ink-500">{listing.category} - created {formatDate(listing.createdAt)}</p>
              </div>
              <StatusPill value={listing.status} />
              <p className="text-sm font-bold text-ink-700">{listing.quantity} {listing.unit}</p>
              <p className="text-sm font-semibold text-ink-900">{listing.pricePence === 0 ? "Donation" : formatCurrency(listing.pricePence)}</p>
              <div className="flex flex-wrap gap-2">
                <Link className="inline-flex size-10 items-center justify-center rounded-lg border border-brand-border bg-white text-ink-900 transition-colors duration-150 ease-[var(--ease-farm-out)] hover:border-primary-700 hover:bg-primary-700 hover:text-white active:border-primary-800 active:bg-primary-800 active:text-white focus-visible:ring-3 focus-visible:ring-primary-600/30" href={`/listings/${listing.id}/edit`} aria-label={`Edit ${listing.title}`} onClick={() => triggerHaptic("selection")}>
                  <Edit3 size={17} />
                </Link>
                <Button className="min-h-10 px-3" type="button" variant="secondary" onClick={() => {
                  triggerHaptic("success");
                  actions.toggleSurplus(listing.id);
                }} aria-label={`Toggle surplus for ${listing.title}`}>
                  {listing.surplus ? "Sale" : "Surplus"}
                </Button>
                <Button className="size-10 px-0" type="button" variant="danger" onClick={() => {
                  triggerHaptic("warning");
                  setPendingArchiveId(listing.id);
                }} aria-label={`Archive ${listing.title}`}>
                  <Trash2 size={17} />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      <ConfirmDialog
        confirmLabel="Archive listing"
        description={pendingArchive ? `${pendingArchive.title} will be removed from the public market, but its existing orders stay visible.` : "This listing will be removed from the public market."}
        destructive
        onCancel={() => setPendingArchiveId(null)}
        onConfirm={() => {
          if (pendingArchiveId) actions.archiveListing(pendingArchiveId);
          setPendingArchiveId(null);
        }}
        open={Boolean(pendingArchiveId)}
        title="Archive this listing?"
      />
    </main>
  );
}
