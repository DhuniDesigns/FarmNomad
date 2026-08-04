package com.farmnomad.api.listings;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Standalone from {@link ListingController} because the spec this implements
 * defines {@code /api/surplus/nearby} as its own path, distinct from the
 * general listings browse endpoint — ORGANISATION/ADMIN only (SecurityConfig),
 * whereas GET /api/listings is public.
 */
@RestController
@RequestMapping("/api/surplus")
public class SurplusController {
  private final ListingService service;

  public SurplusController(ListingService service) {
    this.service = service;
  }

  @GetMapping("/nearby")
  List<NearbyListing> nearby(
      @RequestParam double lat,
      @RequestParam double lng,
      @RequestParam(defaultValue = "25") double radiusKm,
      @RequestParam(defaultValue = "50") int limit) {
    return service.findSurplusNearby(lat, lng, radiusKm, limit);
  }
}
