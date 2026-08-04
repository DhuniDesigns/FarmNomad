package com.farmnomad.api.auth;

public record AuthResponse(String accessToken, UserSummary user, String message) {
  static AuthResponse message(String message) {
    return new AuthResponse(null, null, message);
  }
}
