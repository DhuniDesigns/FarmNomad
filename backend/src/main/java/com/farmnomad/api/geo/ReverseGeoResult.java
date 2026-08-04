package com.farmnomad.api.geo;

/** Result of turning coordinates back into a rough UK location — backs GET /api/geo/reverse. */
public record ReverseGeoResult(String postcode, String district, String region) {}
