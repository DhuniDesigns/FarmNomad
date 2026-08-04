package com.farmnomad.api.drivers;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

/**
 * Live driver position — one row per driver, upserted, kept in its own
 * table (rather than columns on {@code users}) so a high-frequency write
 * path never contends with user profile reads. {@code driverId} is a plain
 * UUID foreign key rather than a JPA relation, matching how {@code
 * Listing.vendorId} references {@code users} elsewhere in this codebase.
 *
 * <p>Deliberately no history — this row is overwritten on every update, not
 * appended to. Under UK GDPR, location data tied to an identified person is
 * personal data; indefinite retention without a stated purpose isn't
 * defensible. If a breadcrumb trail is ever needed, add a separate,
 * async-written history table rather than accumulating rows here.
 */
@Entity
@Table(name = "driver_locations")
public class DriverLocation {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "driver_id", nullable = false, unique = true)
  private UUID driverId;

  @Column(nullable = false)
  private double lat;

  @Column(nullable = false)
  private double lng;

  /** Degrees from north, 0-360. Optional — used to rotate the map marker. */
  private Double heading;

  /** Metres. From the browser Geolocation API. */
  private Double accuracy;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  protected DriverLocation() {
    // JPA
  }

  public DriverLocation(UUID driverId, double lat, double lng, Double heading, Double accuracy, Instant updatedAt) {
    this.driverId = driverId;
    this.lat = lat;
    this.lng = lng;
    this.heading = heading;
    this.accuracy = accuracy;
    this.updatedAt = updatedAt;
  }

  public Long getId() {
    return id;
  }

  public UUID getDriverId() {
    return driverId;
  }

  public double getLat() {
    return lat;
  }

  public double getLng() {
    return lng;
  }

  public Double getHeading() {
    return heading;
  }

  public Double getAccuracy() {
    return accuracy;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  void update(double lat, double lng, Double heading, Double accuracy, Instant updatedAt) {
    this.lat = lat;
    this.lng = lng;
    this.heading = heading;
    this.accuracy = accuracy;
    this.updatedAt = updatedAt;
  }
}
