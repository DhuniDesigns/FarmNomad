package com.farmnomad.api.auth;

import com.farmnomad.api.users.User;
import com.farmnomad.api.users.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Arrays;
import java.util.Optional;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private static final String REFRESH_COOKIE_NAME = "farmnomad_refresh";
  // Scoped narrowly to /api/auth rather than the whole API — the refresh
  // token has no business being sent on every request.
  private static final String REFRESH_COOKIE_PATH = "/api/auth";

  private final UserService userService;
  private final JwtService jwtService;

  public AuthController(UserService userService, JwtService jwtService) {
    this.userService = userService;
    this.jwtService = jwtService;
  }

  @PostMapping("/register")
  ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
    var outcome = userService.register(request.email(), request.password(), request.displayName(), request.role());

    return switch (outcome) {
      case UserService.Registered registered -> issueSession(registered.user(), "Account created", HttpStatus.CREATED);
      case UserService.EmailAlreadyInUse ignored ->
          ResponseEntity.status(HttpStatus.CONFLICT).body(AuthResponse.message("An account with this email already exists."));
      case UserService.RoleNotWebRegistrable ignored ->
          ResponseEntity.status(HttpStatus.BAD_REQUEST).body(AuthResponse.message("That role can't be registered here."));
    };
  }

  @PostMapping("/login")
  ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
    return userService.authenticate(request.email(), request.password())
        .map(user -> issueSession(user, "Signed in", HttpStatus.OK))
        // Deliberately the same message whether the email is unknown or the
        // password is wrong — no user enumeration (API-SPEC.md §1).
        .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(AuthResponse.message("Invalid email or password.")));
  }

  @PostMapping("/refresh")
  ResponseEntity<AuthResponse> refresh(HttpServletRequest request) {
    return readRefreshCookie(request)
        .flatMap(jwtService::parseRefreshTokenSubject)
        .flatMap(userService::findById)
        .map(user -> issueSession(user, "Session restored", HttpStatus.OK))
        .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(AuthResponse.message("Session expired — please sign in again.")));
  }

  @PostMapping("/logout")
  ResponseEntity<Void> logout() {
    ResponseCookie expired = ResponseCookie.from(REFRESH_COOKIE_NAME, "")
        .httpOnly(true)
        .secure(true)
        .sameSite("Lax")
        .path(REFRESH_COOKIE_PATH)
        .maxAge(0)
        .build();

    return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, expired.toString()).build();
  }

  private ResponseEntity<AuthResponse> issueSession(User user, String message, HttpStatus status) {
    String accessToken = jwtService.issueAccessToken(user);
    String refreshToken = jwtService.issueRefreshToken(user);

    ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE_NAME, refreshToken)
        .httpOnly(true)
        .secure(true)
        .sameSite("Lax")
        .path(REFRESH_COOKIE_PATH)
        .maxAge(jwtService.getRefreshTokenTtl())
        .build();

    return ResponseEntity.status(status)
        .header(HttpHeaders.SET_COOKIE, cookie.toString())
        .body(new AuthResponse(accessToken, UserSummary.from(user), message));
  }

  private Optional<String> readRefreshCookie(HttpServletRequest request) {
    Cookie[] cookies = request.getCookies();
    if (cookies == null) {
      return Optional.empty();
    }
    return Arrays.stream(cookies)
        .filter(cookie -> REFRESH_COOKIE_NAME.equals(cookie.getName()))
        .map(Cookie::getValue)
        .findFirst();
  }
}
