import { MapPin } from "lucide-react";
import { formatDistance, haversineKm } from "@/lib/geo/distance";
import type { LatLng } from "@/types/geo";

type DistanceBadgeProps = {
  from: LatLng;
  to: LatLng;
  className?: string;
};

/**
 * "~X km away" pill — approximate straight-line (haversine) distance,
 * computed entirely client-side against the visitor's own browser-geolocation
 * position. No per-card API call; see distance.ts "the cost rule".
 */
export function DistanceBadge({ from, to, className }: DistanceBadgeProps) {
  const km = haversineKm(from, to);
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border border-border bg-soft px-2 py-1 text-xs font-semibold text-ink-700 ${className ?? ""}`}>
      <MapPin aria-hidden="true" size={12} /> ~{formatDistance(km)} away
    </span>
  );
}
