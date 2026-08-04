package com.farmnomad.api.drivers;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DriverLocationRepository extends JpaRepository<DriverLocation, Long> {
  Optional<DriverLocation> findByDriverId(UUID driverId);
}
