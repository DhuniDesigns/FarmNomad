# FarmNomad — Implementation Plan (MVP)

Phases follow the **confirmed build order**: market browse → listing detail → platform shell + listing CRUD → orders dashboard → auth revamp last. **Correction (2026-08-03):** the "existing auth already works functionally" premise was wrong — `AuthController` was returning hardcoded placeholder responses with no real JWT issuance (see DECISIONS.md). Phase 3 (listing CRUD) turned out to need real sessions to do route protection and ownership checks meaningfully, so the essential slice of Phase 5 (JWT issuance, refresh cookie, web session state) was pulled forward and built ahead of Phase 3's CRUD work — see the Phase 5 status note below. Phase 0 clears confirmed blockers first. Mobile, AI, and NomadEat are parallel/post-MVP streams (Phase 6 outline only).

Task IDs are for dependency reference. "DoD" = definition of done.

---

## Phase 0 — Stabilise the foundation (backend + web hygiene)

Confirmed outstanding issues; nothing new ships until these are closed.

| ID | Task | Depends on |
|---|---|---|
| 0.1 | Investigate and fix the `placeDonationOrder` argument-order bug (suspected wrong IDs persisted to donations table); write a regression test that fails before the fix | — |
| 0.2 | Rotate all secrets previously found hardcoded; confirm none remain in code or git history; document env handling (env-var precedence trap, CRLF trap) | — |
| 0.3 | Web: complete `FOODBANK` → `ORGANISATION` rename across all files; add a CI grep guard against `FOODBANK` and `agriroute` | — |
| 0.4 | Web: fix `routeAfterLogin` missing leading slash; add unit tests covering every role's post-login route | 0.3 |
| 0.5 | Web: install missing packages (`framer-motion`, `@stomp/stompjs`); wire Clash Grotesk via `next/font/local` | — |
| 0.6 | Set up test harnesses: Vitest + Playwright (web), verify backend test suite runs green | — |
| 0.7 | Reconcile `docs/API-SPEC.md` and `docs/DATABASE-SCHEMA.md` against actual backend code/Postman collection; correct the docs | — |

**DoD:** donation regression test green; no `FOODBANK`/`agriroute` strings; every role routes correctly after login; fonts and packages in place; `npm run build`, backend tests, and an initial Playwright smoke test all pass; docs reconciled.

## Phase 1 — Public market browse

**Status (2026-08-03):** 1.2 and 1.3 done — `/market` was found wired to client-side demo data instead of the backend and has been rearchitected to match the confirmed RSC+fetch+ISR decision, with real `GET /api/listings` search/filter/sort/pagination behind it (see DECISIONS §"Technical — web/backend integration"). 1.4 done for the "no results" and "backend unreachable" cases; the "DB has zero listings" case is currently indistinguishable from "no results matching filters" (same empty state) since there's no seed data — acceptable for now, revisit once real listings exist. 1.5 Playwright specs updated to match real data instead of demo fixtures; axe accessibility check not yet added. 1.1 primitives were already in place from the earlier UI build (Button, Badge, SelectField/TextField, EmptyState, Skeleton patterns) — Card is a new `MarketListingCard` scoped to the real `ListingSummary` shape (no images/organic/distance yet, see DECISIONS §15–16); Pagination is Prev/Next rather than infinite "load more" (matches server-paginated data better than the old client-side slice).

| ID | Task | Depends on |
|---|---|---|
| 1.1 | Design-system primitives needed here: Button, Card (listing), Badge, SearchBar, FilterPanel, Pagination, EmptyState, Skeleton | 0.5 |
| 1.2 | `/market` page as Server Component with `fetch` + ISR against `GET /api/listings` (confirmed architecture) | 0.7 |
| 1.3 | Search + filters (category, price, location) as URL params driving server fetch; client-leaf components only for inputs | 1.1, 1.2 |
| 1.4 | Empty states (no listings; no results) and error/fallback states per USER-FLOWS | 1.2 |
| 1.5 | Playwright: browse, search, filter, paginate (happy + error) ; axe accessibility check | 1.3, 1.4 |

**DoD:** signed-out visitor can browse/search/filter/paginate server-rendered listings; content visible in page source (SEO); LCP budget met on throttled connection; tests green; WCAG AA checks pass. **Not yet met:** axe accessibility check; LCP budget unverified; listing detail page (`/market/[id]`, Phase 2) still reads from demo data, so navigating from a real market card currently leads to a page describing different data — flagged for Phase 2.

## Phase 2 — Listing detail

**Status (2026-08-03):** 2.1–2.3 done. `/market/[id]` is now a real RSC + `fetch` + ISR page against `GET /api/listings/{id}` (also newly implemented — was a hardcoded stub). 2.2: unknown/malformed ids and archived listings hit a styled `not-found.tsx`; a separate unreachable-backend state shows a distinct retry page per USER-FLOWS.md (not the same as 404); SOLD_OUT listings render with an "unavailable" message plus the related-listings section rather than 404ing. 2.3: the CTA always redirects to `/login?returnTo=...` — see DECISIONS §"Phase 2 listing detail" for why it doesn't try to detect a signed-in state (there isn't a real one yet). No photos, harvest date, collection window, handling notes, or producer-profile link — `ListingSummary` doesn't carry that data (DECISIONS §18–19). 2.4: Playwright specs added (`web/e2e/listing-detail.spec.ts`) covering not-found, malformed id, and the CTA redirect; axe still not added (DECISIONS §20, same gap as Phase 1).

| ID | Task | Depends on |
|---|---|---|
| 2.1 | `/market/[id]` Server Component + ISR: photos, price, quantity, vendor summary | 1.2 |
| 2.2 | 404/unavailable/sold-out states; "currently unavailable" with similar listings | 2.1 |
| 2.3 | Order/enquire CTA → auth redirect preserving `returnTo` | 2.1 |
| 2.4 | Playwright + axe for detail page states | 2.2, 2.3 |

**DoD:** any active listing has a public, indexable detail page; archived/unknown listings 404 gracefully; CTA round-trips through auth back to the listing; tests green. **Not yet met:** axe check; photos/vendor summary (data doesn't exist yet); real order/enquiry submission after the auth redirect (Phase 4.3, blocked on the order status decision).

## Phase 3 — Platform shell + listing CRUD (Farmer/Kitchen)

**Status (2026-08-04):** 3.3–3.5 and 3.7 done. Backend: `POST /api/listings` (role-gated FARMER/KITCHEN), `PUT /api/listings/{id}`, `POST /api/listings/{id}/archive`, `POST /api/listings/{id}/surplus` (all three ownership-gated via `ListingService.OwnedListingOutcome`), and `GET /api/listings/mine` (not in the original API-SPEC table, added to back the management view) are all implemented and unit-tested; `ListingSummary` gained `description`/`createdAt`. Frontend: `web/src/lib/api/listingsApi.ts` (RTK Query, tag-invalidated on mutation), `ListingForm` and `ListingsManager` both rewired off `useDemoStore` onto real data — create/edit/archive/surplus-flag all round-trip to the real backend. 3.7: `/api/revalidate-listings` route handler + `revalidateMarket()` helper ping `revalidateTag` on the public market's ISR tags after a successful mutation (see DECISIONS.md). Image upload is explicitly deferred (founder decision 2026-08-04) — no `imageIds`, no uploader UI; the create/edit form was also trimmed to only the fields the backend actually stores (harvestDate/handling/collectionWindow/organic/region+postcode+distanceMiles all dropped, see DECISIONS.md). **Not done:** 3.1's actual Sidebar/TopBar visual build (the route-protection half already existed from the Phase 5 pull-forward — `web/middleware.ts` + `PlatformShell`'s real session read) and notification/message counts; 3.2's server-enforced *role* checks for platform *routes* beyond "is signed in" and a 403 page (listing mutations themselves are correctly role/ownership-gated at the API regardless); 3.6 dashboard empty state; 3.8 Playwright coverage and an axe pass.

| ID | Task | Depends on |
|---|---|---|
| 3.1 | `(platform)/layout.tsx` shell: role-aware Sidebar (replaces stub) + TopBar with notification/message counts | 0.4, 1.1 |
| 3.2 | Route protection: server-enforced role checks for platform routes; 403 page | 3.1 |
| 3.3 | RTK Query slices for listings (auth'd) with tag invalidation | 0.7 |
| 3.4 | Listing create/edit forms: react-hook-form + zod, Cloudinary ImageUploader with per-file retry | 3.1, 3.3 |
| 3.5 | Listings management view (table→cards responsive), archive with confirm modal; surplus flag action | 3.4 |
| 3.6 | Dashboard empty state (first-run Vendor experience) | 3.1 |
| 3.7 | ISR revalidation on listing mutations so public pages reflect changes | 3.4 |
| 3.8 | Playwright: create → edit → archive → surplus-flag; role-block test (Organisation cannot reach vendor routes); axe | 3.5, 3.7 |

**DoD:** a Farmer can fully manage listings from a shelled, role-aware dashboard; mutations propagate to public pages; non-vendors are server-blocked; tests green.

## Geolocation & maps backend (2026-08-04, off-plan)

Not one of the phases above — built from an uploaded maps/geolocation spec, not from this plan. Scoped to what already has real persistence (`Listing`, `User`); `Order`/`Organisation` coordinate work is deferred until Phase 4 (and an Organisation-persistence decision) lands — see `docs/DECISIONS.md` "Technical — geolocation & maps" and unresolved questions §22–24.

**Status (2026-08-04):** Done — `GeocodingService` (postcodes.io + Mapbox fallback), coordinates + geocode-on-write for `Listing` and `User` (manual-pin-wins, re-geocode-only-if-changed), `DriverLocation` entity + REST endpoints, `GET /api/geo/postcode/{postcode}` + `/reverse`, `GET /api/surplus/nearby`, and secured live driver-location tracking over the existing STOMP infrastructure (new `StompAuthChannelInterceptor` — the WebSocket layer had no authentication or subscription authorization at all before this). See `docs/API-SPEC.md` §11 for the endpoint contract.

**Not done / deferred:** Order pickup/delivery coordinate snapshots, Organisation lat/lng, order-scoped (vs. self-or-ADMIN) driver-location subscription authorization, `RoutingService`/route-distance caching, `sort=distance` on `GET /api/listings` (columns exist now, but the endpoint has no reference-point param), automated tests for `GeocodingServiceImpl`'s actual HTTP calls, and any frontend `LocationPicker`/map UI (§11 of the original Frontend Build Spec this was meant to unblock — not started).

## Phase 4 — Orders dashboard

| ID | Task | Depends on |
|---|---|---|
| 4.1 | Resolve order status set with founder (see DECISIONS) — blocking decision | — |
| 4.2 | Orders RTK Query slice; orders list + detail views with status progression UI | 3.1, 4.1 |
| 4.3 | Buyer-side order placement from listing detail (authenticated) | 2.3, 4.1 |
| 4.4 | Activity overview (dashboard stats) | 4.2 |
| 4.5 | STOMP wiring: new-order notification to vendor (backend WebSocket exists); reconnect handling | 3.1 |
| 4.6 | Playwright: place order → vendor sees it → progress status → complete; cancel path; axe | 4.3, 4.2 |

**DoD:** end-to-end commitment order flow works between two roles; vendor notified in real time; invalid transitions rejected (409 handled); tests green.

## Phase 5 — Auth revamp (pulled forward, per DECISIONS.md 2026-08-03)

**Status (2026-08-03):** 5.1 and 5.2 done, pulled forward out of order to unblock Phase 3 (see top-of-file correction). 5.1: `AuthController`/`JwtService`/`UserService` issue real access (15min, body) + refresh (30d, httpOnly/Secure/SameSite=Lax cookie scoped to `/api/auth`) JWTs on register/login/refresh; `JwtAuthenticationFilter` + `SecurityConfig` (stateless sessions) enforce it on protected routes. 5.2: no `localStorage` anywhere — access token lives only in the Redux `authSlice`; `BootstrapAuth` calls `/api/auth/refresh` once on mount to silently restore a session. **Not done:** single-flight refresh (concurrent 401s during a token-expiry window can each trigger their own refresh call — rare in practice, deferred, see DECISIONS). 5.3 and 5.4 are substantially done as a side effect — `RegisterForm` already has the Farmer/Kitchen/Organisation role radio wired to the real `/api/auth/register` (org pending-verification *landing* page not built — verification status isn't surfaced anywhere yet, see DECISIONS unresolved #14); `LoginForm` already uses the real `/api/auth/login`, shows the generic no-enumeration error, and round-trips `returnTo`. Still open: neither form has had a full design-system pass (this work prioritized wiring over visual polish), and the Google button is a disabled placeholder pending DECISIONS unresolved #12. 5.5 (admin verification queue) and 5.6 (Playwright coverage for auth) are **not built** — no tests exist yet for register/login/refresh/logout beyond the backend unit tests (`JwtServiceTest`, `UserServiceTest`).

| ID | Task | Depends on |
|---|---|---|
| 5.1 | Backend: refresh token via httpOnly Secure SameSite cookie; access token short-lived in body | 0.2 |
| 5.2 | Web: remove any localStorage token usage; in-memory access token; update `BootstrapAuth` silent restore; single-flight refresh | 5.1 |
| 5.3 | Register page with role selection (Vendor: Farmer/Kitchen; Organisation) + org pending-verification landing | 3.2 |
| 5.4 | Login page revamp per design system; generic auth errors (no enumeration); `returnTo` handling | 5.2 |
| 5.5 | Admin verification queue UI (minimum: list pending orgs, approve/reject with notes) | 3.2 |
| 5.6 | Playwright: register each role, login-routing per role, session restore on refresh, deep-link returnTo, org verification round-trip; axe | 5.3–5.5 |

**DoD:** all PRD §11 auth criteria met; no JWTs in localStorage anywhere; organisations can register → be verified → access donations; tests green. **MVP complete when Phases 0–5 DoDs are all met.**

## Phase 6 — Post-MVP streams (outline; each starts with its own plan)

- **Donations UI** (web): built on the fixed backend — surplus offer, org claim (first-wins 409 handling), completion + history. Depends on 0.1, Phase 3.
- **Messaging UI**: STOMP threads per USER-FLOWS §8. Depends on 4.5.
- **AI service**: scaffold `farmnomad-ai` FastAPI + Colab-ready `train.py` (confirmed next step) → scanner (EfficientNet-B0, PlantVillage 38-class, PlantDoc eval) → weather advisor → matching → surplus prediction. Blocked on GPU decision (DECISIONS).
- **Mobile app**: Expo, five-tab nav (Home, Market, Tools, Give, Me), Customer + Driver flows.
- **Stripe payments**, **equipment marketplace**, **NomadEat**, **tiered UK-gov verification** — in that discussion order, each gated on a DECISIONS entry.

## Dependency summary

Phase 0 → everything. Within the web track: 1 → 2 → (3 → 4) → 5, matching the confirmed build order; 4.1 is the only founder-blocking decision inside the MVP. Phase 6 streams are parallel but must not pull MVP resources before Phase 5 closes.
