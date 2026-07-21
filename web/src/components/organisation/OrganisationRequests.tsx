"use client";

import { ShieldCheck } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { StatusPill } from "@/components/ui/StatusPill";
import { useDemoStore } from "@/lib/demo/store";

export function OrganisationRequests() {
  const { state, currentUser, actions } = useDemoStore();
  const surplusListings = state.listings.filter((listing) => listing.surplus && listing.status === "ACTIVE");

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 lg:px-8">
      <div className="rounded-2xl border border-border bg-white p-6 shadow-[0_1px_18px_rgba(23,35,27,0.04)]">
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary-700"><ShieldCheck size={18} /> Organisation access</p>
        <h1 className="font-editorial mt-2 text-5xl leading-none text-ink-900 md:text-6xl">Surplus requests</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-ink-700">Verified organisations can claim surplus stock. FarmNomad records each claim as a vendor order request.</p>
        <div className="mt-4"><StatusPill value={currentUser.organisationStatus ?? "PENDING"} /></div>
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {surplusListings.map((listing, index) => (
          <article className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_1px_18px_rgba(23,35,27,0.04)]" key={listing.id}>
            <EditorialImage alt={listing.imageAlt} className="aspect-[4/3]" colour={listing.colour} label={listing.imageLabel} priority={index < 2} src={listing.imageUrl} />
            <div className="grid gap-3 p-4">
              <h2 className="text-xl font-semibold text-ink-900">{listing.title}</h2>
              <p className="text-sm text-ink-700">{listing.quantity} {listing.unit} - {listing.region}</p>
              <div className="flex gap-2">
                <ButtonLink className="flex-1" variant="secondary" href={`/market/${listing.id}`}>View</ButtonLink>
                <Button type="button" onClick={() => actions.createEnquiry({
                  listingId: listing.id,
                  name: currentUser.name,
                  email: currentUser.email,
                  quantity: Math.min(5, listing.quantity),
                  note: "Organisation surplus claim from the requests page."
                })}>
                  Claim
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
