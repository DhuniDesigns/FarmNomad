export type ListingStatus = "ACTIVE" | "ARCHIVED" | "SOLD_OUT";

export type Listing = {
  id: string;
  title: string;
  description: string;
  category: string;
  pricePence: number;
  quantity: number;
  unit: string;
  location: string;
  vendorName: string;
  status: ListingStatus;
  surplus: boolean;
};

export type ListingPage = {
  content: Listing[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

/**
 * Shape of the real backend's `ListingSummary` DTO as returned by the
 * authenticated listing endpoints (create/update/archive/surplus/mine).
 * No `vendorName` — the backend doesn't join to the vendor's profile here;
 * "mine" is already scoped to the caller so the frontend doesn't need it.
 */
export type OwnedListing = {
  id: string;
  title: string;
  description: string;
  category: string;
  pricePence: number;
  quantity: number;
  unit: string;
  location: string;
  status: ListingStatus;
  surplus: boolean;
  createdAt: string;
};

/** Body for POST /api/listings and PUT /api/listings/{id} — mirrors the backend's ListingRequest record. */
export type ListingMutationInput = {
  title: string;
  description?: string;
  category: string;
  pricePence: number;
  quantity: number;
  unit: string;
  location: string;
  surplus: boolean;
};
