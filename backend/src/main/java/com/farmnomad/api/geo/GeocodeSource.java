package com.farmnomad.api.geo;

/**
 * How a pair of coordinates was obtained. Audit trail + quality signal, and
 * the mechanism that lets a manually-dragged pin survive a later address
 * edit — see {@link GeocodingService} and the re-geocode guards in
 * {@code ListingService}/{@code UserService}.
 */
public enum GeocodeSource {
  /** UK postcode lookup via postcodes.io — free, unlimited, no API key. */
  POSTCODES_IO,
  /** Full street-address geocoding via Mapbox — used when there's no usable postcode. */
  MAPBOX,
  /** A user placed the pin themselves (e.g. dragged it on a map). Treated as authoritative. */
  MANUAL,
  /** Geocoding failed or was never attempted. Coordinates are null. */
  NONE
}
