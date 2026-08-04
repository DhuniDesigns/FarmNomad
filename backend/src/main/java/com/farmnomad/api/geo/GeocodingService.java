package com.farmnomad.api.geo;

import java.util.Optional;

/**
 * Geocode on write, never on read: an address is converted to coordinates
 * once, when it's saved, and the result is persisted by the caller. Calling
 * this on every page view would burn API quota and add latency to every
 * request — see docs/DECISIONS.md.
 *
 * <p>Every method is failure-tolerant: a geocoding miss returns {@code
 * Optional.empty()}, never an exception. A listing or user with no
 * coordinates is still valid; it just won't appear on a map yet.
 */
public interface GeocodingService {
  /** UK postcode → coordinates via postcodes.io. Returns empty for anything that doesn't look like a UK postcode, or on lookup failure. */
  Optional<GeoPoint> geocodePostcode(String postcode);

  /**
   * Best-effort geocoding of an arbitrary free-text location string (this
   * codebase stores {@code Listing.location} and {@code User} address
   * fields as plain text, not structured address components). Tries to spot
   * a UK postcode inside the text first (cheap, free, accurate); falls back
   * to Mapbox address geocoding constrained to Great Britain if that fails.
   */
  Optional<GeoPoint> geocodeFreeText(String text);

  /** Coordinates → nearest UK postcode/district, for GET /api/geo/reverse. */
  Optional<ReverseGeoResult> reverseGeocode(double lat, double lng);
}
