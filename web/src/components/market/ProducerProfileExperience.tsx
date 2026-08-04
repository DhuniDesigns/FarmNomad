"use client";

import { useEffect, useState } from "react";
import { MapPin, ShieldCheck, Timer } from "lucide-react";
import { ListingCard } from "./ListingCard";
import { BackLink, safeInternalHref } from "@/components/ui/BackLink";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { ButtonLink } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { useDemoStore } from "@/lib/demo/store";

function returnHrefFromLocation() {
  if (typeof window === "undefined") return "/market";
  return safeInternalHref(new URLSearchParams(window.location.search).get("from"), "/market");
}

export function ProducerProfileExperience({ id }: { id: string }) {
  const { state, actions } = useDemoStore();
  const [returnHref, setReturnHref] = useState("/market");
  const vendor = state.vendors.find((candidate) => candidate.id === id);
  const listings = state.listings.filter((listing) => listing.vendorId === id && listing.status === "ACTIVE");
  const heroListing = listings[0] ?? state.listings.find((listing) => listing.vendorId === id);
  const producerHref = `/producers/${id}?from=${encodeURIComponent(returnHref)}`;
  const backLabel = returnHref.startsWith("/market/") ? "Back to listing" : returnHref.includes("?") ? "Back to results" : "Back to market";

  useEffect(() => {
    setReturnHref(returnHrefFromLocation());
  }, []);

  if (!vendor) {
    return (
      <main className="min-h-screen bg-canvas px-5 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-white p-8 text-center">
          <h1 className="font-editorial text-5xl text-ink-900">Producer not found</h1>
          <BackLink className="mt-5" href={returnHref} label="Back to market" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-canvas">
      <Toast message={state.toast} onClear={actions.clearToast} />
      <section className="mx-auto max-w-[1360px] px-5 py-8 lg:px-10">
        <BackLink href={returnHref} label={backLabel} />
        <div className="mt-6 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <EditorialImage
            alt={heroListing?.imageAlt ?? `${vendor.name} produce and growing environment`}
            className="min-h-[420px] rounded-2xl border border-border"
            colour={heroListing?.colour ?? "#4F7A59"}
            label={vendor.type === "FARMER" ? "Grower profile" : "Kitchen profile"}
            priority
            src={heroListing?.imageUrl}
          />
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">{vendor.type === "FARMER" ? "Farm producer" : "Kitchen vendor"}</p>
            <h1 className="font-editorial mt-3 text-6xl leading-[0.94] text-ink-900 md:text-8xl">{vendor.name}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-700">{vendor.bio}</p>
            <dl className="mt-8 grid gap-4 border-y border-border py-6 sm:grid-cols-3">
              <ProfileFact icon={<MapPin size={18} />} label="Region" value={`${vendor.region} - ${vendor.postcode}`} />
              <ProfileFact icon={<ShieldCheck size={18} />} label="Trust" value={`${vendor.rating}/5 verified`} />
              <ProfileFact icon={<Timer size={18} />} label="Response" value="Usually same day" />
            </dl>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/market">Browse all stock</ButtonLink>
              <ButtonLink variant="secondary" href="/login">Contact vendor</ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1360px] px-5 pb-14 lg:px-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Active supply</p>
            <h2 className="font-editorial mt-2 text-5xl leading-none text-ink-900">Current lots from this producer</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-ink-700">Categories include {Array.from(new Set(listings.map((listing) => listing.category))).join(", ") || "seasonal supply"}.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard
              favourite={state.favourites.includes(listing.id)}
              key={listing.id}
              listing={listing}
              onToggleFavourite={actions.toggleFavourite}
              returnHref={producerHref}
              state={state}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function ProfileFact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
        {icon}
        {label}
      </dt>
      <dd className="mt-2 text-base font-semibold text-ink-900">{value}</dd>
    </div>
  );
}
