package com.farmnomad.api.auth;

import com.farmnomad.api.users.User;
import com.farmnomad.api.users.UserRole;
import java.util.UUID;

public record UserSummary(UUID id, String email, String displayName, UserRole role) {
  static UserSummary from(User user) {
    return new UserSummary(user.getId(), user.getEmail(), user.getDisplayName(), user.getRole());
  }
}
