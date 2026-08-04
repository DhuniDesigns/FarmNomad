"use client";

import { useState } from "react";
import { LocateFixed, Search } from "lucide-react";
import { MapView } from "./MapView";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { useLazyLookupPostcodeQuery } from "@/lib/api/geoApi";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { extractApiErrorMessage } from "@/lib/api/errorMessage";
import type { LatLng } from "@/types/geo";

const UK_CENTER: LatLng = { lat: 54.5, lng: -3.1 };

type LocationPickerProps = {
  value: LatLng | null;
  onChange: (value: LatLng | null) => void;
};

/**
 * Optional precision pickup pin. Sits alongside the existing region dropdown
 * in ListingForm rather than replacing it — the region still drives the
 * public market's location filter; this only supplies pickupLat/pickupLng
 * for map display and distance badges. Any pin set here (dragged, clicked,
 * postcode search, or "use my location") is sent to the backend as explicit
 * coordinates, which ListingService#applyGeocode always treats as a MANUAL
 * pin that wins over automatic region geocoding.
 */
export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [postcodeInput, setPostcodeInput] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [lookupPostcode, { isFetching }] = useLazyLookupPostcodeQuery();
  const geolocation = useGeolocation();

  const center = value ?? geolocation.position ?? UK_CENTER;
  const markerPosition = value ?? center;

  async function searchPostcode() {
    if (!postcodeInput.trim()) return;
    setLookupError("");
    try {
      const result = await lookupPostcode(postcodeInput).unwrap();
      onChange({ lat: result.lat, lng: result.lng });
    } catch (searchError) {
      setLookupError(extractApiErrorMessage(searchError, "Couldn't find that postcode."));
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-end gap-2">
        <TextField
          className="min-w-[160px] flex-1"
          label="Find by postcode"
          placeholder="e.g. M1 1AE"
          value={postcodeInput}
          onChange={(event) => setPostcodeInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void searchPostcode();
            }
          }}
        />
        <Button type="button" variant="secondary" loading={isFetching} onClick={() => void searchPostcode()}>
          <Search aria-hidden="true" size={16} /> Find
        </Button>
        <Button type="button" variant="secondary" loading={geolocation.loading} onClick={geolocation.request}>
          <LocateFixed aria-hidden="true" size={16} /> Use my location
        </Button>
      </div>
      {lookupError ? <p className="text-sm font-medium text-danger-600">{lookupError}</p> : null}
      {geolocation.error ? <p className="text-sm font-medium text-danger-600">{geolocation.error}</p> : null}

      <MapView
        center={center}
        zoom={value ? 14 : 6}
        height={260}
        onPositionSelect={onChange}
        markers={[{ position: markerPosition, draggable: true, onDragEnd: onChange }]}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-ink-700">
        <p>
          {value
            ? `Pickup pin set at ${value.lat.toFixed(4)}, ${value.lng.toFixed(4)}.`
            : "No precise pickup pin yet — click the map, drag the pin, search a postcode, or use your location."}
        </p>
        {value ? (
          <button type="button" className="font-semibold text-primary-700 underline-offset-2 hover:underline" onClick={() => onChange(null)}>
            Clear pin
          </button>
        ) : null}
      </div>
    </div>
  );
}
