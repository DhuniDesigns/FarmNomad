"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusPill } from "@/components/ui/StatusPill";
import { useDemoStore } from "@/lib/demo/store";

export function AdminListings() {
  const { state, actions } = useDemoStore();
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);
  const pendingRemoval = state.listings.find((listing) => listing.id === pendingRemovalId);

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Moderation</p>
      <h1 className="font-editorial mt-2 text-5xl leading-none text-ink-900 md:text-6xl">Listing oversight</h1>
      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-[0_1px_18px_rgba(23,35,27,0.04)]">
        <div className="hidden grid-cols-[1fr_140px_140px_120px] border-b border-border bg-soft/60 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 md:grid">
          <span>Listing</span><span>Status</span><span>Type</span><span>Action</span>
        </div>
        <div className="divide-y divide-border">
          {state.listings.map((listing) => (
            <div className="grid gap-3 p-5 md:grid-cols-[1fr_140px_140px_120px] md:items-center" key={listing.id}>
              <div>
                <Link className="font-semibold text-ink-900 hover:text-primary-700" href={`/market/${listing.id}`}>{listing.title}</Link>
                <p className="text-sm text-ink-500">{listing.region} - {listing.category}</p>
              </div>
              <StatusPill value={listing.status} />
              <p className="text-sm font-semibold text-ink-700">{listing.surplus ? "Surplus" : "Sale"}</p>
              <Button type="button" variant="danger" onClick={() => setPendingRemovalId(listing.id)}>Remove</Button>
            </div>
          ))}
        </div>
      </section>
      <ConfirmDialog
        confirmLabel="Remove listing"
        description={pendingRemoval ? `${pendingRemoval.title} will be archived and removed from public browsing.` : "This listing will be archived and removed from public browsing."}
        destructive
        onCancel={() => setPendingRemovalId(null)}
        onConfirm={() => {
          if (pendingRemovalId) actions.suspendListing(pendingRemovalId);
          setPendingRemovalId(null);
        }}
        open={Boolean(pendingRemovalId)}
        title="Remove this listing?"
      />
    </main>
  );
}
