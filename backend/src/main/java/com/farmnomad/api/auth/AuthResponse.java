package com.farmnomad.api.auth;

public record AuthResponse(String accessToken, String message) {
  static AuthResponse pending(String message) {
    return new AuthResponse(null, message);
  }
}
