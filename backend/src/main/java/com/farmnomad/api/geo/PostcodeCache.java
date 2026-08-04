package com.farmnomad.api.geo;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Postcode → coordinate mappings are effectively static, so a lookup is
 * cached for the lifetime of the process rather than re-fetched on every
 * write that happens to touch the same postcode. Deliberately in-memory
 * (a {@code ConcurrentHashMap}, not Caffeine or a DB table) — this is a
 * single-instance dev/dissertation deployment, and adding a caching
 * dependency or a {@code postcode_cache} table for one lookup method would
 * be more machinery than the problem needs. Revisit if the app is ever
 * deployed multi-instance.
 */
@Component
class PostcodeCache {
  private final Map<String, Entry> entries = new ConcurrentHashMap<>();
  private final Duration ttl;

  PostcodeCache(@Value("${farmnomad.geocoding.cache-ttl-days:90}") long ttlDays) {
    this.ttl = Duration.ofDays(ttlDays);
  }

  Optional<GeoPoint> get(String normalisedPostcode) {
    Entry entry = entries.get(normalisedPostcode);
    if (entry == null || entry.isExpired(ttl)) {
      return Optional.empty();
    }
    return Optional.of(entry.point());
  }

  void put(String normalisedPostcode, GeoPoint point) {
    entries.put(normalisedPostcode, new Entry(point, Instant.now()));
  }

  private record Entry(GeoPoint point, Instant cachedAt) {
    boolean isExpired(Duration ttl) {
      return Instant.now().isAfter(cachedAt.plus(ttl));
    }
  }
}
