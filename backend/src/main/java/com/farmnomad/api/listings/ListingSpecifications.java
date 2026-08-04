package com.farmnomad.api.listings;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

/**
 * Predicate builders for the public listings browse endpoint (GET /api/listings).
 *
 * <p>Two filters accepted by the frontend have no backing column yet and are
 * intentionally no-ops here rather than invented schema changes — see
 * docs/DECISIONS.md "Unresolved questions":
 *
 * <ul>
 *   <li>{@code supply=organic} — no {@code is_organic} column on {@code listings}.
 *   <li>{@code sort=distance} — {@code listings} gained {@code pickup_lat}/{@code
 *       pickup_lng} in V6, but GET /api/listings has nowhere to accept a reference
 *       point to sort by. Still falls back to newest-first in {@link ListingService}
 *       until that param exists — that's a browse-endpoint change, out of scope for
 *       the geolocation pass that added the columns. See docs/DECISIONS.md.
 * </ul>
 */
final class ListingSpecifications {
  private ListingSpecifications() {}

  /**
   * Cheap bounding-box prefilter for GET /api/surplus/nearby — lets the
   * {@code idx_listings_pickup_coords} index eliminate most rows before the
   * exact Haversine distance is computed in {@link ListingService}. Plain
   * columns + Haversine are correct at this scale; PostGIS is the identified
   * scaling path if row counts grow (docs/DECISIONS.md).
   */
  static Specification<Listing> surplusNearbyBoundingBox(double latMin, double latMax, double lngMin, double lngMax) {
    return (root, query, cb) -> cb.and(
        cb.equal(root.get("status"), ListingStatus.ACTIVE),
        cb.isTrue(root.get("surplus")),
        cb.isNotNull(root.get("pickupLat")),
        cb.between(root.get("pickupLat"), latMin, latMax),
        cb.between(root.get("pickupLng"), lngMin, lngMax));
  }

  static Specification<Listing> browse(
      String q, String category, String location, Boolean surplus, Integer minPricePence, Integer maxPricePence) {
    return (root, query, cb) -> {
      List<Predicate> predicates = new ArrayList<>();
      predicates.add(cb.equal(root.get("status"), ListingStatus.ACTIVE));

      if (q != null && !q.isBlank()) {
        String pattern = "%" + q.trim().toLowerCase() + "%";
        predicates.add(
            cb.or(
                cb.like(cb.lower(root.get("title")), pattern),
                cb.like(cb.lower(root.get("description")), pattern)));
      }

      if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) {
        predicates.add(cb.equal(cb.lower(root.get("category")), category.trim().toLowerCase()));
      }

      if (location != null && !location.isBlank() && !"all".equalsIgnoreCase(location)) {
        predicates.add(cb.equal(cb.lower(root.get("location")), location.trim().toLowerCase()));
      }

      if (surplus != null) {
        predicates.add(cb.equal(root.get("surplus"), surplus));
      }

      if (minPricePence != null) {
        predicates.add(cb.greaterThanOrEqualTo(root.get("pricePence"), minPricePence));
      }

      if (maxPricePence != null) {
        predicates.add(cb.lessThanOrEqualTo(root.get("pricePence"), maxPricePence));
      }

      return cb.and(predicates.toArray(new Predicate[0]));
    };
  }
}
