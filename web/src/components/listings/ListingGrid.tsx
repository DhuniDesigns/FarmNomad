import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { Listing } from "@/types/listing";

type ListingGridProps = {
  listings: Listing[];
};

const fallbackImage = "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80";

export function ListingGrid({ listings }: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-white p-8 text-center">
        <h2 className="text-xl font-semibold text-ink-900">No matches yet</h2>
        <p className="mt-2 text-sm text-ink-700">Try a broader search or check back when new vendor stock lands.</p>
      </section>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <Link className="group overflow-hidden rounded-xl border border-border bg-white shadow-[0_1px_12px_rgba(23,35,27,0.04)] transition-[box-shadow,transform] duration-200 ease-[var(--ease-farm-out)] hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(23,35,27,0.10)]" href={`/market/${listing.id}`} key={listing.id}>
          <div className="relative aspect-[4/3] overflow-hidden bg-soft">
            <Image alt={`${listing.title} produce listing`} className="object-cover transition-transform duration-200 ease-[var(--ease-farm-out)] group-hover:scale-[1.03]" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" src={fallbackImage} />
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              <Badge>{listing.category}</Badge>
              {listing.surplus ? <Badge tone="amber">Surplus</Badge> : null}
            </div>
            <h2 className="mt-3 text-lg font-semibold text-ink-900">{listing.title}</h2>
            <p className="mt-2 text-sm text-ink-700">{listing.quantity} {listing.unit} - {listing.location}</p>
            <p className="mt-3 text-base font-semibold text-ink-900">GBP {(listing.pricePence / 100).toFixed(2)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
