package com.farmnomad.api.auth;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  @PostMapping("/register")
  ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
    return ResponseEntity.accepted().body(AuthResponse.pending("Registration service scaffolded"));
  }

  @PostMapping("/login")
  ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
    return ResponseEntity.accepted().body(AuthResponse.pending("Login service scaffolded"));
  }

  @PostMapping("/refresh")
  ResponseEntity<AuthResponse> refresh() {
    return ResponseEntity.accepted().body(AuthResponse.pending("Refresh token service scaffolded"));
  }
}
