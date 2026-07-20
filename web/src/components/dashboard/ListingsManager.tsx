"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusPill } from "@/components/ui/StatusPill";
import { useDemoStore } from "@/lib/demo/store";
import { formatCurrency, formatDate } from "@/lib/utils";

export function ListingsManager() {
  const { state, currentVendor, actions } = useDemoStore();
  const listings = state.listings.filter((listing) => listing.vendorId === currentVendor.id);
  const [pendingArchiveId, setPendingArchiveId] = useState<string | null>(null);
  const pendingArchive = listings.find((listing) => listing.id === pendingArchiveId);

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Listing management</p>
          <h1 className="font-editorial mt-2 text-5xl leading-none text-ink-900 md:text-6xl">My listings</h1>
        </div>
        <Link className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white" href="/listings/new">
          <Plus size={18} /> New listing
        </Link>
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-[0_1px_18px_rgba(23,35,27,0.04)]">
        <div className="hidden grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr_180px] border-b border-border bg-soft/60 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 md:grid">
          <span>Listing</span><span>Status</span><span>Quantity</span><span>Price</span><span>Actions</span>
        </div>
        <div className="divide-y divide-border">
          {listings.map((listing) => (
            <div className="grid gap-3 p-5 transition-colors duration-150 ease-[var(--ease-farm-out)] hover:bg-soft md:grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr_180px] md:items-center" key={listing.id}>
              <div>
                <Link className="font-semibold text-ink-900 hover:text-primary-700" href={`/market/${listing.id}`}>{listing.title}</Link>
                <p className="mt-1 text-sm text-ink-500">{listing.category} - created {formatDate(listing.createdAt)}</p>
              </div>
              <StatusPill value={listing.status} />
              <p className="text-sm font-bold text-ink-700">{listing.quantity} {listing.unit}</p>
              <p className="text-sm font-semibold text-ink-900">{listing.pricePence === 0 ? "Donation" : formatCurrency(listing.pricePence)}</p>
              <div className="flex flex-wrap gap-2">
                <Link className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-white transition-colors duration-150 ease-[var(--ease-farm-out)] hover:border-sage hover:bg-soft" href={`/listings/${listing.id}/edit`} aria-label={`Edit ${listing.title}`}>
                  <Edit3 size={17} />
                </Link>
                <Button className="min-h-10 px-3" type="button" variant="secondary" onClick={() => actions.toggleSurplus(listing.id)} aria-label={`Toggle surplus for ${listing.title}`}>
                  {listing.surplus ? "Sale" : "Surplus"}
                </Button>
                <Button className="size-10 px-0" type="button" variant="danger" onClick={() => setPendingArchiveId(listing.id)} aria-label={`Archive ${listing.title}`}>
                  <Trash2 size={17} />
                </Button>
              </div>
            </div>
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
