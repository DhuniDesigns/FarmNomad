"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, ShieldCheck } from "lucide-react";
import { BackLink, safeInternalHref } from "@/components/ui/BackLink";
import { ButtonLink } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { MarketListingCard } from "@/components/market/MarketListingCard";
import { formatCurrency } from "@/lib/utils";
import type { Listing } from "@/types/listing";

function returnHrefFromLocation() {
  if (typeof window === "undefined") return "/market";
  return safeInternalHref(new URLSearchParams(window.location.search).get("from"), "/market");
}

type ListingDetailExperienceProps = {
  listing: Listing;
  relatedListings: Listing[];
};

/**
 * Renders a listing fetched from the real backend (GET /api/listings/{id}).
 * Deliberately lighter than the old demo version: the backend DTO has no
 * images, organic flag, distance, harvest date, collection window, handling
 * notes, or a linkable vendor id, so none of those are invented here. See
 * docs/DECISIONS.md for the follow-up on richer listing metadata.
 *
 * The order/enquire CTA always redirects to /login (Phase 2.3). There's no
 * real session concept anywhere in this stack yet — the demo store's
 * `currentUser` always falls back to a fake signed-in user, so it can't be
 * used to gate this; see docs/DECISIONS.md.
 */
export function ListingDetailExperience({ listing, relatedListings }: ListingDetailExperienceProps) {
  const [returnHref, setReturnHref] = useState("/market");

  useEffect(() => {
    setReturnHref(returnHrefFromLocation());
  }, []);

  const listingReturnHref = `/market/${listing.id}?from=${encodeURIComponent(returnHref)}`;
  const backLabel = returnHref.includes("?") ? "Back to results" : "Back to market";
  const initial = listing.title.trim().charAt(0).toUpperCase() || "F";
  const unavailable = listing.status === "SOLD_OUT";

  return (
    <main className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-[1360px] px-5 py-8 lg:px-10">
        <BackLink href={returnHref} label={backLabel} />
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_410px]">
          <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_1px_18px_rgba(23,35,27,0.05)]">
            <div aria-hidden="true" className="flex min-h-[360px] items-center justify-center bg-primary-50 text-[120px] font-semibold text-primary-700 md:min-h-[520px]">
              {initial}
            </div>
            <div className="grid gap-6 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill value={listing.status} />
                {listing.surplus ? <span className="rounded-md border border-[#e0b889] bg-[#f3e5d7] px-2.5 py-1 text-xs font-semibold text-warning-600">surplus claim</span> : null}
              </div>
              <div>
                <h1 className="font-editorial max-w-3xl text-5xl leading-[0.95] text-ink-900 md:text-7xl">{listing.title}</h1>
                <p className="mt-3 max-w-3xl text-lg leading-8 text-ink-700">{listing.description}</p>
              </div>
              {unavailable ? (
                <p className="rounded-lg bg-[#f3e5d7] p-4 text-sm font-semibold text-warning-600" role="status">
                  This listing is currently sold out. Check similar listings below or come back later.
                </p>
              ) : null}
              <dl className="grid gap-4 border-y border-border py-5 sm:grid-cols-2">
                <Metric label="Available" value={`${listing.quantity} ${listing.unit}`} />
                <Metric label="Location" value={listing.location} />
              </dl>
            </div>
          </section>

          <aside className="sticky top-24 grid h-fit gap-5 rounded-2xl border border-border bg-white p-5 shadow-[0_1px_18px_rgba(23,35,27,0.05)]">
            <div>
              <p className="text-sm font-semibold text-ink-500">Unit price</p>
              <p className="mt-1 text-4xl font-semibold text-ink-900">{listing.pricePence === 0 ? "Donation" : formatCurrency(listing.pricePence)}</p>
            </div>
            <div className="rounded-xl bg-soft p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                <ShieldCheck aria-hidden="true" size={18} /> {listing.vendorName}
              </p>
              <p className="mt-3 flex items-center gap-1 text-sm font-semibold text-ink-700">
                <MapPin aria-hidden="true" size={15} /> {listing.location}
              </p>
            </div>

            {unavailable ? (
              <p className="rounded-lg border border-dashed border-border p-4 text-sm text-ink-700">This listing is sold out and can&apos;t be ordered right now.</p>
            ) : (
              <ButtonLink href={`/login?returnTo=${encodeURIComponent(listingReturnHref)}`}>
                Sign in to {listing.surplus ? "claim this surplus" : "order"}
              </ButtonLink>
            )}
          </aside>
        </div>

        {relatedListings.length > 0 ? (
          <section className="mt-12">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Related supply</p>
                <h2 className="font-editorial mt-1 text-4xl leading-none text-ink-900">More from this board</h2>
              </div>
              <Link className="text-sm font-semibold text-primary-700" href="/market">View market</Link>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {relatedListings.map((candidate) => (
                <MarketListingCard key={candidate.id} listing={candidate} returnHref={returnHref} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-ink-900">{value}</dd>
    </div>
  );
}
