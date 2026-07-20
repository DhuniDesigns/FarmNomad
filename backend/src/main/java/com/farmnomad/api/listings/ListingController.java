package com.farmnomad.api.listings;

import com.farmnomad.api.common.PageResponse;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/listings")
public class ListingController {
  @GetMapping
  PageResponse<ListingSummary> browse() {
    ListingSummary sample = new ListingSummary(
        UUID.fromString("11111111-1111-4111-8111-111111111111"),
        "Seasonal vegetable box",
        "Produce",
        1800,
        new BigDecimal("12"),
        "box",
        "Greater Manchester",
        ListingStatus.ACTIVE,
        false);
    return new PageResponse<>(List.of(sample), 1, 1, 0, 20);
  }

  @GetMapping("/{id}")
  ListingSummary detail(@PathVariable UUID id) {
    return new ListingSummary(
        id,
        "Seasonal vegetable box",
        "Produce",
        1800,
        new BigDecimal("12"),
        "box",
        "Greater Manchester",
        ListingStatus.ACTIVE,
        false);
  }
}
