package com.farmnomad.api.drivers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class DriverLocationServiceTest {
  private final DriverLocationRepository repository = mock(DriverLocationRepository.class);
  private final DriverLocationService service = new DriverLocationService(repository, 5);

  @Test
  void createsANewRowForADriverWithNoExistingLocation() {
    UUID driverId = UUID.randomUUID();
    when(repository.findByDriverId(driverId)).thenReturn(Optional.empty());
    when(repository.save(any(DriverLocation.class))).thenAnswer(invocation -> invocation.getArgument(0));

    var outcome = service.upsert(driverId, 53.48, -2.24, 90.0, 5.0);

    assertThat(outcome).isInstanceOf(DriverLocationService.Upserted.class);
    DriverLocation saved = ((DriverLocationService.Upserted) outcome).location();
    assertThat(saved.getDriverId()).isEqualTo(driverId);
    assertThat(saved.getLat()).isEqualTo(53.48);
  }

  @Test
  void updatesTheExistingRowWhenEnoughTimeHasPassed() {
    UUID driverId = UUID.randomUUID();
    DriverLocation existing = new DriverLocation(driverId, 53.0, -2.0, null, null, Instant.now().minusSeconds(10));
    when(repository.findByDriverId(driverId)).thenReturn(Optional.of(existing));
    when(repository.save(any(DriverLocation.class))).thenAnswer(invocation -> invocation.getArgument(0));

    var outcome = service.upsert(driverId, 53.5, -2.5, null, null);

    assertThat(outcome).isInstanceOf(DriverLocationService.Upserted.class);
    assertThat(((DriverLocationService.Upserted) outcome).location().getLat()).isEqualTo(53.5);
  }

  @Test
  void throttlesUpdatesArrivingFasterThanTheConfiguredFloor() {
    UUID driverId = UUID.randomUUID();
    DriverLocation existing = new DriverLocation(driverId, 53.0, -2.0, null, null, Instant.now());
    when(repository.findByDriverId(driverId)).thenReturn(Optional.of(existing));

    var outcome = service.upsert(driverId, 53.5, -2.5, null, null);

    assertThat(outcome).isInstanceOf(DriverLocationService.Throttled.class);
    // The row must not have been touched.
    assertThat(existing.getLat()).isEqualTo(53.0);
  }

  @Test
  void findByDriverIdReturnsEmptyWhenNeverReported() {
    UUID driverId = UUID.randomUUID();
    when(repository.findByDriverId(driverId)).thenReturn(Optional.empty());

    assertThat(service.findByDriverId(driverId)).isEmpty();
  }
}
