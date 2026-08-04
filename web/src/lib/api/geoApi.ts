import { baseApi } from "./baseApi";
import type { PostcodeLookupResult } from "@/types/geo";

/**
 * Proxies the backend's geocoding endpoint (GeoController#lookupPostcode)
 * rather than calling postcodes.io/Mapbox directly from the browser — this
 * keeps the Mapbox token server-side only, per the "frontend never needs a
 * key" design already built into the backend geocoding pass (see
 * docs/DECISIONS.md). GET /api/geo/postcode/{postcode} isn't in
 * SecurityConfig's permitAll list, so it requires the same bearer token as
 * every other authenticated endpoint — fine here since LocationPicker only
 * ever renders behind the vendor dashboard's auth gate.
 */
export const geoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    lookupPostcode: builder.query<PostcodeLookupResult, string>({
      query: (postcode) => `/api/geo/postcode/${encodeURIComponent(postcode.trim())}`
    })
  })
});

export const { useLazyLookupPostcodeQuery } = geoApi;
