package com.farmnomad.api.auth;

import com.farmnomad.api.users.UserRole;
import java.util.UUID;

/**
 * Security-context principal set by {@link com.farmnomad.api.config.JwtAuthenticationFilter}
 * for every request carrying a valid access token. Carries both the user id
 * (for ownership checks, e.g. "does this listing belong to this vendor?")
 * and the role (for role-gated actions, e.g. "only FARMER/KITCHEN can create
 * a listing") so controllers don't need to re-parse the {@code ROLE_*}
 * authority string to get the role back out.
 */
public record AuthenticatedUser(UUID id, UserRole role) {}
