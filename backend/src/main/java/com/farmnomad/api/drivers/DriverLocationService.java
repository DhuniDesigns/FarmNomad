package com.farmnomad.api.drivers;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class DriverLocationService {
  private final DriverLocationRepository repository;
  private final long minUpdateIntervalSeconds;

  public DriverLocationService(
      DriverLocationRepository repository, @Value("${farmnomad.location.min-update-interval-seconds:5}") long minUpdateIntervalSeconds) {
    this.repository = repository;
    this.minUpdateIntervalSeconds = minUpdateIntervalSeconds;
  }

  public sealed interface UpsertOutcome permits Upserted, Throttled {}

  public record Upserted(DriverLocation location) implements UpsertOutcome {}

  /**
   * The client is expected to throttle to roughly one update per 10 seconds;
   * this is the server-side floor so a misbehaving or modified client can't
   * flood the database with writes faster than {@code
   * farmnomad.location.min-update-interval-seconds}.
   */
  public record Throttled() implements UpsertOutcome {}

  public UpsertOutcome upsert(UUID driverId, double lat, double lng, Double heading, Double accuracy) {
    Instant now = Instant.now();
    Optional<DriverLocation> existing = repository.findByDriverId(driverId);

    if (existing.isPresent() && existing.get().getUpdatedAt().isAfter(now.minusSeconds(minUpdateIntervalSeconds))) {
      return new Throttled();
    }

    DriverLocation location = existing
        .map(current -> {
          current.update(lat, lng, heading, accuracy, now);
          return current;
        })
        .orElseGet(() -> new DriverLocation(driverId, lat, lng, heading, accuracy, now));

    return new Upserted(repository.save(location));
  }

  public Optional<DriverLocation> findByDriverId(UUID driverId) {
    return repository.findByDriverId(driverId);
  }
}
