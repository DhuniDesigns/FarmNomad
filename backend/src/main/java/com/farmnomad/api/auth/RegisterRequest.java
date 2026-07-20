package com.farmnomad.api.auth;

import com.farmnomad.api.users.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegisterRequest(
    @Email @NotBlank String email,
    @NotBlank String password,
    @NotBlank String displayName,
    @NotNull UserRole role) {}
