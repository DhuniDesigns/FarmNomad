package com.farmnomad.api.listings;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ListingRepository
    extends JpaRepository<Listing, UUID>, JpaSpecificationExecutor<Listing> {
  List<Listing> findByVendorIdOrderByCreatedAtDesc(UUID vendorId);
}
