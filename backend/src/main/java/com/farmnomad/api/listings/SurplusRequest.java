package com.farmnomad.api.listings;

/** Body for POST /api/listings/{id}/surplus — sets (not toggles) the flag explicitly. */
public record SurplusRequest(boolean surplus) {}
