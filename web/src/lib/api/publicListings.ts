import type { Listing, ListingPage } from "@/types/listing";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:9000";

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

export async function getPublicListings({ q = "" }: { q?: string }): Promise<ListingPage> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/listings?q=${encodeURIComponent(q)}`, {
      next: { revalidate: 300, tags: ["listings"] }
    });

    if (!response.ok) {
      throw new Error("Listing fetch failed");
    }

    return normalizeListingPage(await response.json());
  } catch {
    const content = fallbackListings.filter((listing) =>
      `${listing.title} ${listing.category} ${listing.location}`.toLowerCase().includes(q.toLowerCase())
    );
    return { content, totalElements: content.length, totalPages: 1, number: 0, size: 20 };
  }
}

export async function getPublicListing(id: string): Promise<Listing | null> {
  const listingFromFallback = fallbackListings.find((listing) => listing.id === id);

  try {
    const response = await fetch(`${apiBaseUrl}/api/listings/${id}`, {
      next: { revalidate: 300, tags: [`listing:${id}`] }
    });

    if (!response.ok) {
      return listingFromFallback ?? null;
    }

    return normalizeListing(await response.json());
  } catch {
    return listingFromFallback ?? null;
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
    description: String(listing.description ?? "No description provided yet."),
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
