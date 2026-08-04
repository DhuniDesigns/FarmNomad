package com.farmnomad.api.geo;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Frontend {@code LocationPicker} support. Proxying postcodes.io through the
 * backend keeps caching in one place and means the frontend never needs a key.
 */
@RestController
@RequestMapping("/api/geo")
public class GeoController {
  private final GeocodingService geocodingService;

  public GeoController(GeocodingService geocodingService) {
    this.geocodingService = geocodingService;
  }

  @GetMapping("/postcode/{postcode}")
  ResponseEntity<PostcodeLookupResponse> postcode(@PathVariable String postcode) {
    return geocodingService.geocodePostcode(postcode)
        .map(point -> ResponseEntity.ok(new PostcodeLookupResponse(point.lat(), point.lng(), postcode.trim().toUpperCase())))
        .orElseGet(() -> ResponseEntity.notFound().build());
  }

  @GetMapping("/reverse")
  ResponseEntity<ReverseGeoResult> reverse(@RequestParam double lat, @RequestParam double lng) {
    return geocodingService.reverseGeocode(lat, lng)
        .map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.notFound().build());
  }
}
