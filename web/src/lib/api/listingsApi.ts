import { baseApi } from "./baseApi";
import type { ListingMutationInput, OwnedListing } from "@/types/listing";

const MINE_TAG = { type: "Listings" as const, id: "MINE" };

export const listingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // The vendor's own listings, any status — backs the listings management
    // view. Distinct from the public GET /api/listings (ACTIVE-only, no auth).
    myListings: builder.query<OwnedListing[], void>({
      query: () => "/api/listings/mine",
      providesTags: (result) =>
        result
          ? [...result.map((listing) => ({ type: "Listings" as const, id: listing.id })), MINE_TAG]
          : [MINE_TAG]
    }),
    createListing: builder.mutation<OwnedListing, ListingMutationInput>({
      query: (body) => ({ url: "/api/listings", method: "POST", body }),
      invalidatesTags: [MINE_TAG]
    }),
    updateListing: builder.mutation<OwnedListing, { id: string; body: ListingMutationInput }>({
      query: ({ id, body }) => ({ url: `/api/listings/${id}`, method: "PUT", body }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Listings", id }, MINE_TAG]
    }),
    archiveListing: builder.mutation<OwnedListing, string>({
      query: (id) => ({ url: `/api/listings/${id}/archive`, method: "POST" }),
      invalidatesTags: (_result, _error, id) => [{ type: "Listings", id }, MINE_TAG]
    }),
    setListingSurplus: builder.mutation<OwnedListing, { id: string; surplus: boolean }>({
      query: ({ id, surplus }) => ({ url: `/api/listings/${id}/surplus`, method: "POST", body: { surplus } }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Listings", id }, MINE_TAG]
    })
  })
});

export const {
  useMyListingsQuery,
  useCreateListingMutation,
  useUpdateListingMutation,
  useArchiveListingMutation,
  useSetListingSurplusMutation
} = listingsApi;
