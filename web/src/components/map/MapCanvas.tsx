"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import Map, { Marker, NavigationControl } from "react-map-gl";
import { MapPin } from "lucide-react";
import type { LatLng } from "@/types/geo";

export type MapMarker = {
  id?: string;
  position: LatLng;
  draggable?: boolean;
  onDragEnd?: (position: LatLng) => void;
};

type MapCanvasProps = {
  center: LatLng;
  zoom: number;
  height: number | string;
  interactive: boolean;
  token: string;
  markers?: MapMarker[];
  onPositionSelect?: (position: LatLng) => void;
  className?: string;
};

/**
 * The actual react-map-gl/mapbox-gl usage — only ever loaded client-side via
 * MapView's next/dynamic(..., { ssr: false }) wrapper, since mapbox-gl reads
 * `window` at import time and would throw during server rendering. Markers
 * are rendered here (not accepted as raw JSX children from callers) so that
 * no other file in the app needs to `import ... from "react-map-gl"` and
 * accidentally reintroduce that same SSR crash outside this dynamic boundary.
 */
export function MapCanvas({ center, zoom, height, interactive, token, markers = [], onPositionSelect, className }: MapCanvasProps) {
  return (
    <div className={`overflow-hidden rounded-xl border border-border ${className ?? ""}`} style={{ height }}>
      <Map
        mapboxAccessToken={token}
        initialViewState={{ longitude: center.lng, latitude: center.lat, zoom }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        dragPan={interactive}
        scrollZoom={interactive}
        doubleClickZoom={interactive}
        touchZoomRotate={interactive}
        onClick={interactive && onPositionSelect ? (event) => onPositionSelect({ lat: event.lngLat.lat, lng: event.lngLat.lng }) : undefined}
      >
        {interactive ? <NavigationControl position="top-right" /> : null}
        {markers.map((marker, index) => (
          <Marker
            key={marker.id ?? index}
            draggable={marker.draggable}
            latitude={marker.position.lat}
            longitude={marker.position.lng}
            onDragEnd={marker.onDragEnd ? (event) => marker.onDragEnd?.({ lat: event.lngLat.lat, lng: event.lngLat.lng }) : undefined}
          >
            <MapPin aria-hidden="true" className="text-primary-700" fill="currentColor" size={30} />
          </Marker>
        ))}
      </Map>
    </div>
  );
}
