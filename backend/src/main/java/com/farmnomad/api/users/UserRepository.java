package com.farmnomad.api.users;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, UUID> {
  /** Relies on the {@code citext} column type for case-insensitive matching. */
  Optional<User> findByEmail(String email);

  boolean existsByEmail(String email);
}
