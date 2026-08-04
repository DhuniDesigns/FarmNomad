import type { Listing, ListingPage } from "@/types/listing";

// Matches the documented dev host (127.0.0.1:5174) — see baseApi.ts and
// docs/DECISIONS.md for why this must match, not just "localhost".
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:9000";

const fallbackListings: Listing[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Seasonal vegetable box",
    description: "A mixed box of carrots, kale, potatoes, onions, and imperfect-but-good produce from a local Vendor.",
    category: "Produce",
    pricePence: 1800,
    quantity: 12,
    unit: "box",
    location: "Greater Manchester",
    vendorName: "Northfield Farm",
    status: "ACTIVE",
    surplus: false
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    title: "Surplus apples",
    description: "Short-window apples suitable for redistribution, juicing, or baking.",
    category: "Fruit",
    pricePence: 0,
    quantity: 45,
    unit: "kg",
    location: "Lancashire",
    vendorName: "Moss Lane Orchard",
    status: "ACTIVE",
    surplus: true
  }
];

export type PublicListingsQuery = {
  q?: string;
  category?: string;
  location?: string;
  supply?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  size?: number;
};

export type PublicListingsResult = {
  page: ListingPage;
  /** True if the backend couldn't be reached and results are the static fallback set. */
  backendError: boolean;
};

export async function getPublicListings(query: PublicListingsQuery = {}): Promise<PublicListingsResult> {
  const { q = "", category, location, supply, minPrice, maxPrice, sort, page = 0, size = 20 } = query;
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category && category !== "all") params.set("category", category);
  if (location && location !== "all") params.set("location", location);
  if (supply && supply !== "all") params.set("supply", supply);
  if (typeof minPrice === "number") params.set("minPrice", String(minPrice));
  if (typeof maxPrice === "number") params.set("maxPrice", String(maxPrice));
  if (sort) params.set("sort", sort);
  params.set("page", String(page));
  params.set("size", String(size));

  try {
    const response = await fetch(`${apiBaseUrl}/api/listings?${params.toString()}`, {
      next: { revalidate: 300, tags: ["listings"] }
    });

    if (!response.ok) {
      throw new Error("Listing fetch failed");
    }

    return { page: normalizeListingPage(await response.json()), backendError: false };
  } catch {
    const content = fallbackListings.filter((listing) =>
      `${listing.title} ${listing.category} ${listing.location}`.toLowerCase().includes(q.toLowerCase())
    );
    return {
      page: { content, totalElements: content.length, totalPages: 1, number: 0, size: 20 },
      backendError: true
    };
  }
}

export type PublicListingOutcome =
  | { status: "found"; listing: Listing }
  | { status: "not-found" }
  | { status: "backend-error" };

/**
 * Per docs/USER-FLOWS.md, a genuinely missing/archived listing and an
 * unreachable backend are two different states with two different UIs (404
 * page vs. a retry page with support contact) — unlike {@link getPublicListings},
 * this deliberately does not substitute unrelated fallback content for a
 * specific listing id, since that would silently show the visitor the wrong
 * listing's data.
 */
export async function getPublicListing(id: string): Promise<PublicListingOutcome> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/listings/${id}`, {
      next: { revalidate: 300, tags: [`listing:${id}`] }
    });

    // 400 is included alongside 404: an id that fails backend UUID parsing
    // (a malformed or stale link) reads to a visitor as "not found," not as
    // "the server is broken" — a 400 shouldn't route to the backend-error
    // retry page.
    if (response.status === 404 || response.status === 400) {
      return { status: "not-found" };
    }

    if (!response.ok) {
      return { status: "backend-error" };
    }

    return { status: "found", listing: normalizeListing(await response.json()) };
  } catch {
    return { status: "backend-error" };
  }
}

function normalizeListingPage(value: unknown): ListingPage {
  const page = value as Partial<ListingPage>;
  return {
    content: Array.isArray(page.content) ? page.content.map(normalizeListing) : [],
    totalElements: page.totalElements ?? 0,
    totalPages: page.totalPages ?? 0,
    number: page.number ?? 0,
    size: page.size ?? 20
  };
}

function normalizeListing(value: unknown): Listing {
  const listing = value as Partial<Listing>;
  return {
    id: String(listing.id),
    title: String(listing.title ?? "Untitled listing"),
    description: listing.description != null ? String(listing.description) : "No description provided yet.",
    category: String(listing.category ?? "Produce"),
    pricePence: Number(listing.pricePence ?? 0),
    quantity: Number(listing.quantity ?? 0),
    unit: String(listing.unit ?? "item"),
    location: String(listing.location ?? "United Kingdom"),
    vendorName: String(listing.vendorName ?? "FarmNomad Vendor"),
    status: listing.status === "ARCHIVED" || listing.status === "SOLD_OUT" ? listing.status : "ACTIVE",
    surplus: Boolean(listing.surplus)
  };
}
