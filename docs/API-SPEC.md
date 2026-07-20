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

## 1. Auth **[Confirmed group; contract Recommended — align with existing implementation]**

| Method & path | Auth | Input | Output | Errors |
|---|---|---|---|---|
| POST `/api/auth/register` | none | email, password, displayName, role (FARMER\|KITCHEN\|ORGANISATION) + org fields when ORGANISATION | user summary + token pair | 400 validation; 409 email exists |
| POST `/api/auth/login` | none | email, password | access token (body) + refresh token (httpOnly cookie — **confirmed target design**) | 401 invalid credentials (generic) |
| POST `/api/auth/refresh` | refresh cookie | — | new access token | 401 expired/invalid |
| POST `/api/auth/logout` | bearer | — | 204, clears cookie | — |

Validation: email format; password policy (min length ≥ 8 **[Recommended]**); role must be a web-registrable role (CUSTOMER/DRIVER register via mobile; ADMIN provisioned **[Recommended]**).

## 2. Listings / market **[Confirmed domain]**

| Method & path | Auth | Notes |
|---|---|---|
| GET `/api/listings` | none | Public browse/search: `?q=&category=&minPrice=&maxPrice=&location=` + pagination. Only ACTIVE listings. Consumed by RSC market pages. |
| GET `/api/listings/{id}` | none | Public detail incl. images, vendor summary. 404 if archived (public view). |
| POST `/api/listings` | FARMER, KITCHEN | title, category, pricePence, quantity, unit, description, imageIds. 400 validation. |
| PUT `/api/listings/{id}` | owner vendor | 403 non-owner; 404 unknown. |
| POST `/api/listings/{id}/archive` | owner vendor | Behaviour with open orders: unresolved — see DECISIONS. |
| POST `/api/listings/{id}/surplus` | owner vendor | Flag/unflag for donation (`isSurplus`). |

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
- All monetary inputs integer pence ≥ 0; quantities > 0.

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
