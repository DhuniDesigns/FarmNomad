package com.farmnomad.api.listings;

import java.math.BigDecimal;
import java.util.UUID;

public record ListingSummary(
    UUID id,
    String title,
    String category,
    int pricePence,
    BigDecimal quantity,
    String unit,
    String location,
    ListingStatus status,
    boolean surplus) {}
