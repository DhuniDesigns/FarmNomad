package com.farmnomad.api.listings;

/** A listing plus its great-circle distance from the query point — GET /api/surplus/nearby. */
public record NearbyListing(ListingSummary listing, double distanceKm) {}
