package com.farmnomad.api.users;

import com.farmnomad.api.geo.GeoPoint;
import com.farmnomad.api.geo.GeocodeSource;
import com.farmnomad.api.geo.GeocodingService;
import java.time.Instant;
import java.util.EnumSet;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
  /**
   * Per docs/DECISIONS.md: "Admin accounts are provisioned, not
   * self-registered; Customer/Driver registration happens on mobile." The
   * frontend's role selector already only offers these three, but that's
   * trivially bypassed by calling the API directly — this is the real
   * enforcement point.
   */
  private static final Set<UserRole> WEB_REGISTRABLE_ROLES = EnumSet.of(UserRole.FARMER, UserRole.KITCHEN, UserRole.ORGANISATION);

  private final UserRepository repository;
  private final PasswordEncoder passwordEncoder;
  private final GeocodingService geocodingService;

  public UserService(UserRepository repository, PasswordEncoder passwordEncoder, GeocodingService geocodingService) {
    this.repository = repository;
    this.passwordEncoder = passwordEncoder;
    this.geocodingService = geocodingService;
  }

  public sealed interface RegisterOutcome permits Registered, EmailAlreadyInUse, RoleNotWebRegistrable {}

  public record Registered(User user) implements RegisterOutcome {}

  public record EmailAlreadyInUse() implements RegisterOutcome {}

  public record RoleNotWebRegistrable() implements RegisterOutcome {}

  public RegisterOutcome register(String email, String rawPassword, String displayName, UserRole role) {
    if (!WEB_REGISTRABLE_ROLES.contains(role)) {
      return new RoleNotWebRegistrable();
    }

    String normalisedEmail = email.trim();
    if (repository.existsByEmail(normalisedEmail)) {
      return new EmailAlreadyInUse();
    }

    User user = new User(
        UUID.randomUUID(),
        normalisedEmail,
        passwordEncoder.encode(rawPassword),
        role,
        displayName.trim(),
        Instant.now());

    return new Registered(repository.save(user));
  }

  /** Empty on any failure (unknown email or wrong password) — callers must not distinguish the two (no user enumeration). */
  public Optional<User> authenticate(String email, String rawPassword) {
    return repository.findByEmail(email.trim())
        .filter(user -> passwordEncoder.matches(rawPassword, user.getPasswordHash()));
  }

  public Optional<User> findById(UUID id) {
    return repository.findById(id);
  }

  public sealed interface UpdateAddressOutcome permits AddressUpdated, UserNotFound {}

  public record AddressUpdated(User user) implements UpdateAddressOutcome {}

  public record UserNotFound() implements UpdateAddressOutcome {}

  /**
   * PUT /api/users/me/address. Same geocode-on-write contract as {@code
   * ListingService.applyGeocode}: an explicit manual pin always wins, an
   * existing manual pin survives an unrelated edit, and re-geocoding only
   * happens when the address text actually changed.
   */
  public UpdateAddressOutcome updateAddress(UUID userId, UserAddressRequest request) {
    Optional<User> found = repository.findById(userId);
    if (found.isEmpty()) {
      return new UserNotFound();
    }

    User user = found.get();
    Instant now = Instant.now();
    String previousAddress = user.getAddress();
    String previousPostcode = user.getPostcode();

    user.applyAddress(request.address(), request.city(), request.postcode(), request.country(), now);
    applyGeocode(user, request, previousAddress, previousPostcode, now);

    return new AddressUpdated(repository.save(user));
  }

  private void applyGeocode(User user, UserAddressRequest request, String previousAddress, String previousPostcode, Instant now) {
    if (request.addressLat() != null && request.addressLng() != null) {
      user.applyGeocode(request.addressLat(), request.addressLng(), GeocodeSource.MANUAL, now);
      return;
    }

    boolean addressChanged = !Objects.equals(previousAddress, request.address()) || !Objects.equals(previousPostcode, request.postcode());
    boolean manuallyPinned = user.getGeocodeSource() == GeocodeSource.MANUAL;
    if (!addressChanged || manuallyPinned) {
      return;
    }

    boolean hasPostcode = request.postcode() != null && !request.postcode().isBlank();
    Optional<GeoPoint> result = hasPostcode
        ? geocodingService.geocodePostcode(request.postcode()).or(() -> geocodingService.geocodeFreeText(joinAddress(request)))
        : geocodingService.geocodeFreeText(joinAddress(request));

    if (result.isPresent()) {
      user.applyGeocode(result.get().lat(), result.get().lng(), result.get().source(), now);
    } else {
      user.applyGeocode(null, null, GeocodeSource.NONE, now);
    }
  }

  private static String joinAddress(UserAddressRequest request) {
    return Stream.of(request.address(), request.city(), request.postcode(), request.country())
        .filter(part -> part != null && !part.isBlank())
        .collect(Collectors.joining(", "));
  }
}
