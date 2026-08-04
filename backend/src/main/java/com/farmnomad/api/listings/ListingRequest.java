package com.farmnomad.api.listings;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

/**
 * Body for both POST /api/listings (create) and PUT /api/listings/{id}
 * (full replace of the editable fields). {@code status} is intentionally
 * not settable here — archiving has its own endpoint (POST
 * .../archive) so it can be ownership-checked and audited separately from a
 * general edit. Field constraints mirror the CHECK constraints on the
 * {@code listings} table in {@code V3__init_listings.sql} (price/quantity
 * >= 0) rather than inventing stricter rules than the schema enforces.
 *
 * <p>{@code pickupLat}/{@code pickupLng} are optional and only meant for the
 * case where the caller (the {@code LocationPicker} UI) dragged a pin: when
 * both are present, ListingService accepts them verbatim and marks the
 * listing's coordinates as {@code MANUAL}, which always outranks a geocoded
 * guess from the free-text {@code location} field. Leave both null for the
 * normal case — the location string is geocoded automatically.
 */
public record ListingRequest(
    @NotBlank String title,
    String description,
    @NotBlank String category,
    @Min(0) int pricePence,
    @NotNull @DecimalMin(value = "0", inclusive = true) BigDecimal quantity,
    @NotBlank String unit,
    @NotBlank String location,
    boolean surplus,
    Double pickupLat,
    Double pickupLng) {}
