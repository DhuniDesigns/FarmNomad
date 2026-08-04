# FarmNomad — API Specification

**Status:** The backend already exposes **15 endpoint groups**, documented in a Postman collection (JWT auto-capture, environment variables, request descriptions). **That collection and the backend code are the source of truth for existing endpoints** — this spec reconstructs the expected contract for agents and marks what is confirmed to exist vs recommended shape. Reconcile before building against any endpoint; log diffs in `docs/DECISIONS.md`.

**Base URL (local):** `http://localhost:9000` **[Confirmed]** · JSON everywhere · Bearer JWT on protected routes.

**Confirmed-to-exist endpoint groups (names approximated from entity/domain records):** auth, users, listings/marketplace, orders, donations, organisations, meals, equipment, notifications, messages, crop scan results, subscriptions — plus additional pre-existing groups; the Postman collection enumerates all 15.

---

## Conventions **[Recommended]**

- Errors: consistent envelope
  ```json
  { "timestamp": "…", "status": 400, "error": "VALIDATION_FAILED", "message": "…", "fieldErrors": [{"field": "price", "message": "must be ≥ 0"}] }
  ```
- Status codes: 200/201 success, 400 validation, 401 unauthenticated, 403 wrong role/ownership, 404 not found, 409 conflict (e.g. donation already claimed), 500 unexpected.
- Pagination: `?page=0&size=20&sort=createdAt,desc` (Spring Pageable), responses include `content`, `totalElements`, `totalPages`, `number`.
- IDs in paths; money in integer pence; timestamps ISO-8601 UTC.

## 1. Auth **[Confirmed group, implemented 2026-08-03 — pulled forward from Phase 5 to unblock Phase 3; see DECISIONS.md]**

| Method & path | Auth | Input | Output | Errors |
|---|---|---|---|---|
| POST `/api/auth/register` | none | email, password (≥8 chars), displayName, role (FARMER\|KITCHEN\|ORGANISATION) — no org fields yet, `organisations` table doesn't exist | 201 + `{accessToken, user: {id, email, displayName, role}, message}` + refresh cookie | 400 validation; 409 email exists |
| POST `/api/auth/login` | none | email, password | 200 + same body shape as register + refresh cookie | 401 — deliberately identical message for unknown email vs. wrong password (no enumeration) |
| POST `/api/auth/refresh` | refresh cookie | — | 200 + same body shape (re-issues both tokens; the refresh cookie is also renewed, sliding-window style) | 401 if cookie missing/invalid/expired, or the user id it names no longer exists |
| POST `/api/auth/logout` | bearer | — | 204, expires the refresh cookie | 401 if no valid bearer token |

Implementation notes:
- Access token: JWT, 15 min TTL (`farmnomad.jwt.access-token-ttl-minutes`), returned in the response body only — held in memory client-side (Redux `authSlice`), never `localStorage`, matching the confirmed decision.
- Refresh token: JWT, 30 day TTL (`farmnomad.jwt.refresh-token-ttl-days`), set as `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/api/auth` cookie named `farmnomad_refresh`.
- Password hashing: BCrypt (`PasswordEncoder` bean already existed in `SecurityConfig`).
- `verification_status` is written as `PENDING` for every new user (matches the `users` table's own column default) and isn't read or enforced anywhere yet — no admin verification queue exists (Phase 5.5, unbuilt).
- No org-specific registration fields (`org_type`, address, etc.) — the `organisations` table referenced in `DATABASE-SCHEMA.md` doesn't exist in the actual schema yet (only `users`, `listings`, `listing_images`, `orders`/`deliveries`, `payments`/`audit` migrations exist, per `V1`–`V5`).
- CORS + cookie note: `farmnomad.web-origin` and the frontend's `NEXT_PUBLIC_API_BASE_URL` must use the *same hostname* (`127.0.0.1`, not a mix of `127.0.0.1`/`localhost`) or the `SameSite` cookie silently won't be sent — see DECISIONS.md.

Validation: email format; password policy (min length ≥ 8, enforced); role must be a web-registrable role — `UserService.register` rejects `ADMIN`/`CUSTOMER`/`DRIVER` with 400 server-side (not just a frontend dropdown restriction, which would be trivially bypassed by calling the API directly).

## 2. Listings / market **[Confirmed domain — all rows below reconciled against code; mutation endpoints implemented 2026-08-04 (Phase 3)]**

| Method & path | Auth | Notes |
|---|---|---|
| GET `/api/listings` | none | **[Confirmed, implemented]** Public browse: `?q=&category=&location=&supply=&minPrice=&maxPrice=&sort=&page=&size=`. Always filters to `status=ACTIVE`. `q` matches title/description (case-insensitive substring). `category`/`location` are case-insensitive exact match. `supply` is `surplus`\|`sale`\|`all` (maps to `is_surplus`); `organic` is accepted but currently a no-op — no `is_organic` column, see DECISIONS §3. `sort` is `newest` (default, `createdAt` desc), `price-asc` (`price_pence` asc), or `quantity` (desc); `distance` is accepted but falls back to `newest` — `listings` gained `pickup_lat`/`pickup_lng` in the 2026-08-04 geolocation pass, but this endpoint has nowhere to accept a reference point to sort by yet, see DECISIONS §"Technical — geolocation & maps". `size` is clamped to 100. Consumed server-side by `/market` (RSC + `fetch` + ISR, revalidate 300s, tag `listings`) via `web/src/lib/api/publicListings.ts`. |
| GET `/api/listings/{id}` | none | **[Confirmed, implemented]** 200 with `ListingSummary` for `ACTIVE`/`SOLD_OUT` listings; 404 for an unknown id or an `ARCHIVED` listing (matches "404 if archived" above); 400 for a malformed UUID path segment (default Spring behaviour, not custom-handled). `ListingSummary` now includes `description` and `createdAt` (added Phase 3) but still has no images, vendor id, or vendor summary — those remain the target shape but aren't in the DTO yet, so the detail page can't render them or link to a producer profile. Consumed by `/market/[id]` (RSC + `fetch` + ISR, tag `listing:{id}`) via `web/src/lib/api/publicListings.ts`'s `getPublicListing`, which distinguishes a real 404/400 (→ Next.js `notFound()`) from a network/5xx failure (→ a distinct retry page, per USER-FLOWS.md — no silent fallback content on a specific listing id). |
| GET `/api/listings/mine` | any authenticated user | **[Implemented, not in the original spec — added Phase 3]** The caller's own listings, every status (not just `ACTIVE`) — backs the listings management view (`/listings`). Returns `[]` for a caller who owns nothing (e.g. an `ORGANISATION` account); there's no role restriction on the read, only on create. |
| POST `/api/listings` | FARMER, KITCHEN (`SecurityConfig.hasAnyRole`) | **[Implemented]** Body: `ListingRequest` — title, description (optional), category, pricePence (≥0), quantity (≥0, matches the DB `CHECK`, not the ">0" this doc previously said), unit, location, surplus, `pickupLat`/`pickupLng` (both optional — see below). No `imageIds` — image upload was explicitly deferred this pass (see DECISIONS). 201 + `ListingSummary`; 400 validation. |
| PUT `/api/listings/{id}` | owner vendor | **[Implemented]** Same body as POST (full replace of the editable fields; `status` isn't settable here — see archive below). 200 + `ListingSummary`; 403 if the caller isn't the listing's `vendor_id`; 404 unknown id. |
| POST `/api/listings/{id}/archive` | owner vendor | **[Implemented]** No body. Sets `status=ARCHIVED`. Behaviour with open orders is still unresolved (see DECISIONS) — currently a no-op concern since no order data exists yet to conflict with; revisit once Phase 4 ships. 200 + `ListingSummary`; 403/404 as above. |
| POST `/api/listings/{id}/surplus` | owner vendor | **[Implemented]** Body: `{ "surplus": boolean }` — sets, not toggles, the flag (the frontend computes the toggle and sends the explicit target value). 200 + `ListingSummary`; 403/404 as above. |

Ownership/ role notes: `JwtAuthenticationFilter` now sets the security-context principal to an `AuthenticatedUser(id, role)` record (was a bare `UUID`) so `ListingController` can resolve both without re-parsing the `ROLE_*` authority string. Create is role-gated in `SecurityConfig` (`hasAnyRole("FARMER", "KITCHEN")`); update/archive/surplus are ownership-gated in `ListingService` (`ListingService.OwnedListingOutcome` — `Found`/`NotFound`/`Forbidden`) rather than role-gated, since ownership is the real invariant and a role check alone couldn't stop one `FARMER` editing another's listing.

`ListingSummary` also now carries `pickupLat`/`pickupLng` (nullable) — see §11.

## 3. Orders **[Confirmed domain; commitment-based at MVP — no payment endpoints]**

| Method & path | Auth | Notes |
|---|---|---|
| POST `/api/orders` | authenticated buyer | items[{listingId, quantity}]. 400 quantity > available; 409 listing inactive. |
| GET `/api/orders` | authenticated | Role-scoped: vendors see incoming (`?role=vendor`), buyers see own. |
| GET `/api/orders/{id}` | buyer or vendor on the order | 403 otherwise. |
| POST `/api/orders/{id}/status` | vendor (forward transitions), buyer (cancel) | Target status; valid transitions only → 409 invalid transition. Status set unresolved — see DECISIONS. |

## 4. Donations **[Confirmed domain — contains the known suspected bug]**

> `placeDonationOrder` may persist IDs in the wrong order (wrong farmer/organisation/listing IDs in the donations table). **Fix + regression test before building new UI on this group.**

| Method & path | Auth | Notes |
|---|---|---|
| GET `/api/donations/available` | ORGANISATION (verified) | Browse claimable surplus. 403 if unverified. |
| POST `/api/donations` | FARMER, KITCHEN | Offer surplus: listingId, quantity. |
| POST `/api/donations/{id}/claim` | ORGANISATION (verified) | First-wins; 409 already claimed. |
| POST `/api/donations/{id}/complete` | donor or recipient | Marks handover done. |
| GET `/api/donations` | donor / organisation | Own history, role-scoped. |

## 5. Organisations & verification **[Confirmed domain]**

| Method & path | Auth | Notes |
|---|---|---|
| GET `/api/organisations/me` | ORGANISATION | Own profile + verificationStatus. |
| PUT `/api/organisations/me` | ORGANISATION | Update profile; may reset verification **(unresolved)**. |
| GET `/api/admin/organisations?status=PENDING` | ADMIN | Verification queue. |
| POST `/api/admin/organisations/{id}/verify` | ADMIN | approve/reject + notes; triggers notification (Spring Event **[Confirmed pattern]**). |

## 6. Messages & notifications **[Confirmed entities; STOMP confirmed]**

- REST: GET `/api/messages/threads`, GET `/api/messages?with={userId}`, POST `/api/messages` (recipientId, body) — history and send.
- WebSocket: STOMP endpoint (e.g. `/ws`) with per-user queues for new messages and notifications; heartbeats + auto-reconnect client-side. Exact destinations: follow backend WebSocket config.
- GET `/api/notifications` (paginated), POST `/api/notifications/{id}/read`.

## 7. Meals, Equipment, Subscriptions **[Confirmed CRUD exists]**

Standard CRUD per entity (see Postman collection for exact shapes). Not on the web MVP critical path; do not extend without a DECISIONS entry.

## 8. Crop scan (AI integration) **[Confirmed entity; flow Recommended]**

1. Client uploads image (Cloudinary).
2. POST `/api/crop-scans` { imageId } → backend calls FastAPI service synchronously **[Confirmed: sync inference v1]**.
3. FastAPI: POST `/predict` { imageUrl } → { predictedClass, confidence, modelVersion }.
4. Backend persists CropScanResult, returns it. Errors: 502 AI service unavailable; 422 unprocessable image.

## 9. Validation summary

- Bean Validation on all request DTOs (mirror zod schemas on web) **[Confirmed tooling both ends]**.
- Ownership checks in services for every mutation (vendor owns listing; participant on order/donation/message).
- Role checks server-side on every protected route; never trust client role claims beyond the verified JWT.
- All monetary inputs integer pence ≥ 0; quantities ≥ 0 (matches the `listings` table's `CHECK (quantity >= 0)` — this doc previously said "> 0", which was aspirational rather than reconciled against the schema).

## 10. Expected error catalogue **[Recommended]**

| error code | HTTP | Meaning |
|---|---|---|
| VALIDATION_FAILED | 400 | Field errors attached |
| UNAUTHENTICATED | 401 | Missing/expired token |
| FORBIDDEN | 403 | Role/ownership failure, unverified organisation |
| NOT_FOUND | 404 | Unknown or non-visible resource |
| CONFLICT | 409 | Duplicate email, claimed donation, invalid status transition |
| AI_UNAVAILABLE | 502 | FastAPI service unreachable |
| INTERNAL | 500 | Unexpected; no internals leaked |

## 11. Geolocation & maps **[Implemented 2026-08-04 — scoped to what has real persistence today; see DECISIONS.md "Technical — geolocation & maps"]**

Built from an uploaded maps/geolocation spec that assumed `Order` and `Organisation` already had real JPA entities and tables — neither does yet (both are empty stub `@Service`/`@RestController` classes; Phase 4 "Orders dashboard" is still unbuilt). This pass covers only what has real persistence today: `Listing` (the spec's "Product") and `User`. Order coordinate snapshots and Organisation coordinates are deferred until those entities exist — see DECISIONS.md.

| Method & path | Auth | Notes |
|---|---|---|
| GET `/api/geo/postcode/{postcode}` | authenticated | `{ lat, lng, postcode }`. Proxies postcodes.io so the frontend never needs a key. 404 if not a resolvable UK postcode. |
| GET `/api/geo/reverse?lat=&lng=` | authenticated | `{ postcode, district, region }` — nearest UK postcode to a coordinate pair, via postcodes.io reverse lookup. 404 on failure. |
| PUT `/api/users/me/address` | authenticated | Body: `{ address, city, postcode, country, addressLat?, addressLng? }`. Geocodes on write (postcode-first, then free-text fallback) unless the caller supplies `addressLat`/`addressLng`, which are accepted verbatim and marked `MANUAL`. Re-geocoding only happens if the address text actually changed, and never overwrites an existing `MANUAL` pin. 204; 404 unknown caller (shouldn't happen given JWT auth). |
| PUT `/api/drivers/me/location` | DRIVER | Body: `{ lat, lng, heading?, accuracy? }`. Upserts the caller's own position. 200 + `{ lat, lng, heading, accuracy, updatedAt }`; 429 if called faster than `farmnomad.location.min-update-interval-seconds` (default 5s) since the last update. |
| GET `/api/drivers/me/location` | DRIVER | Reads back the caller's own last-reported position. 200 or 404 if never reported. |
| GET `/api/surplus/nearby?lat=&lng=&radiusKm=&limit=` | ORGANISATION, ADMIN | `radiusKm` default 25, clamped server-side to `farmnomad.location.max-radius-km` (default 100); `limit` default 50. Returns `[{ listing: ListingSummary, distanceKm }]` for `is_surplus=true` `ACTIVE` listings, bounding-box-prefiltered then exact-Haversine-filtered and sorted ascending by distance. Not scoped to "this organisation's own location" — the spec defines it as a raw lat/lng query, no `Organisation` entity needed. |

WebSocket (STOMP, existing `/ws` endpoint): a driver publishes their own position to `/app/driver/location` (no `driverId` in the payload — it's derived from the authenticated STOMP session, so a client can't spoof another driver), rebroadcast to `/topic/driver/{driverId}/location`. The spec this implements scopes both publish and subscribe permission to "the driver/customer on this order," which needs an `Order` entity that doesn't exist yet — the interim model is self-or-ADMIN for both directions (`StompAuthChannelInterceptor`), tightened to order-scoped once orders are real. STOMP `CONNECT` now requires a `Authorization: Bearer <token>` native header (previously unauthenticated); the `/ws` handshake itself is `permitAll` at the HTTP-security level since real auth happens at the STOMP frame, not the HTTP request.

`ListingRequest`/`ListingSummary` DTO changes: `pickupLat`/`pickupLng` (nullable `Double`) added to both — see §2.
