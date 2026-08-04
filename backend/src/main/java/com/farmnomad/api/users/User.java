package com.farmnomad.api.users;

import com.farmnomad.api.geo.GeocodeSource;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

/**
 * Maps to the {@code users} table created in
 * {@code db/migration/V1__init_users.sql}. {@code email} is a Postgres
 * {@code citext} column (case-insensitive unique); Hibernate maps it as a
 * plain String at the Java level, which is fine since the case-insensitivity
 * lives in Postgres itself, not in Java — but {@code ddl-auto: validate}
 * still checks the *database* column type against what it'd expect for a
 * bare String (varchar), and citext reports as a non-standard JDBC type
 * (Types#OTHER), so schema validation fails at boot without the explicit
 * {@code columnDefinition} below telling Hibernate what to actually expect.
 * Found the hard way: nothing had booted this app against a real,
 * migration-populated Postgres before (only Mockito-based unit tests, which
 * never touch a real schema) — see docs/DECISIONS.md.
 */
@Entity
@Table(name = "users")
public class User {
  @Id
  private UUID id;

  @Column(nullable = false, unique = true, columnDefinition = "citext")
  private String email;

  @Column(name = "password_hash", nullable = false)
  private String passwordHash;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private UserRole role;

  @Column(name = "display_name", nullable = false)
  private String displayName;

  private String phone;

  @Column(nullable = false)
  private String status = "ACTIVE";

  @Enumerated(EnumType.STRING)
  @Column(name = "verification_status", nullable = false)
  private VerificationStatus verificationStatus = VerificationStatus.PENDING;

  /**
   * Delivery destination for customers, home base for drivers, site address
   * for organisations. Added in {@code V6__add_geolocation.sql} — this
   * entity had no address fields at all before that migration, so there's
   * no "existing address, just add coordinates" step here; both land together.
   */
  private String address;

  private String city;

  private String postcode;

  private String country;

  @Column(name = "address_lat")
  private Double addressLat;

  @Column(name = "address_lng")
  private Double addressLng;

  @Enumerated(EnumType.STRING)
  @Column(name = "geocode_source", length = 20)
  private GeocodeSource geocodeSource;

  @Column(name = "geocoded_at")
  private Instant geocodedAt;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  protected User() {
    // JPA
  }

  public User(UUID id, String email, String passwordHash, UserRole role, String displayName, Instant createdAt) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.displayName = displayName;
    this.status = "ACTIVE";
    // Matches the column default in V1__init_users.sql. Nothing in this pass
    // reads or enforces verificationStatus yet (no admin verification queue,
    // no gating on it) — see docs/DECISIONS.md unresolved questions. Not
    // branching by role here since no doc confirms FARMER/KITCHEN should
    // auto-verify.
    this.verificationStatus = VerificationStatus.PENDING;
    this.createdAt = createdAt;
    this.updatedAt = createdAt;
  }

  public UUID getId() {
    return id;
  }

  public String getEmail() {
    return email;
  }

  public String getPasswordHash() {
    return passwordHash;
  }

  public UserRole getRole() {
    return role;
  }

  public String getDisplayName() {
    return displayName;
  }

  public String getPhone() {
    return phone;
  }

  public String getStatus() {
    return status;
  }

  public VerificationStatus getVerificationStatus() {
    return verificationStatus;
  }

  public String getAddress() {
    return address;
  }

  public String getCity() {
    return city;
  }

  public String getPostcode() {
    return postcode;
  }

  public String getCountry() {
    return country;
  }

  public Double getAddressLat() {
    return addressLat;
  }

  public Double getAddressLng() {
    return addressLng;
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

  /** Sets the raw address text fields. Called before {@link #applyGeocode} so the two always land together. */
  void applyAddress(String address, String city, String postcode, String country, Instant now) {
    this.address = address;
    this.city = city;
    this.postcode = postcode;
    this.country = country;
    this.updatedAt = now;
  }

  /** Same contract as {@code Listing#applyGeocode} — the caller (UserService) owns the re-geocode guard. */
  void applyGeocode(Double lat, Double lng, GeocodeSource source, Instant now) {
    this.addressLat = lat;
    this.addressLng = lng;
    this.geocodeSource = source;
    this.geocodedAt = now;
  }
}
