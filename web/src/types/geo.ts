export type LatLng = {
  lat: number;
  lng: number;
};

/** Mirrors the backend's GeocodeSource enum (com.farmnomad.api.geo.GeocodeSource). */
export type GeocodeSource = "POSTCODES_IO" | "MAPBOX" | "MANUAL" | "NONE";

/** Response shape of GET /api/geo/postcode/{postcode} (PostcodeLookupResponse.java on the backend). */
export type PostcodeLookupResult = {
  lat: number;
  lng: number;
  postcode: string;
};
