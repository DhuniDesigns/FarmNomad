package com.farmnomad.api.listings;

import com.farmnomad.api.common.PageResponse;
import com.farmnomad.api.geo.GeoPoint;
import com.farmnomad.api.geo.GeocodeSource;
import com.farmnomad.api.geo.GeocodingService;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.Comparator;
import java.util.function.UnaryOperator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class ListingService {
  private static final int MAX_PAGE_SIZE = 100;
  private static final int DEFAULT_PAGE_SIZE = 20;

  private static final double EARTH_RADIUS_KM = 6371;

  private final ListingRepository repository;
  private final GeocodingService geocodingService;
  private final double maxRadiusKm;

  public ListingService(
      ListingRepository repository, GeocodingService geocodingService, @Value("${farmnomad.location.max-radius-km:100}") double maxRadiusKm) {
    this.repository = repository;
    this.geocodingService = geocodingService;
    this.maxRadiusKm = maxRadiusKm;
  }

  /** Result of a mutation scoped to "the caller's own listing". */
  public sealed interface OwnedListingOutcome permits OwnedListingFound, ListingNotFound, ListingForbidden {}

  public record OwnedListingFound(ListingSummary summary) implements OwnedListingOutcome {}

  public record ListingNotFound() implements OwnedListingOutcome {}

  /** The listing exists but doesn't belong to the caller — the controller should respond 403, not 404, so a vendor can tell "not mine" apart from "doesn't exist". */
  public record ListingForbidden() implements OwnedListingOutcome {}

  /** POST /api/listings. Caller-role restriction (FARMER/KITCHEN) is enforced by the controller/SecurityConfig, not here — there's no ownership to check yet on create. */
  public ListingSummary create(UUID vendorId, ListingRequest request) {
    Instant now = Instant.now();
    Listing listing = new Listing(
        UUID.randomUUID(),
        vendorId,
        request.title(),
        request.description(),
        request.category(),
        request.pricePence(),
        request.quantity(),
        request.unit(),
        ListingStatus.ACTIVE,
        request.location(),
        request.surplus(),
        now,
        now);
    // A brand-new listing has no previous location to compare against, so this always geocodes.
    applyGeocode(listing, request, null, now);
    return toSummary(repository.save(listing));
  }

  /** GET /api/listings/mine — every status, not just ACTIVE, so a vendor can see their own archived/sold-out listings too. */
  public List<ListingSummary> findOwned(UUID vendorId) {
    return repository.findByVendorIdOrderByCreatedAtDesc(vendorId).stream().map(ListingService::toSummary).toList();
  }

  /** PUT /api/listings/{id}. */
  public OwnedListingOutcome update(UUID vendorId, UUID listingId, ListingRequest request) {
    return withOwnedListing(vendorId, listingId, listing -> {
      Instant now = Instant.now();
      String previousLocation = listing.getLocation();
      listing.applyEdits(
          request.title(),
          request.description(),
          request.category(),
          request.pricePence(),
          request.quantity(),
          request.unit(),
          request.location(),
          request.surplus(),
          now);
      applyGeocode(listing, request, previousLocation, now);
      return listing;
    });
  }

  /**
   * Geocode-on-write. Three cases, in order:
   *
   * <ol>
   *   <li>The caller sent explicit {@code pickupLat}/{@code pickupLng} (a dragged pin) —
   *       accepted verbatim, marked {@code MANUAL}, and this always wins over anything below.
   *   <li>The listing is already {@code MANUAL} and the caller didn't override it — left alone.
   *       A later, unrelated address edit must not silently clobber a hand-placed pin.
   *   <li>Otherwise, only re-geocode if {@code location} actually changed (or this is a
   *       brand-new listing, signalled by {@code previousLocation == null}) — comparing
   *       against the stored value avoids a lookup on every unrelated field edit.
   * </ol>
   *
   * A geocoding failure sets {@link GeocodeSource#NONE} rather than leaving stale
   * coordinates in place; it never fails the listing write itself.
   */
  private void applyGeocode(Listing listing, ListingRequest request, String previousLocation, Instant now) {
    if (request.pickupLat() != null && request.pickupLng() != null) {
      listing.applyGeocode(request.pickupLat(), request.pickupLng(), GeocodeSource.MANUAL, now);
      return;
    }

    boolean locationChanged = previousLocation == null || !Objects.equals(previousLocation, request.location());
    boolean manuallyPinned = listing.getGeocodeSource() == GeocodeSource.MANUAL;
    if (!locationChanged || manuallyPinned) {
      return;
    }

    Optional<GeoPoint> result = geocodingService.geocodeFreeText(request.location());
    if (result.isPresent()) {
      listing.applyGeocode(result.get().lat(), result.get().lng(), result.get().source(), now);
    } else {
      listing.applyGeocode(null, null, GeocodeSource.NONE, now);
    }
  }

  /** POST /api/listings/{id}/archive. Behaviour with open orders is unresolved (docs/DECISIONS.md) — no-op today since there's no order data yet to conflict with. */
  public OwnedListingOutcome archive(UUID vendorId, UUID listingId) {
    return withOwnedListing(vendorId, listingId, listing -> {
      listing.archive(Instant.now());
      return listing;
    });
  }

  /** POST /api/listings/{id}/surplus. */
  public OwnedListingOutcome setSurplus(UUID vendorId, UUID listingId, boolean surplus) {
    return withOwnedListing(vendorId, listingId, listing -> {
      listing.setSurplus(surplus, Instant.now());
      return listing;
    });
  }

  private OwnedListingOutcome withOwnedListing(UUID vendorId, UUID listingId, UnaryOperator<Listing> mutate) {
    Optional<Listing> found = repository.findById(listingId);
    if (found.isEmpty()) {
      return new ListingNotFound();
    }
    Listing listing = found.get();
    if (!listing.getVendorId().equals(vendorId)) {
      return new ListingForbidden();
    }
    return new OwnedListingFound(toSummary(repository.save(mutate.apply(listing))));
  }

  /**
   * Public browse query behind GET /api/listings. Only ACTIVE listings are ever
   * returned (enforced in {@link ListingSpecifications}).
   *
   * @param supply one of "surplus", "sale", "organic", "all"/null. "organic" is
   *     currently a no-op — see docs/DECISIONS.md.
   * @param sort one of "newest", "price-asc", "quantity", "distance". "distance"
   *     falls back to "newest" — listings have pickup coordinates now, but this
   *     endpoint has no reference-point param to sort by yet (see docs/DECISIONS.md).
   */
  public PageResponse<ListingSummary> browse(
      String q,
      String category,
      String location,
      String supply,
      Integer minPricePence,
      Integer maxPricePence,
      String sort,
      int page,
      int size) {
    var pageable = PageRequest.of(Math.max(page, 0), clampSize(size), sortFor(sort));
    var spec = ListingSpecifications.browse(q, category, location, surplusFilter(supply), minPricePence, maxPricePence);

    Page<Listing> result = repository.findAll(spec, pageable);

    return new PageResponse<>(
        result.getContent().stream().map(ListingService::toSummary).toList(),
        result.getTotalElements(),
        result.getTotalPages(),
        result.getNumber(),
        result.getSize());
  }

  /**
   * Public single-listing lookup behind GET /api/listings/{id}. Returns empty
   * for an unknown id or for an ARCHIVED listing — archived listings are
   * intentionally hidden from the public detail view (API-SPEC.md §2).
   * SOLD_OUT listings are returned so the frontend can render an
   * "unavailable" state instead of a 404.
   */
  public Optional<ListingSummary> findPublic(UUID id) {
    return repository.findById(id)
        .filter(listing -> listing.getStatus() != ListingStatus.ARCHIVED)
        .map(ListingService::toSummary);
  }

  /**
   * GET /api/surplus/nearby. Bounding box narrows the row set at the database
   * level (via the {@code idx_listings_pickup_coords} index); the exact
   * Haversine distance is then computed in Java and used both to drop
   * corner-of-the-box rows that are actually outside {@code radiusKm} and to
   * sort. Fine at this scale — see {@link ListingSpecifications}.
   */
  public List<NearbyListing> findSurplusNearby(double lat, double lng, double radiusKm, int limit) {
    double clampedRadiusKm = Math.min(Math.max(radiusKm, 0), maxRadiusKm);
    double latDelta = clampedRadiusKm / 111.0;
    double lngDelta = clampedRadiusKm / (111.0 * Math.cos(Math.toRadians(lat)));

    var spec = ListingSpecifications.surplusNearbyBoundingBox(lat - latDelta, lat + latDelta, lng - lngDelta, lng + lngDelta);

    return repository.findAll(spec).stream()
        .map(listing -> new NearbyListing(toSummary(listing), haversineKm(lat, lng, listing.getPickupLat(), listing.getPickupLng())))
        .filter(nearby -> nearby.distanceKm() <= clampedRadiusKm)
        .sorted(Comparator.comparingDouble(NearbyListing::distanceKm))
        .limit(Math.max(limit, 0))
        .toList();
  }

  private static double haversineKm(double lat1, double lng1, double lat2, double lng2) {
    double dLat = Math.toRadians(lat2 - lat1);
    double dLng = Math.toRadians(lng2 - lng1);
    double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
        + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
  }

  private static int clampSize(int size) {
    if (size <= 0) return DEFAULT_PAGE_SIZE;
    return Math.min(size, MAX_PAGE_SIZE);
  }

  private static Boolean surplusFilter(String supply) {
    if (supply == null) return null;
    return switch (supply.trim().toLowerCase()) {
      case "surplus" -> Boolean.TRUE;
      case "sale" -> Boolean.FALSE;
      default -> null; // "all", "organic" (no schema support yet), unknown values
    };
  }

  private static Sort sortFor(String sort) {
    if (sort == null) return Sort.by(Sort.Direction.DESC, "createdAt");
    return switch (sort.trim().toLowerCase()) {
      case "price-asc" -> Sort.by(Sort.Direction.ASC, "pricePence");
      case "quantity" -> Sort.by(Sort.Direction.DESC, "quantity");
      // "distance" has no geo data to sort by yet; newest is the honest fallback.
      default -> Sort.by(Sort.Direction.DESC, "createdAt");
    };
  }

  private static ListingSummary toSummary(Listing listing) {
    return new ListingSummary(
        listing.getId(),
        listing.getTitle(),
        listing.getDescription(),
        listing.getCategory(),
        listing.getPricePence(),
        listing.getQuantity(),
        listing.getUnit(),
        listing.getLocation(),
        listing.getStatus(),
        listing.isSurplus(),
        listing.getPickupLat(),
        listing.getPickupLng(),
        listing.getCreatedAt());
  }
}
