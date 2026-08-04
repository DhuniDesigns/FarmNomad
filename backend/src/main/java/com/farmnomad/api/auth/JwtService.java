package com.farmnomad.api.auth;

import com.farmnomad.api.users.User;
import com.farmnomad.api.users.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Issues and verifies the two token types used by {@link AuthController}:
 * a short-lived access token (returned in the response body, held in memory
 * client-side) and a longer-lived refresh token (set as an HttpOnly cookie).
 * Each carries a {@code type} claim so one can't be presented as the other.
 */
@Service
public class JwtService {
  private static final String CLAIM_TYPE = "type";
  private static final String CLAIM_ROLE = "role";
  private static final String CLAIM_EMAIL = "email";
  private static final String CLAIM_DISPLAY_NAME = "displayName";
  private static final String TYPE_ACCESS = "access";
  private static final String TYPE_REFRESH = "refresh";

  private final SecretKey signingKey;
  private final Duration accessTokenTtl;
  private final Duration refreshTokenTtl;

  public JwtService(
      @Value("${farmnomad.jwt.secret}") String secret,
      @Value("${farmnomad.jwt.access-token-ttl-minutes:15}") long accessTokenTtlMinutes,
      @Value("${farmnomad.jwt.refresh-token-ttl-days:30}") long refreshTokenTtlDays) {
    this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.accessTokenTtl = Duration.ofMinutes(accessTokenTtlMinutes);
    this.refreshTokenTtl = Duration.ofDays(refreshTokenTtlDays);
  }

  public String issueAccessToken(User user) {
    return issueToken(user, TYPE_ACCESS, accessTokenTtl);
  }

  public String issueRefreshToken(User user) {
    return issueToken(user, TYPE_REFRESH, refreshTokenTtl);
  }

  public Duration getRefreshTokenTtl() {
    return refreshTokenTtl;
  }

  public Optional<AccessTokenClaims> parseAccessToken(String token) {
    return parse(token, TYPE_ACCESS)
        .map(claims -> new AccessTokenClaims(
            UUID.fromString(claims.getSubject()),
            UserRole.valueOf(claims.get(CLAIM_ROLE, String.class)),
            claims.get(CLAIM_EMAIL, String.class),
            claims.get(CLAIM_DISPLAY_NAME, String.class)));
  }

  public Optional<UUID> parseRefreshTokenSubject(String token) {
    return parse(token, TYPE_REFRESH).map(claims -> UUID.fromString(claims.getSubject()));
  }

  private String issueToken(User user, String type, Duration ttl) {
    Instant now = Instant.now();
    return Jwts.builder()
        .subject(user.getId().toString())
        .claim(CLAIM_TYPE, type)
        .claim(CLAIM_ROLE, user.getRole().name())
        .claim(CLAIM_EMAIL, user.getEmail())
        .claim(CLAIM_DISPLAY_NAME, user.getDisplayName())
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plus(ttl)))
        .signWith(signingKey)
        .compact();
  }

  private Optional<Claims> parse(String token, String expectedType) {
    try {
      Claims claims = Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload();
      if (!expectedType.equals(claims.get(CLAIM_TYPE, String.class))) {
        return Optional.empty();
      }
      return Optional.of(claims);
    } catch (JwtException | IllegalArgumentException e) {
      return Optional.empty();
    }
  }

  public record AccessTokenClaims(UUID userId, UserRole role, String email, String displayName) {}
}
