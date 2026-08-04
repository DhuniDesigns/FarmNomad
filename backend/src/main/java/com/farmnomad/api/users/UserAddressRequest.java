package com.farmnomad.api.users;

/**
 * Body for PUT /api/users/me/address. All fields optional at the validation
 * layer — a user can clear their address by sending blanks, and {@code
 * addressLat}/{@code addressLng} are only meant for a manually-dragged pin
 * (see {@link UserService#updateAddress}), not everyday use.
 */
public record UserAddressRequest(String address, String city, String postcode, String country, Double addressLat, Double addressLng) {}
