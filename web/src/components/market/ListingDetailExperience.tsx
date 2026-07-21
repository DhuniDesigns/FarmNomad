"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Heart, MapPin, PackageCheck, ShieldCheck } from "lucide-react";
import { BackLink, safeInternalHref } from "@/components/ui/BackLink";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { StatusPill } from "@/components/ui/StatusPill";
import { TextAreaField, TextField } from "@/components/ui/Field";
import { Toast } from "@/components/ui/Toast";
import { ListingCard } from "@/components/market/ListingCard";
import { getListing, useDemoStore } from "@/lib/demo/store";
import { formatCurrency, formatDate } from "@/lib/utils";

function returnHrefFromLocation() {
  if (typeof window === "undefined") return "/market";
  return safeInternalHref(new URLSearchParams(window.location.search).get("from"), "/market");
}

export function ListingDetailExperience({ id }: { id: string }) {
  const { state, currentUser, actions } = useDemoStore();
  const listing = getListing(state, id);
  const vendor = listing ? state.vendors.find((candidate) => candidate.id === listing.vendorId) : undefined;
  const [returnHref, setReturnHref] = useState("/market");
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");
  const [name, setName] = useState(currentUser?.name ?? "");
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    setReturnHref(returnHrefFromLocation());
  }, []);

  if (!listing) {
    return (
      <main className="min-h-screen bg-canvas px-5 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-white p-8 text-center">
          <h1 className="font-editorial text-5xl leading-none text-ink-900">Listing not found</h1>
          <p className="mt-2 text-ink-700">The listing may have been archived or removed from the demo store.</p>
          <BackLink className="mt-5" href={returnHref} label="Back to market" />
        </div>
      </main>
    );
  }

  const favourite = state.favourites.includes(listing.id);
  const isOwnListing = vendor?.userId === currentUser?.id;
  const listingReturnHref = `/market/${listing.id}?from=${encodeURIComponent(returnHref)}`;
  const backLabel = returnHref.startsWith("/producers/") ? "Back to producer" : returnHref.includes("?") ? "Back to results" : "Back to market";
  const relatedListings = state.listings
    .filter((candidate) => candidate.id !== listing.id && candidate.status === "ACTIVE" && (candidate.vendorId === listing.vendorId || candidate.category === listing.category))
    .slice(0, 3);

  function submitRequest() {
    if (!listing) return;
    const parsedQuantity = Number(quantity);
    if (!name.trim() || !email.includes("@")) {
      setError("Enter your name and a valid email.");
      return;
    }
    if (!parsedQuantity || parsedQuantity < 1 || parsedQuantity > listing.quantity) {
      setError(`Choose a quantity between 1 and ${listing.quantity}.`);
      return;
    }
    setError("");
    actions.createEnquiry({
      listingId: listing.id,
      name,
      email,
      quantity: parsedQuantity,
      note: note || "No extra note supplied."
    });
  }

  return (
    <main className="min-h-screen bg-canvas">
      <Toast message={state.toast} onClear={actions.clearToast} />
      <div className="mx-auto max-w-[1360px] px-5 py-8 lg:px-10">
        <BackLink href={returnHref} label={backLabel} />
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_410px]">
          <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_1px_18px_rgba(23,35,27,0.05)]">
            <EditorialImage
              alt={listing.imageAlt}
              className="min-h-[360px] md:min-h-[520px]"
              colour={listing.colour}
              label={listing.imageLabel}
              priority
              src={listing.imageUrl}
            />
            <div className="grid gap-6 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill value={listing.status} />
                {listing.surplus ? <span className="rounded-md border border-[#e0b889] bg-[#f3e5d7] px-2.5 py-1 text-xs font-semibold text-warning-600">surplus claim</span> : null}
                {listing.organic ? <span className="rounded-md border border-[#b8d4ef] bg-info-50 px-2.5 py-1 text-xs font-semibold text-info-600">organic</span> : null}
              </div>
              <div>
                <h1 className="font-editorial max-w-3xl text-5xl leading-[0.95] text-ink-900 md:text-7xl">{listing.title}</h1>
                <p className="mt-3 max-w-3xl text-lg leading-8 text-ink-700">{listing.description}</p>
              </div>
              <dl className="grid gap-4 border-y border-border py-5 sm:grid-cols-3">
                <Metric label="Available" value={`${listing.quantity} ${listing.unit}`} />
                <Metric label="Best before" value={formatDate(listing.bestBefore)} />
                <Metric label="Collection" value={listing.collectionWindow} />
              </dl>
              <div className="grid gap-4 md:grid-cols-2">
                <InfoBlock icon={<PackageCheck size={18} />} title="Handling notes" text={listing.handling} />
                <InfoBlock icon={<CalendarDays size={18} />} title="Harvest date" text={formatDate(listing.harvestDate)} />
              </div>
            </div>
          </section>

          <aside className="sticky top-24 grid h-fit gap-5 rounded-2xl border border-border bg-white p-5 shadow-[0_1px_18px_rgba(23,35,27,0.05)]">
            <div>
              <p className="text-sm font-semibold text-ink-500">Unit price</p>
              <p className="mt-1 text-4xl font-semibold text-ink-900">{listing.pricePence === 0 ? "Donation" : formatCurrency(listing.pricePence)}</p>
            </div>
            <div className="rounded-xl bg-soft p-4">
              {vendor ? (
                <Link className="flex items-center gap-2 text-sm font-semibold text-ink-900 hover:text-primary-700" href={`/producers/${vendor.id}?from=${encodeURIComponent(listingReturnHref)}`}>
                  <ShieldCheck size={18} /> {vendor.name}
                </Link>
              ) : (
                <p className="flex items-center gap-2 text-sm font-semibold text-ink-900"><ShieldCheck size={18} /> FarmNomad vendor</p>
              )}
              <p className="mt-2 text-sm leading-6 text-ink-700">{vendor?.bio}</p>
              <p className="mt-3 flex items-center gap-1 text-sm font-semibold text-ink-700"><MapPin size={15} /> {listing.postcode}, {listing.region} - {listing.distanceMiles} miles</p>
            </div>

            {isOwnListing ? (
              <ButtonLink href={`/listings/${listing.id}/edit`}>
                Edit your listing
              </ButtonLink>
            ) : (
              <div className="grid gap-3">
                <TextField label="Your name" value={name} onChange={(event) => setName(event.target.value)} />
                <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                <TextField label={`Quantity (${listing.unit})`} type="number" min="1" max={listing.quantity} value={quantity} onChange={(event) => setQuantity(event.target.value)} />
                <TextAreaField label="Request note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Collection time, organisation need, or kitchen use…" />
                {error ? <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-danger-600" role="alert">{error}</p> : null}
                <Button type="button" onClick={submitRequest}>{listing.surplus ? "Send claim request" : "Send order request"}</Button>
              </div>
            )}
            <Button type="button" variant={favourite ? "primary" : "secondary"} onClick={() => actions.toggleFavourite(listing.id)}>
              <Heart aria-hidden="true" fill={favourite ? "currentColor" : "none"} size={18} /> {favourite ? "Saved" : "Save listing"}
            </Button>
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
                <ListingCard
                  favourite={state.favourites.includes(candidate.id)}
                  key={candidate.id}
                  listing={candidate}
                  returnHref={returnHref}
                  onToggleFavourite={actions.toggleFavourite}
                  state={state}
                />
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

function InfoBlock({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">{icon}{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink-700">{text}</p>
    </div>
  );
}
