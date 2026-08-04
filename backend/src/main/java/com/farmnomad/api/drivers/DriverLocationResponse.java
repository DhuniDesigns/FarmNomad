package com.farmnomad.api.drivers;

import java.time.Instant;

public record DriverLocationResponse(Double lat, Double lng, Double heading, Double accuracy, Instant updatedAt) {
  static DriverLocationResponse from(DriverLocation location) {
    return new DriverLocationResponse(location.getLat(), location.getLng(), location.getHeading(), location.getAccuracy(), location.getUpdatedAt());
  }
}
