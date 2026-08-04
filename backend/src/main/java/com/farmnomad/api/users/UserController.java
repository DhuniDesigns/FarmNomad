package com.farmnomad.api.users;

import com.farmnomad.api.auth.AuthenticatedUser;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
  private final UserService service;

  public UserController(UserService service) {
    this.service = service;
  }

  /**
   * Sets the caller's own address (and, on success, geocoded coordinates).
   * Any authenticated role — a delivery destination for a customer, home
   * base for a driver, or site address for an organisation, is all the same
   * shape today.
   */
  @PutMapping("/me/address")
  ResponseEntity<Void> updateAddress(@AuthenticationPrincipal AuthenticatedUser caller, @RequestBody UserAddressRequest request) {
    return switch (service.updateAddress(caller.id(), request)) {
      case UserService.AddressUpdated ignored -> ResponseEntity.noContent().build();
      case UserService.UserNotFound ignored -> ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    };
  }
}
