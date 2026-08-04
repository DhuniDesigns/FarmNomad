package com.farmnomad.api.listings;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.farmnomad.api.geo.GeoPoint;
import com.farmnomad.api.geo.GeocodeSource;
import com.farmnomad.api.geo.GeocodingService;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

class ListingServiceTest {
  private final ListingRepository repository = mock(ListingRepository.class);
  private final GeocodingService geocodingService = mock(GeocodingService.class);
  private final ListingService service = new ListingService(repository, geocodingService, 100.0);

  @Test
  void mapsListingsToSummariesAndPageMetadata() {
    Listing listing = sampleListing();
    Pageable requested = PageRequest.of(0, 20);
    when(repository.findAll(any(Specification.class), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of(listing), requested, 1));

    var result = service.browse(null, null, null, null, null, null, null, 0, 20);

    assertThat(result.content()).hasSize(1);
    assertThat(result.totalElements()).isEqualTo(1);
    ListingSummary summary = result.content().get(0);
    assertThat(summary.id()).isEqualTo(listing.getId());
    assertThat(summary.title()).isEqualTo(listing.getTitle());
    assertThat(summary.category()).isEqualTo(listing.getCategory());
    assertThat(summary.pricePence()).isEqualTo(listing.getPricePence());
    assertThat(summary.quantity()).isEqualByComparingTo(listing.getQuantity());
    assertThat(summary.unit()).isEqualTo(listing.getUnit());
    assertThat(summary.location()).isEqualTo(listing.getLocation());
    assertThat(summary.status()).isEqualTo(listing.getStatus());
    assertThat(summary.surplus()).isEqualTo(listing.isSurplus());
  }

  @Test
  void defaultsToNewestFirstWhenSortIsUnspecified() {
    stubEmptyPage();

    service.browse(null, null, null, null, null, null, null, 0, 20);

    Sort sort = capturedPageable().getSort();
    assertThat(sort).isEqualTo(Sort.by(Sort.Direction.DESC, "createdAt"));
  }

  @Test
  void sortsByPriceAscendingWhenRequested() {
    stubEmptyPage();

    service.browse(null, null, null, null, null, null, "price-asc", 0, 20);

    Sort sort = capturedPageable().getSort();
    assertThat(sort).isEqualTo(Sort.by(Sort.Direction.ASC, "pricePence"));
  }

  @Test
  void fallsBackToNewestWhenSortIsDistanceSinceThereIsNoGeoData() {
    stubEmptyPage();

    service.browse(null, null, null, null, null, null, "distance", 0, 20);

    Sort sort = capturedPageable().getSort();
    assertThat(sort).isEqualTo(Sort.by(Sort.Direction.DESC, "createdAt"));
  }

  @Test
  void clampsOversizedPageRequests() {
    stubEmptyPage();

    service.browse(null, null, null, null, null, null, null, 0, 500);

    assertThat(capturedPageable().getPageSize()).isEqualTo(100);
  }

  @Test
  void fallsBackToDefaultPageSizeWhenNonPositive() {
    stubEmptyPage();

    service.browse(null, null, null, null, null, null, null, 0, 0);

    assertThat(capturedPageable().getPageSize()).isEqualTo(20);
  }

  @Test
  void findPublicReturnsActiveListing() {
    Listing listing = sampleListing();
    when(repository.findById(eq(listing.getId()))).thenReturn(Optional.of(listing));

    Optional<ListingSummary> result = service.findPublic(listing.getId());

    assertThat(result).isPresent();
    assertThat(result.get().id()).isEqualTo(listing.getId());
  }

  @Test
  void findPublicReturnsSoldOutListingSoFrontendCanShowUnavailableState() {
    Listing listing = sampleListing(ListingStatus.SOLD_OUT);
    when(repository.findById(eq(listing.getId()))).thenReturn(Optional.of(listing));

    Optional<ListingSummary> result = service.findPublic(listing.getId());

    assertThat(result).isPresent();
    assertThat(result.get().status()).isEqualTo(ListingStatus.SOLD_OUT);
  }

  @Test
  void findPublicHidesArchivedListings() {
    Listing listing = sampleListing(ListingStatus.ARCHIVED);
    when(repository.findById(eq(listing.getId()))).thenReturn(Optional.of(listing));

    Optional<ListingSummary> result = service.findPublic(listing.getId());

    assertThat(result).isEmpty();
  }

  @Test
  void findPublicReturnsEmptyForUnknownId() {
    UUID unknownId = UUID.randomUUID();
    when(repository.findById(eq(unknownId))).thenReturn(Optional.empty());

    assertThat(service.findPublic(unknownId)).isEmpty();
  }

  @Test
  void createsAListingOwnedByTheCaller() {
    UUID vendorId = UUID.randomUUID();
    when(repository.save(any(Listing.class))).thenAnswer(invocation -> invocation.getArgument(0));

    ListingSummary summary = service.create(vendorId, sampleRequest());

    assertThat(summary.title()).isEqualTo("Seasonal veg box");
    assertThat(summary.status()).isEqualTo(ListingStatus.ACTIVE);
    var captor = org.mockito.ArgumentCaptor.forClass(Listing.class);
    org.mockito.Mockito.verify(repository).save(captor.capture());
    assertThat(captor.getValue().getVendorId()).isEqualTo(vendorId);
  }

  @Test
  void findOwnedReturnsAllOfTheVendorsListingsRegardlessOfStatus() {
    UUID vendorId = UUID.randomUUID();
    Listing archived = sampleListing(ListingStatus.ARCHIVED);
    when(repository.findByVendorIdOrderByCreatedAtDesc(vendorId)).thenReturn(List.of(archived));

    List<ListingSummary> owned = service.findOwned(vendorId);

    assertThat(owned).hasSize(1);
    assertThat(owned.get(0).status()).isEqualTo(ListingStatus.ARCHIVED);
  }

  @Test
  void updateAppliesEditsWhenCallerOwnsTheListing() {
    UUID vendorId = UUID.randomUUID();
    Listing listing = sampleListing(vendorId, ListingStatus.ACTIVE);
    when(repository.findById(listing.getId())).thenReturn(Optional.of(listing));
    when(repository.save(any(Listing.class))).thenAnswer(invocation -> invocation.getArgument(0));

    var outcome = service.update(vendorId, listing.getId(), sampleRequest());

    assertThat(outcome).isInstanceOf(ListingService.OwnedListingFound.class);
    var found = (ListingService.OwnedListingFound) outcome;
    assertThat(found.summary().title()).isEqualTo("Seasonal veg box");
  }

  @Test
  void updateIsForbiddenWhenCallerDoesNotOwnTheListing() {
    Listing listing = sampleListing(UUID.randomUUID(), ListingStatus.ACTIVE);
    when(repository.findById(listing.getId())).thenReturn(Optional.of(listing));

    var outcome = service.update(UUID.randomUUID(), listing.getId(), sampleRequest());

    assertThat(outcome).isInstanceOf(ListingService.ListingForbidden.class);
  }

  @Test
  void updateIsNotFoundForAnUnknownListing() {
    UUID unknownId = UUID.randomUUID();
    when(repository.findById(unknownId)).thenReturn(Optional.empty());

    var outcome = service.update(UUID.randomUUID(), unknownId, sampleRequest());

    assertThat(outcome).isInstanceOf(ListingService.ListingNotFound.class);
  }

  @Test
  void archiveSetsStatusToArchivedForTheOwner() {
    UUID vendorId = UUID.randomUUID();
    Listing listing = sampleListing(vendorId, ListingStatus.ACTIVE);
    when(repository.findById(listing.getId())).thenReturn(Optional.of(listing));
    when(repository.save(any(Listing.class))).thenAnswer(invocation -> invocation.getArgument(0));

    var outcome = service.archive(vendorId, listing.getId());

    assertThat(outcome).isInstanceOf(ListingService.OwnedListingFound.class);
    assertThat(((ListingService.OwnedListingFound) outcome).summary().status()).isEqualTo(ListingStatus.ARCHIVED);
  }

  @Test
  void archiveIsForbiddenForANonOwner() {
    Listing listing = sampleListing(UUID.randomUUID(), ListingStatus.ACTIVE);
    when(repository.findById(listing.getId())).thenReturn(Optional.of(listing));

    var outcome = service.archive(UUID.randomUUID(), listing.getId());

    assertThat(outcome).isInstanceOf(ListingService.ListingForbidden.class);
  }

  @Test
  void setSurplusUpdatesTheFlagForTheOwner() {
    UUID vendorId = UUID.randomUUID();
    Listing listing = sampleListing(vendorId, ListingStatus.ACTIVE);
    when(repository.findById(listing.getId())).thenReturn(Optional.of(listing));
    when(repository.save(any(Listing.class))).thenAnswer(invocation -> invocation.getArgument(0));

    var outcome = service.setSurplus(vendorId, listing.getId(), true);

    assertThat(outcome).isInstanceOf(ListingService.OwnedListingFound.class);
    assertThat(((ListingService.OwnedListingFound) outcome).summary().surplus()).isTrue();
  }

  @Test
  void createGeocodesTheLocationOnCreate() {
    UUID vendorId = UUID.randomUUID();
    when(repository.save(any(Listing.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(geocodingService.geocodeFreeText("Greater Manchester"))
        .thenReturn(Optional.of(new GeoPoint(53.48, -2.24, GeocodeSource.POSTCODES_IO)));

    ListingSummary summary = service.create(vendorId, sampleRequest());

    assertThat(summary.pickupLat()).isEqualTo(53.48);
    assertThat(summary.pickupLng()).isEqualTo(-2.24);
  }

  @Test
  void createSetsGeocodeSourceNoneWhenGeocodingFailsRatherThanFailingTheWrite() {
    UUID vendorId = UUID.randomUUID();
    when(repository.save(any(Listing.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(geocodingService.geocodeFreeText(any())).thenReturn(Optional.empty());

    ListingSummary summary = service.create(vendorId, sampleRequest());

    assertThat(summary.pickupLat()).isNull();
    var captor = ArgumentCaptor.forClass(Listing.class);
    verify(repository).save(captor.capture());
    assertThat(captor.getValue().getGeocodeSource()).isEqualTo(GeocodeSource.NONE);
  }

  @Test
  void updateReGeocodesWhenLocationChanges() {
    UUID vendorId = UUID.randomUUID();
    Listing listing = sampleListing(vendorId, ListingStatus.ACTIVE); // location = "Greater Manchester"
    when(repository.findById(listing.getId())).thenReturn(Optional.of(listing));
    when(repository.save(any(Listing.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(geocodingService.geocodeFreeText("Bristol")).thenReturn(Optional.of(new GeoPoint(51.45, -2.58, GeocodeSource.POSTCODES_IO)));

    var request = new ListingRequest(
        "Seasonal veg box", "Mixed veg, picked weekly.", "Vegetables", 1800, new BigDecimal("12.00"), "box", "Bristol", false, null, null);
    var outcome = service.update(vendorId, listing.getId(), request);

    verify(geocodingService).geocodeFreeText("Bristol");
    var found = (ListingService.OwnedListingFound) outcome;
    assertThat(found.summary().pickupLat()).isEqualTo(51.45);
  }

  @Test
  void updateSkipsReGeocodeWhenLocationIsUnchanged() {
    UUID vendorId = UUID.randomUUID();
    Listing listing = sampleListing(vendorId, ListingStatus.ACTIVE); // location = "Greater Manchester"
    when(repository.findById(listing.getId())).thenReturn(Optional.of(listing));
    when(repository.save(any(Listing.class))).thenAnswer(invocation -> invocation.getArgument(0));

    service.update(vendorId, listing.getId(), sampleRequest()); // same "Greater Manchester" location

    verify(geocodingService, never()).geocodeFreeText(any());
  }

  @Test
  void updateSkipsReGeocodeWhenAlreadyManuallyPinnedEvenIfLocationChanges() {
    UUID vendorId = UUID.randomUUID();
    Listing listing = sampleListing(vendorId, ListingStatus.ACTIVE);
    listing.applyGeocode(1.0, 2.0, GeocodeSource.MANUAL, Instant.now());
    when(repository.findById(listing.getId())).thenReturn(Optional.of(listing));
    when(repository.save(any(Listing.class))).thenAnswer(invocation -> invocation.getArgument(0));

    var request = new ListingRequest(
        "Seasonal veg box", "Mixed veg, picked weekly.", "Vegetables", 1800, new BigDecimal("12.00"), "box", "Somewhere else entirely", false, null, null);
    var outcome = service.update(vendorId, listing.getId(), request);

    verify(geocodingService, never()).geocodeFreeText(any());
    var found = (ListingService.OwnedListingFound) outcome;
    assertThat(found.summary().pickupLat()).isEqualTo(1.0);
  }

  @Test
  void explicitManualCoordinatesAlwaysWinAndMarkTheSourceManual() {
    UUID vendorId = UUID.randomUUID();
    when(repository.save(any(Listing.class))).thenAnswer(invocation -> invocation.getArgument(0));

    var request = new ListingRequest(
        "Seasonal veg box", "Mixed veg, picked weekly.", "Vegetables", 1800, new BigDecimal("12.00"), "box", "Greater Manchester", false, 53.1, -2.1);
    ListingSummary summary = service.create(vendorId, request);

    verify(geocodingService, never()).geocodeFreeText(any());
    assertThat(summary.pickupLat()).isEqualTo(53.1);
    var captor = ArgumentCaptor.forClass(Listing.class);
    verify(repository).save(captor.capture());
    assertThat(captor.getValue().getGeocodeSource()).isEqualTo(GeocodeSource.MANUAL);
  }

  @Test
  void findSurplusNearbyExcludesListingsOutsideTheRadiusAndOrdersByDistance() {
    Listing near = sampleListing(UUID.randomUUID(), ListingStatus.ACTIVE);
    near.applyGeocode(53.48, -2.24, GeocodeSource.POSTCODES_IO, Instant.now()); // ~Manchester
    Listing far = sampleListing(UUID.randomUUID(), ListingStatus.ACTIVE);
    far.applyGeocode(51.45, -2.58, GeocodeSource.POSTCODES_IO, Instant.now()); // ~Bristol, ~250km away
    when(repository.findAll(any(Specification.class))).thenReturn(List.of(far, near));

    List<NearbyListing> results = service.findSurplusNearby(53.48, -2.24, 50, 10);

    assertThat(results).hasSize(1);
    assertThat(results.get(0).listing().id()).isEqualTo(near.getId());
    assertThat(results.get(0).distanceKm()).isLessThan(1.0);
  }

  @Test
  void findSurplusNearbyRespectsTheLimit() {
    Listing first = sampleListing(UUID.randomUUID(), ListingStatus.ACTIVE);
    first.applyGeocode(53.48, -2.24, GeocodeSource.POSTCODES_IO, Instant.now());
    Listing second = sampleListing(UUID.randomUUID(), ListingStatus.ACTIVE);
    second.applyGeocode(53.49, -2.23, GeocodeSource.POSTCODES_IO, Instant.now());
    when(repository.findAll(any(Specification.class))).thenReturn(List.of(first, second));

    List<NearbyListing> results = service.findSurplusNearby(53.48, -2.24, 50, 1);

    assertThat(results).hasSize(1);
  }

  private static ListingRequest sampleRequest() {
    return new ListingRequest(
        "Seasonal veg box", "Mixed veg, picked weekly.", "Vegetables", 1800, new BigDecimal("12.00"), "box", "Greater Manchester", false, null, null);
  }

  private void stubEmptyPage() {
    when(repository.findAll(any(Specification.class), any(Pageable.class)))
        .thenAnswer(
            invocation -> {
              Pageable pageable = invocation.getArgument(1);
              return new PageImpl<Listing>(List.of(), pageable, 0);
            });
  }

  private Pageable capturedPageable() {
    var captor = org.mockito.ArgumentCaptor.forClass(Pageable.class);
    org.mockito.Mockito.verify(repository).findAll(any(Specification.class), captor.capture());
    return captor.getValue();
  }

  private static Listing sampleListing() {
    return sampleListing(ListingStatus.ACTIVE);
  }

  private static Listing sampleListing(ListingStatus status) {
    return sampleListing(UUID.randomUUID(), status);
  }

  private static Listing sampleListing(UUID vendorId, ListingStatus status) {
    return new Listing(
        UUID.randomUUID(),
        vendorId,
        "Seasonal vegetable box",
        "Mixed veg, picked weekly.",
        "Vegetables",
        1800,
        new BigDecimal("12.00"),
        "box",
        status,
        "Greater Manchester",
        false,
        Instant.now(),
        Instant.now());
  }
}
