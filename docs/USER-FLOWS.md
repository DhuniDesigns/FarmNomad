# FarmNomad — User Flows

**Labelling:** Flow existence and role routing are **[Confirmed]**. Step-level detail, empty/error/success state copy, and edge-case handling are **[Recommended]** — the Figma design revamp (in progress, led by the design lead) is the visual source of truth and may supersede layout details here.

---

## 1. Visitor browses the market (public, web)

**Entry points:** direct URL `/market`, search engine result (pages are ISR-rendered for SEO), link from landing page.

**Steps:**
1. Visitor lands on `/market` — server-rendered grid of active listings.
2. Applies search text and/or filters (category, price range, location).
3. Paginates through results.
4. Opens a listing → `/market/[id]` detail page (photos, price, quantity, vendor, description).
5. Clicks order/enquire → redirected to login/register with a `returnTo` back to the listing.

**Empty states:**
- No listings at all: friendly "market is stocking up" message + CTA to register as a Vendor.
- No results for filter/search: "no matches" with one-click filter reset; keep the search box populated.

**Error states:**
- Listing fetch fails server-side: ISR serves last cached page where available; otherwise a retry page with support contact.
- Listing removed/archived after indexing: 404 page with link back to `/market` (do not 500).

**Success state:** visitor reaches a listing detail and continues to auth with `returnTo` preserved.

**Edge cases:** listing quantity hits zero between browse and detail (show "currently unavailable", offer similar listings); very slow rural connections (public pages ship minimal client JS — confirmed architectural requirement).

---

## 2. Registration with role selection (web)

**Entry points:** "Sign up" in top nav, CTA from market pages, redirect from a protected route.

**Steps:**
1. User opens register page, chooses account type — Vendor (Farmer or Kitchen) or Organisation. (Customer/Driver registration belongs to mobile; Admin accounts are provisioned, not self-served — **[Recommended]**.)
2. Completes form (react-hook-form + zod validation, inline errors).
3. Submits → account created with role → JWTs issued (refresh in httpOnly cookie, access in memory).
4. Routed by role via `routeAfterLogin` to the correct home.
5. Organisations enter a "pending verification" landing state until approved by Admin.

**Empty states:** n/a (form).

**Error states:**
- Field validation: inline, per-field, announced to screen readers.
- Email already registered: non-enumerating message with sign-in link **[Recommended]**.
- Server/network failure: preserve form input, show retry banner.

**Success state:** Vendor lands on dashboard (empty state below); Organisation lands on pending-verification screen.

**Edge cases:** the historical `routeAfterLogin` missing-leading-slash bug caused malformed redirects — regression-test every role's post-auth route; duplicate rapid submits (disable submit while pending).

---

## 3. Login and session restore (web)

**Entry points:** `/login`, redirect from protected route, session expiry.

**Steps:**
1. User submits credentials.
2. Backend returns JWT pair; access token held in memory, refresh in httpOnly cookie.
3. `routeAfterLogin` sends each role to its home: Vendor → dashboard, Organisation → organisation home, Admin → admin panel.
4. On page refresh, bootstrap auth (existing `BootstrapAuth` pattern) silently restores the session from the refresh cookie.

**Error states:** invalid credentials (generic message, no user enumeration); locked/unverified account messaging; refresh-token expiry → clean redirect to login with `returnTo`.

**Success state:** user lands on role-correct page with hydrated auth state.

**Edge cases:** deep link to a protected page while signed out (preserve `returnTo` through login); role mismatch (Organisation hitting a Vendor URL → 403 page, server-enforced, not just hidden nav); token refresh race on parallel tabs **[Recommended: single-flight refresh]**.

---

## 4. Farmer creates and manages a listing (web)

**Entry points:** dashboard "New listing" button; empty-state CTA.

**Steps:**
1. Farmer opens dashboard → listings section.
2. Creates listing: title, category, description, price, quantity/unit, photos (Cloudinary upload).
3. Validates client-side (zod) and server-side; submits.
4. Listing appears in dashboard and, once active, on the public market.
5. Farmer edits or archives from the listing row.

**Empty state (first run):** "No listings yet" with a prominent create CTA and a short how-it-works hint — this is the first Vendor impression, design it deliberately.

**Error states:** photo upload failure (retry per photo, keep other form data); validation errors inline; save conflict/server error (preserve draft state).

**Success state:** toast/confirmation + listing visible in dashboard list; public page reflects it after revalidation.

**Edge cases:** archiving a listing with open orders (block or warn — **unresolved, see DECISIONS**); quantity edits below already-ordered amounts; very large images (client-side constraint before Cloudinary upload).

---

## 5. Farmer handles orders (web)

**Entry points:** dashboard orders section; notification (WebSocket/STOMP) of a new order.

**Steps:**
1. Farmer sees orders list with statuses.
2. Opens an order: buyer, items, quantities, delivery expectation.
3. Progresses status (e.g. accept → prepare → ready/handed to driver — exact status set **unresolved, see DECISIONS**).
4. Activity overview reflects totals.

**Empty state:** "No orders yet" with pointer to sharing/marketplace visibility.

**Error states:** status update fails (optimistic UI rolls back with retry); order withdrawn by buyer (state shown, row retained for history).

**Success state:** order reaches completed state; appears in activity history.

**Edge cases:** MVP has no payments — orders are commitments; no-show/abandoned orders need a cancel path **[Recommended]**.

---

## 6. Surplus donation (web)

**Entry points:** Farmer dashboard "donate" action on a listing/inventory; Organisation home showing available donations.

**Steps:**
1. Farmer marks produce as surplus/donation.
2. Verified Organisations see available donations.
3. Organisation claims → donation order placed (`placeDonationOrder` — **known suspected bug: argument order may persist incorrect IDs; fix before building UI on top**).
4. Handover arranged (driver coordination is post-MVP; MVP assumes direct arrangement — **[Recommended]**).
5. Both sides see completed donation in history.

**Empty states:** Organisation with no available donations ("nothing available right now" + notification opt-in); Farmer with no surplus marked.

**Error states:** claim collision (two organisations claim simultaneously — first wins, second gets a clear "already claimed" state); unverified organisation attempting claim → verification-pending explainer.

**Success state:** donation recorded against correct farmer, organisation, and produce IDs (regression-tested).

**Edge cases:** perishability/time windows on donations (**unresolved**); partial claims of large lots (**unresolved**).

---

## 7. Organisation verification (web)

**Entry points:** post-registration pending screen; Admin panel queue.

**Steps:**
1. Organisation registers and submits identifying details.
2. Admin reviews queue, approves or rejects (MVP: manual review; UK government API tiered verification is future scope — **[Confirmed]**).
3. Organisation is notified (Notification entity exists) and gains donation access.

**Empty state:** Admin queue empty — "all caught up".

**Error states:** rejection with reason shown to the organisation and a resubmission path **[Recommended]**.

**Success state:** organisation status verified; donation features unlocked.

**Edge cases:** re-verification/expiry (**unresolved**); role behaviour while pending (browse-only — **[Recommended]**).

---

## 8. Messaging and notifications (web) — backend exists, UI pending

**Entry points:** message icon in platform shell TopBar; contextual "message vendor/organisation" actions; STOMP-pushed notifications.

**Steps:** open thread list → open/start thread → live exchange over WebSocket → unread counts update in shell.

**Empty state:** no conversations yet.

**Error states:** WebSocket disconnect (auto-reconnect with visible "reconnecting" indicator; queue outbound messages); send failure (retry affordance on the message).

**Success state:** delivered message visible to both parties in real time.

**Edge cases:** messages sent while recipient offline (persisted via Message entity, delivered on next load); notification permission and volume (**unresolved: notification preferences UI**).

---

## 9. Post-MVP mobile journeys (documented for context only) **[Confirmed direction, not MVP]**

- **Customer:** five-tab app (Home, Market, Tools, Give, Me) → browse market → order → track → (payments post-MVP).
- **Driver:** see available delivery jobs → accept → navigate → confirm handover.
- **Farmer mobile tooling:** crop photo → AI scanner diagnosis (synchronous inference v1); weather & planting advisor.

Design these flows only after the web MVP acceptance criteria in `docs/PRD.md` are met.
