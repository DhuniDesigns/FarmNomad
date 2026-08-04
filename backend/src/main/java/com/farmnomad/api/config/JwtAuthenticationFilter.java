package com.farmnomad.api.config;

import com.farmnomad.api.auth.AuthenticatedUser;
import com.farmnomad.api.auth.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Reads {@code Authorization: Bearer <token>}, and if it's a valid,
 * unexpired access token (not a refresh token — {@link JwtService} tags each
 * with a {@code type} claim), populates the security context with an
 * {@link AuthenticatedUser} (id + role) as principal and a
 * {@code ROLE_<role>} authority.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
  private static final String BEARER_PREFIX = "Bearer ";

  private final JwtService jwtService;

  public JwtAuthenticationFilter(JwtService jwtService) {
    this.jwtService = jwtService;
  }

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
      throws ServletException, IOException {
    String header = request.getHeader("Authorization");

    if (header != null && header.startsWith(BEARER_PREFIX)) {
      String token = header.substring(BEARER_PREFIX.length());
      jwtService.parseAccessToken(token).ifPresent(claims -> {
        var authority = new SimpleGrantedAuthority("ROLE_" + claims.role().name());
        var principal = new AuthenticatedUser(claims.userId(), claims.role());
        var authentication = new UsernamePasswordAuthenticationToken(principal, null, List.of(authority));
        SecurityContextHolder.getContext().setAuthentication(authentication);
      });
    }

    filterChain.doFilter(request, response);
  }
}
