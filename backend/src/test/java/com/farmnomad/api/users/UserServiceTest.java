package com.farmnomad.api.users;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.farmnomad.api.geo.GeoPoint;
import com.farmnomad.api.geo.GeocodeSource;
import com.farmnomad.api.geo.GeocodingService;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

class UserServiceTest {
  private final UserRepository repository = mock(UserRepository.class);
  private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
  private final GeocodingService geocodingService = mock(GeocodingService.class);
  private final UserService service = new UserService(repository, passwordEncoder, geocodingService);

  @Test
  void registersANewUserWithAHashedPassword() {
    when(repository.existsByEmail("farmer@example.com")).thenReturn(false);
    when(repository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

    var outcome = service.register("farmer@example.com", "password123", "Test Farmer", UserRole.FARMER);

    assertThat(outcome).isInstanceOf(UserService.Registered.class);
    User saved = ((UserService.Registered) outcome).user();
    assertThat(saved.getEmail()).isEqualTo("farmer@example.com");
    assertThat(saved.getPasswordHash()).isNotEqualTo("password123");
    assertThat(passwordEncoder.matches("password123", saved.getPasswordHash())).isTrue();
    assertThat(saved.getRole()).isEqualTo(UserRole.FARMER);
    assertThat(saved.getVerificationStatus()).isEqualTo(VerificationStatus.PENDING);
  }

  @Test
  void refusesToSelfRegisterAsAdminOrMobileOnlyRoles() {
    for (UserRole role : new UserRole[] {UserRole.ADMIN, UserRole.CUSTOMER, UserRole.DRIVER}) {
      var outcome = service.register("someone@example.com", "password123", "Someone", role);
      assertThat(outcome).isInstanceOf(UserService.RoleNotWebRegistrable.class);
    }
  }

  @Test
  void refusesToRegisterADuplicateEmail() {
    when(repository.existsByEmail("farmer@example.com")).thenReturn(true);

    var outcome = service.register("farmer@example.com", "password123", "Test Farmer", UserRole.FARMER);

    assertThat(outcome).isInstanceOf(UserService.EmailAlreadyInUse.class);
  }

  @Test
  void authenticatesWithCorrectCredentials() {
    User user = sampleUser("password123");
    when(repository.findByEmail("farmer@example.com")).thenReturn(Optional.of(user));

    assertThat(service.authenticate("farmer@example.com", "password123")).contains(user);
  }

  @Test
  void rejectsAWrongPassword() {
    User user = sampleUser("password123");
    when(repository.findByEmail("farmer@example.com")).thenReturn(Optional.of(user));

    assertThat(service.authenticate("farmer@example.com", "wrong-password")).isEmpty();
  }

  @Test
  void rejectsAnUnknownEmailWithoutRevealingItDoesNotExist() {
    when(repository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

    assertThat(service.authenticate("unknown@example.com", "password123")).isEmpty();
  }

  @Test
  void updateAddressGeocodesViaPostcodeFirst() {
    User user = sampleUser("password123");
    when(repository.findById(user.getId())).thenReturn(Optional.of(user));
    when(repository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(geocodingService.geocodePostcode("M1 1AE")).thenReturn(Optional.of(new GeoPoint(53.48, -2.24, GeocodeSource.POSTCODES_IO)));

    var request = new UserAddressRequest("12 Field Barn", "Manchester", "M1 1AE", "UK", null, null);
    var outcome = service.updateAddress(user.getId(), request);

    assertThat(outcome).isInstanceOf(UserService.AddressUpdated.class);
    User updated = ((UserService.AddressUpdated) outcome).user();
    assertThat(updated.getAddressLat()).isEqualTo(53.48);
    assertThat(updated.getGeocodeSource()).isEqualTo(GeocodeSource.POSTCODES_IO);
    verify(geocodingService, never()).geocodeFreeText(any());
  }

  @Test
  void updateAddressSkipsReGeocodeWhenAddressUnchanged() {
    User user = sampleUser("password123");
    user.applyAddress("12 Field Barn", "Manchester", "M1 1AE", "UK", Instant.now());
    when(repository.findById(user.getId())).thenReturn(Optional.of(user));
    when(repository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

    var request = new UserAddressRequest("12 Field Barn", "Manchester", "M1 1AE", "UK", null, null);
    service.updateAddress(user.getId(), request);

    verify(geocodingService, never()).geocodePostcode(any());
    verify(geocodingService, never()).geocodeFreeText(any());
  }

  @Test
  void updateAddressSkipsReGeocodeWhenAlreadyManuallyPinned() {
    User user = sampleUser("password123");
    user.applyGeocode(1.0, 2.0, GeocodeSource.MANUAL, Instant.now());
    when(repository.findById(user.getId())).thenReturn(Optional.of(user));
    when(repository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

    var request = new UserAddressRequest("A new address entirely", "City", "SW1A 1AA", "UK", null, null);
    var outcome = service.updateAddress(user.getId(), request);

    verify(geocodingService, never()).geocodePostcode(any());
    User updated = ((UserService.AddressUpdated) outcome).user();
    assertThat(updated.getAddressLat()).isEqualTo(1.0);
    assertThat(updated.getGeocodeSource()).isEqualTo(GeocodeSource.MANUAL);
  }

  @Test
  void explicitManualCoordinatesAlwaysWinAndMarkManual() {
    User user = sampleUser("password123");
    when(repository.findById(user.getId())).thenReturn(Optional.of(user));
    when(repository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

    var request = new UserAddressRequest("12 Field Barn", "Manchester", "M1 1AE", "UK", 53.1, -2.1);
    var outcome = service.updateAddress(user.getId(), request);

    verify(geocodingService, never()).geocodePostcode(any());
    User updated = ((UserService.AddressUpdated) outcome).user();
    assertThat(updated.getAddressLat()).isEqualTo(53.1);
    assertThat(updated.getGeocodeSource()).isEqualTo(GeocodeSource.MANUAL);
  }

  @Test
  void updateAddressReturnsUserNotFoundForAnUnknownId() {
    UUID unknownId = UUID.randomUUID();
    when(repository.findById(unknownId)).thenReturn(Optional.empty());

    var outcome = service.updateAddress(unknownId, new UserAddressRequest(null, null, null, null, null, null));

    assertThat(outcome).isInstanceOf(UserService.UserNotFound.class);
  }

  private User sampleUser(String rawPassword) {
    return new User(UUID.randomUUID(), "farmer@example.com", passwordEncoder.encode(rawPassword), UserRole.FARMER, "Test Farmer", Instant.now());
  }
}
