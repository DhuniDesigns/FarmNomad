"use client";

import dynamic from "next/dynamic";
import type { LatLng } from "@/types/geo";
import type { MapMarker } from "./MapCanvas";

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const MapCanvas = dynamic(() => import("./MapCanvas").then((mod) => mod.MapCanvas), {
  ssr: false,
  loading: () => <MapPlaceholder label="Loading map…" />
});

export type { MapMarker };

type MapViewProps = {
  center: LatLng;
  zoom?: number;
  height?: number | string;
  /** Enables drag/scroll/click-to-select. Set false for a static pin display, e.g. on the listing detail page. */
  interactive?: boolean;
  markers?: MapMarker[];
  onPositionSelect?: (position: LatLng) => void;
  className?: string;
};

/**
 * Token-aware wrapper around Mapbox GL (via react-map-gl). Loaded through
 * next/dynamic with ssr:false because mapbox-gl touches `window` on import
 * and has nothing meaningful to render on the server. Renders a graceful
 * placeholder instead of crashing when NEXT_PUBLIC_MAPBOX_TOKEN isn't
 * configured — pickup pins are still stored and read from the backend
 * regardless of whether Mapbox itself is set up; only the visual map is
 * unavailable without a token.
 *
 * Deliberately takes `markers` as data (not JSX `children`) so callers never
 * need to `import { Marker } from "react-map-gl"` themselves — that import
 * would sit outside this component's ssr:false boundary and reintroduce the
 * same server-side mapbox-gl crash this wrapper exists to avoid.
 */
export function MapView({ center, zoom = 12, height = 320, interactive = true, markers, onPositionSelect, className }: MapViewProps) {
  if (!mapboxToken) {
    return <MapPlaceholder label="Map preview needs a Mapbox token to display." height={height} className={className} />;
  }

  return (
    <MapCanvas
      center={center}
      zoom={zoom}
      height={height}
      interactive={interactive}
      token={mapboxToken}
      markers={markers}
      onPositionSelect={onPositionSelect}
      className={className}
    />
  );
}

function MapPlaceholder({ label, height = 320, className }: { label: string; height?: number | string; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl border border-dashed border-border bg-soft px-4 text-center text-sm font-semibold text-ink-500 ${className ?? ""}`}
      style={{ height }}
    >
      {label}
    </div>
  );
}
