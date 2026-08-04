package com.farmnomad.api.drivers;

import com.farmnomad.api.auth.AuthenticatedUser;
import com.farmnomad.api.users.UserRole;
import java.security.Principal;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

/**
 * A driver always publishes as themselves — there's deliberately no {@code
 * driverId} in the destination or payload, so a connected client can't spoof
 * another driver's position. {@code Principal} is attached by {@link
 * com.farmnomad.api.config.StompAuthChannelInterceptor} at CONNECT time.
 *
 * <p>The spec this implements scopes publish authorisation to "the driver
 * assigned to this order" — there's no {@code Order} entity yet (see
 * docs/DECISIONS.md), so the interim rule is simply "an authenticated DRIVER
 * may publish their own position," rebroadcast on a per-driver topic rather
 * than a per-order one. Revisit once orders exist.
 */
@Controller
public class DriverLocationStompController {
  private final SimpMessagingTemplate messaging;
  private final DriverLocationService locationService;

  public DriverLocationStompController(SimpMessagingTemplate messaging, DriverLocationService locationService) {
    this.messaging = messaging;
    this.locationService = locationService;
  }

  @MessageMapping("/driver/location")
  public void updateLocation(@Payload DriverLocationRequest request, Principal principal) {
    AuthenticatedUser caller = principalOf(principal);
    if (caller == null || caller.role() != UserRole.DRIVER) {
      return;
    }
    if (request.lat() == null || request.lng() == null) {
      return;
    }

    var outcome = locationService.upsert(caller.id(), request.lat(), request.lng(), request.heading(), request.accuracy());
    if (outcome instanceof DriverLocationService.Upserted upserted) {
      messaging.convertAndSend("/topic/driver/" + caller.id() + "/location", DriverLocationResponse.from(upserted.location()));
    }
    // Throttled: silently dropped. The client already self-throttles to ~1 update/10s;
    // this floor only guards against a misbehaving or modified client.
  }

  private static AuthenticatedUser principalOf(Principal principal) {
    if (principal instanceof UsernamePasswordAuthenticationToken token && token.getPrincipal() instanceof AuthenticatedUser authenticatedUser) {
      return authenticatedUser;
    }
    return null;
  }
}
