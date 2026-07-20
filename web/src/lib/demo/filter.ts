import type { Listing } from "./types";

export type MarketFilters = {
  q: string;
  category: string;
  region: string;
  supply: string;
  sort: string;
};

export function filterListings(listings: Listing[], filters: MarketFilters) {
  const query = filters.q.trim().toLowerCase();

  const filtered = listings.filter((listing) => {
    if (listing.status !== "ACTIVE" && listing.status !== "SOLD_OUT") return false;
    if (query && !`${listing.title} ${listing.description} ${listing.region}`.toLowerCase().includes(query)) return false;
    if (filters.category !== "all" && listing.category !== filters.category) return false;
    if (filters.region !== "all" && listing.region !== filters.region) return false;
    if (filters.supply === "surplus" && !listing.surplus) return false;
    if (filters.supply === "sale" && listing.surplus) return false;
    if (filters.supply === "organic" && !listing.organic) return false;
    return true;
  });

  return filtered.sort((a, b) => {
    if (filters.sort === "price-asc") return a.pricePence - b.pricePence;
    if (filters.sort === "distance") return a.distanceMiles - b.distanceMiles;
    if (filters.sort === "quantity") return b.quantity - a.quantity;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
