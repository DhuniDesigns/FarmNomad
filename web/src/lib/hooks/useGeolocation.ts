"use client";

import { useCallback, useState } from "react";
import type { LatLng } from "@/types/geo";

type GeolocationState = {
  position: LatLng | null;
  loading: boolean;
  error: string | null;
  supported: boolean;
};

/**
 * Thin wrapper around the browser's own Geolocation API — pure client-side,
 * no backend call. Never requests automatically; a caller must invoke
 * `request()` from a user gesture (a button click), so no page silently
 * prompts for location on load. Used to supply a reference point for
 * DistanceBadge on the market and to prefill LocationPicker.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    loading: false,
    error: null,
    supported: typeof navigator !== "undefined" && "geolocation" in navigator
  });

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setState((current) => ({ ...current, error: "Location isn't supported in this browser.", supported: false }));
      return;
    }

    setState((current) => ({ ...current, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (result) => {
        setState({
          position: { lat: result.coords.latitude, lng: result.coords.longitude },
          loading: false,
          error: null,
          supported: true
        });
      },
      (geoError) => {
        setState((current) => ({
          ...current,
          loading: false,
          error: geoError.code === geoError.PERMISSION_DENIED ? "Location access was denied." : "Couldn't get your location."
        }));
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 }
    );
  }, []);

  return { ...state, request };
}
