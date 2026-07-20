# FarmNomad — Implementation Plan (MVP)

Phases follow the **confirmed build order**: market browse → listing detail → platform shell + listing CRUD → orders dashboard → auth revamp last (existing auth already works functionally). Phase 0 clears confirmed blockers first. Mobile, AI, and NomadEat are parallel/post-MVP streams (Phase 6 outline only).

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

| ID | Task | Depends on |
|---|---|---|
| 1.1 | Design-system primitives needed here: Button, Card (listing), Badge, SearchBar, FilterPanel, Pagination, EmptyState, Skeleton | 0.5 |
| 1.2 | `/market` page as Server Component with `fetch` + ISR against `GET /api/listings` (confirmed architecture) | 0.7 |
| 1.3 | Search + filters (category, price, location) as URL params driving server fetch; client-leaf components only for inputs | 1.1, 1.2 |
| 1.4 | Empty states (no listings; no results) and error/fallback states per USER-FLOWS | 1.2 |
| 1.5 | Playwright: browse, search, filter, paginate (happy + error) ; axe accessibility check | 1.3, 1.4 |

**DoD:** signed-out visitor can browse/search/filter/paginate server-rendered listings; content visible in page source (SEO); LCP budget met on throttled connection; tests green; WCAG AA checks pass.

## Phase 2 — Listing detail

| ID | Task | Depends on |
|---|---|---|
| 2.1 | `/market/[id]` Server Component + ISR: photos, price, quantity, vendor summary | 1.2 |
| 2.2 | 404/unavailable/sold-out states; "currently unavailable" with similar listings | 2.1 |
| 2.3 | Order/enquire CTA → auth redirect preserving `returnTo` | 2.1 |
| 2.4 | Playwright + axe for detail page states | 2.2, 2.3 |

**DoD:** any active listing has a public, indexable detail page; archived/unknown listings 404 gracefully; CTA round-trips through auth back to the listing; tests green.

## Phase 3 — Platform shell + listing CRUD (Farmer/Kitchen)

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

## Phase 5 — Auth revamp (last, per confirmed order)

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
