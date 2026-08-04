package com.farmnomad.api.config;

import com.farmnomad.api.auth.AuthenticatedUser;
import com.farmnomad.api.auth.JwtService;
import com.farmnomad.api.users.UserRole;
import java.security.Principal;
import java.util.List;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

/**
 * Live location is the most sensitive data this platform handles, and
 * Spring's simple broker does not authorise subscriptions by default —
 * without this interceptor, any authenticated user could subscribe to any
 * driver's location feed just by knowing (or guessing) their id.
 *
 * <p>Two jobs, both on {@code clientInboundChannel}:
 *
 * <ol>
 *   <li>CONNECT — reads the same bearer token the REST API uses from a STOMP
 *       native header, validates it via {@link JwtService}, and attaches an
 *       {@link AuthenticatedUser} principal to the STOMP session so later
 *       frames on that session know who's connected.
 *   <li>SUBSCRIBE to {@code /topic/driver/{driverId}/location} — only the
 *       driver themself or an ADMIN may subscribe. There's no {@code Order}
 *       entity yet to scope this by "the customer who placed this order"
 *       (see docs/DECISIONS.md), so self-or-admin is the interim model;
 *       tighten this once orders exist and a location feed should be scoped
 *       to "the customer waiting on this specific delivery" instead.
 * </ol>
 */
@Component
public class StompAuthChannelInterceptor implements ChannelInterceptor {
  private static final String DRIVER_LOCATION_TOPIC_PREFIX = "/topic/driver/";

  private final JwtService jwtService;

  public StompAuthChannelInterceptor(JwtService jwtService) {
    this.jwtService = jwtService;
  }

  @Override
  public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

    if (StompCommand.CONNECT.equals(accessor.getCommand())) {
      authenticate(accessor);
    } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
      authoriseSubscription(accessor);
    }

    return message;
  }

  private void authenticate(StompHeaderAccessor accessor) {
    String token = bearerToken(accessor.getFirstNativeHeader("Authorization"));
    AuthenticatedUser principal = token == null
        ? null
        : jwtService.parseAccessToken(token).map(claims -> new AuthenticatedUser(claims.userId(), claims.role())).orElse(null);

    if (principal == null) {
      throw new MessagingException("Missing or invalid bearer token on STOMP CONNECT");
    }

    var authority = new SimpleGrantedAuthority("ROLE_" + principal.role().name());
    accessor.setUser(new UsernamePasswordAuthenticationToken(principal, null, List.of(authority)));
  }

  private void authoriseSubscription(StompHeaderAccessor accessor) {
    String destination = accessor.getDestination();
    if (destination == null || !destination.startsWith(DRIVER_LOCATION_TOPIC_PREFIX)) {
      return;
    }

    AuthenticatedUser caller = principalOf(accessor.getUser());
    if (caller == null) {
      throw new MessagingException("Unauthenticated SUBSCRIBE to " + destination);
    }

    String driverIdSegment = destination.substring(DRIVER_LOCATION_TOPIC_PREFIX.length()).split("/")[0];
    boolean isSelf = caller.id().toString().equalsIgnoreCase(driverIdSegment);
    boolean isAdmin = caller.role() == UserRole.ADMIN;

    if (!isSelf && !isAdmin) {
      throw new MessagingException("Not authorised to subscribe to " + destination);
    }
  }

  private static AuthenticatedUser principalOf(Principal user) {
    if (user instanceof UsernamePasswordAuthenticationToken token && token.getPrincipal() instanceof AuthenticatedUser authenticatedUser) {
      return authenticatedUser;
    }
    return null;
  }

  private static String bearerToken(String authorizationHeader) {
    if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
      return null;
    }
    return authorizationHeader.substring("Bearer ".length());
  }
}
