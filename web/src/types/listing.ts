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
  /** Optional precise pickup pin (V6__add_geolocation.sql). Null until a listing has been geocoded or manually pinned. */
  pickupLat: number | null;
  pickupLng: number | null;
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
  pickupLat: number | null;
  pickupLng: number | null;
};

/**
 * Body for POST /api/listings and PUT /api/listings/{id} — mirrors the
 * backend's ListingRequest record. pickupLat/pickupLng are nullable, optional
 * manual-pin fields: sending both means "this is a MANUAL pin, always wins
 * over automatic region geocoding" (see ListingService#applyGeocode);
 * omitting/nulling them leaves geocode-on-write to the backend.
 */
export type ListingMutationInput = {
  title: string;
  description?: string;
  category: string;
  pricePence: number;
  quantity: number;
  unit: string;
  location: string;
  surplus: boolean;
  pickupLat?: number | null;
  pickupLng?: number | null;
};
