package com.farmnomad.api.listings;

import com.farmnomad.api.geo.GeocodeSource;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Maps to the {@code listings} table created in
 * {@code db/migration/V3__init_listings.sql} and extended with pickup
 * coordinates in {@code V6__add_geolocation.sql}. {@code
 * spring.jpa.hibernate.ddl-auto} is {@code validate}, so any field added
 * here must already exist as a column in a Flyway migration.
 */
@Entity
@Table(name = "listings")
public class Listing {
  @Id
  private UUID id;

  @Column(name = "vendor_id", nullable = false)
  private UUID vendorId;

  @Column(nullable = false)
  private String title;

  private String description;

  @Column(nullable = false)
  private String category;

  @Column(name = "price_pence", nullable = false)
  private int pricePence;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal quantity;

  @Column(nullable = false)
  private String unit;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ListingStatus status;

  @Column(nullable = false)
  private String location;

  @Column(name = "is_surplus", nullable = false)
  private boolean surplus;

  @Column(name = "pickup_lat")
  private Double pickupLat;

  @Column(name = "pickup_lng")
  private Double pickupLng;

  /** How {@link #pickupLat}/{@link #pickupLng} were obtained. Null until the first geocode attempt (create always attempts one). */
  @Enumerated(EnumType.STRING)
  @Column(name = "geocode_source", length = 20)
  private GeocodeSource geocodeSource;

  @Column(name = "geocoded_at")
  private Instant geocodedAt;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  protected Listing() {
    // JPA
  }

  public Listing(
      UUID id,
      UUID vendorId,
      String title,
      String description,
      String category,
      int pricePence,
      BigDecimal quantity,
      String unit,
      ListingStatus status,
      String location,
      boolean surplus,
      Instant createdAt,
      Instant updatedAt) {
    this.id = id;
    this.vendorId = vendorId;
    this.title = title;
    this.description = description;
    this.category = category;
    this.pricePence = pricePence;
    this.quantity = quantity;
    this.unit = unit;
    this.status = status;
    this.location = location;
    this.surplus = surplus;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public UUID getId() {
    return id;
  }

  public UUID getVendorId() {
    return vendorId;
  }

  public String getTitle() {
    return title;
  }

  public String getDescription() {
    return description;
  }

  public String getCategory() {
    return category;
  }

  public int getPricePence() {
    return pricePence;
  }

  public BigDecimal getQuantity() {
    return quantity;
  }

  public String getUnit() {
    return unit;
  }

  public ListingStatus getStatus() {
    return status;
  }

  public String getLocation() {
    return location;
  }

  public boolean isSurplus() {
    return surplus;
  }

  public Double getPickupLat() {
    return pickupLat;
  }

  public Double getPickupLng() {
    return pickupLng;
  }

  public GeocodeSource getGeocodeSource() {
    return geocodeSource;
  }

  public Instant getGeocodedAt() {
    return geocodedAt;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  /**
   * Full replace of the editable fields (PUT /api/listings/{id}). Status is
   * deliberately excluded — archiving goes through {@link #archive}, which
   * has its own ownership-checked endpoint.
   */
  void applyEdits(
      String title,
      String description,
      String category,
      int pricePence,
      BigDecimal quantity,
      String unit,
      String location,
      boolean surplus,
      Instant now) {
    this.title = title;
    this.description = description;
    this.category = category;
    this.pricePence = pricePence;
    this.quantity = quantity;
    this.unit = unit;
    this.location = location;
    this.surplus = surplus;
    this.updatedAt = now;
  }

  void archive(Instant now) {
    this.status = ListingStatus.ARCHIVED;
    this.updatedAt = now;
  }

  void setSurplus(boolean surplus, Instant now) {
    this.surplus = surplus;
    this.updatedAt = now;
  }

  /**
   * Applies a geocode result (or a manual pin) to this listing. Callers
   * (ListingService) are responsible for the re-geocode guard — only calling
   * this when the location actually changed, or when the caller explicitly
   * supplied coordinates — this method itself just applies whatever it's given.
   */
  void applyGeocode(Double lat, Double lng, GeocodeSource source, Instant now) {
    this.pickupLat = lat;
    this.pickupLng = lng;
    this.geocodeSource = source;
    this.geocodedAt = now;
  }
}
