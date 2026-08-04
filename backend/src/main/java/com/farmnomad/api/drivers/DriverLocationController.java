package com.farmnomad.api.drivers;

import com.farmnomad.api.auth.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST path for a driver's own current position. Role restriction (DRIVER
 * only) is enforced in SecurityConfig, matching the convention used for
 * POST /api/listings.
 */
@RestController
@RequestMapping("/api/drivers/me/location")
public class DriverLocationController {
  private final DriverLocationService service;

  public DriverLocationController(DriverLocationService service) {
    this.service = service;
  }

  @PutMapping
  ResponseEntity<DriverLocationResponse> update(@AuthenticationPrincipal AuthenticatedUser caller, @Valid @RequestBody DriverLocationRequest request) {
    return switch (service.upsert(caller.id(), request.lat(), request.lng(), request.heading(), request.accuracy())) {
      case DriverLocationService.Upserted upserted -> ResponseEntity.ok(DriverLocationResponse.from(upserted.location()));
      case DriverLocationService.Throttled ignored -> ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
    };
  }

  @GetMapping
  ResponseEntity<DriverLocationResponse> read(@AuthenticationPrincipal AuthenticatedUser caller) {
    return service.findByDriverId(caller.id())
        .map(location -> ResponseEntity.ok(DriverLocationResponse.from(location)))
        .orElseGet(() -> ResponseEntity.notFound().build());
  }
}
