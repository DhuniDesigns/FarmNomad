package com.farmnomad.api.listings;

import com.farmnomad.api.auth.AuthenticatedUser;
import com.farmnomad.api.common.PageResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/listings")
public class ListingController {
  private final ListingService service;

  public ListingController(ListingService service) {
    this.service = service;
  }

  @GetMapping
  PageResponse<ListingSummary> browse(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) String category,
      @RequestParam(required = false) String location,
      @RequestParam(required = false) String supply,
      @RequestParam(required = false) Integer minPrice,
      @RequestParam(required = false) Integer maxPrice,
      @RequestParam(required = false) String sort,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return service.browse(q, category, location, supply, minPrice, maxPrice, sort, page, size);
  }

  @GetMapping("/{id}")
  ResponseEntity<ListingSummary> detail(@PathVariable UUID id) {
    return service.findPublic(id)
        .map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.notFound().build());
  }

  /** Caller role (FARMER/KITCHEN only) is enforced in SecurityConfig, not here. */
  @PostMapping
  ResponseEntity<ListingSummary> create(@AuthenticationPrincipal AuthenticatedUser caller, @Valid @RequestBody ListingRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(service.create(caller.id(), request));
  }

  /** The caller's own listings, any status — this is the data source for the listings management view, not the public browse. */
  @GetMapping("/mine")
  List<ListingSummary> mine(@AuthenticationPrincipal AuthenticatedUser caller) {
    return service.findOwned(caller.id());
  }

  @PutMapping("/{id}")
  ResponseEntity<ListingSummary> update(
      @AuthenticationPrincipal AuthenticatedUser caller, @PathVariable UUID id, @Valid @RequestBody ListingRequest request) {
    return respond(service.update(caller.id(), id, request));
  }

  @PostMapping("/{id}/archive")
  ResponseEntity<ListingSummary> archive(@AuthenticationPrincipal AuthenticatedUser caller, @PathVariable UUID id) {
    return respond(service.archive(caller.id(), id));
  }

  @PostMapping("/{id}/surplus")
  ResponseEntity<ListingSummary> surplus(
      @AuthenticationPrincipal AuthenticatedUser caller, @PathVariable UUID id, @RequestBody SurplusRequest request) {
    return respond(service.setSurplus(caller.id(), id, request.surplus()));
  }

  private ResponseEntity<ListingSummary> respond(ListingService.OwnedListingOutcome outcome) {
    return switch (outcome) {
      case ListingService.OwnedListingFound found -> ResponseEntity.ok(found.summary());
      case ListingService.ListingNotFound ignored -> ResponseEntity.notFound().build();
      case ListingService.ListingForbidden ignored -> ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    };
  }
}
