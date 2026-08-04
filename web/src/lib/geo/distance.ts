import type { LatLng } from "@/types/geo";

const EARTH_RADIUS_KM = 6371;

/**
 * Client-side port of `ListingService#haversineKm` on the backend. Used for
 * "~X km away" badges on cards in a list view — computing this in the
 * browser against coordinates the API already returned costs nothing extra,
 * unlike a per-card directions/distance API call. See
 * FARMNOMAD-FRONTEND-BUILD-SPEC.md §11 "the cost rule": client-side Haversine
 * for list views, a real routing call only ever justified for a single
 * detail view (not built in this pass — no Directions integration exists).
 */
export function haversineKm(from: LatLng, to: LatLng): number {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** "850 m" under 1km, "4.2 km" under 10km, "23 km" beyond that. */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}
