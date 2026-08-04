package com.farmnomad.api.auth;

import static org.assertj.core.api.Assertions.assertThat;

import com.farmnomad.api.users.User;
import com.farmnomad.api.users.UserRole;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.Test;

class JwtServiceTest {
  private static final String SECRET = "test-only-signing-secret-at-least-32-bytes-long-for-hs256";
  private final JwtService jwtService = new JwtService(SECRET, 15, 30);

  @Test
  void issuesAndParsesAnAccessToken() {
    User user = sampleUser();

    String token = jwtService.issueAccessToken(user);
    var claims = jwtService.parseAccessToken(token);

    assertThat(claims).isPresent();
    assertThat(claims.get().userId()).isEqualTo(user.getId());
    assertThat(claims.get().role()).isEqualTo(UserRole.FARMER);
    assertThat(claims.get().email()).isEqualTo(user.getEmail());
    assertThat(claims.get().displayName()).isEqualTo(user.getDisplayName());
  }

  @Test
  void issuesAndParsesARefreshToken() {
    User user = sampleUser();

    String token = jwtService.issueRefreshToken(user);
    var subject = jwtService.parseRefreshTokenSubject(token);

    assertThat(subject).contains(user.getId());
  }

  @Test
  void refreshTokenIsRejectedWhenParsedAsAnAccessToken() {
    String refreshToken = jwtService.issueRefreshToken(sampleUser());

    assertThat(jwtService.parseAccessToken(refreshToken)).isEmpty();
  }

  @Test
  void accessTokenIsRejectedWhenParsedAsARefreshToken() {
    String accessToken = jwtService.issueAccessToken(sampleUser());

    assertThat(jwtService.parseRefreshTokenSubject(accessToken)).isEmpty();
  }

  @Test
  void rejectsAnExpiredToken() {
    SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    Instant past = Instant.now().minusSeconds(60);
    String expiredToken = Jwts.builder()
        .subject(UUID.randomUUID().toString())
        .claim("type", "access")
        .claim("role", "FARMER")
        .issuedAt(Date.from(past.minusSeconds(60)))
        .expiration(Date.from(past))
        .signWith(key)
        .compact();

    assertThat(jwtService.parseAccessToken(expiredToken)).isEmpty();
  }

  @Test
  void rejectsATokenSignedWithADifferentSecret() {
    SecretKey wrongKey = Keys.hmacShaKeyFor("a-completely-different-signing-secret-32-bytes-plus".getBytes(StandardCharsets.UTF_8));
    String forged = Jwts.builder()
        .subject(UUID.randomUUID().toString())
        .claim("type", "access")
        .claim("role", "FARMER")
        .expiration(Date.from(Instant.now().plusSeconds(600)))
        .signWith(wrongKey)
        .compact();

    assertThat(jwtService.parseAccessToken(forged)).isEmpty();
  }

  private static User sampleUser() {
    return new User(UUID.randomUUID(), "farmer@example.com", "hashed", UserRole.FARMER, "Test Farmer", Instant.now());
  }
}
