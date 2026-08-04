# FarmNomad Web App — Product Requirements Document (V1)

**Version:** 1.0 · **Date:** 20 July 2026 · **Owner:** PrimeSenpai · **Surface:** Web (Vendors, Organisations, Admins)

---

## 1. Product

**FarmNomad** — a UK AgriTech web platform where farmers list produce and surplus, and organisations and kitchens find, buy, or receive it — unifying marketplace, surplus redistribution, and agricultural logistics in one place.

---

## 2. Problem Statement

UK farmers and small food vendors sit on perishable inventory with no fast digital route to buyers. Today they rely on phone calls, WhatsApp groups, wholesale middlemen, and physical markets — channels that are slow, opaque on price, and blind to surplus. The result: sellable produce is dumped or ploughed back in (WRAP estimates ~1.6M tonnes of UK farm-gate food surplus/waste annually), while charities, community kitchens, and food organisations that want that exact produce have no visibility into who has what, where, and when.

Existing tools each solve a slice: wholesale marketplaces ignore surplus/donation flows; redistribution charities (FareShare-style) ignore commercial sales; logistics is bolted on separately everywhere. Nobody unifies **sell + redistribute + move** for the same listing.

The web experience is where the supply side lives. A farmer managing 15 listings, a kitchen sourcing weekly stock, or an organisation applying for donated surplus needs a desktop-class interface: dense tables, multi-field forms, dashboards. If the web surface isn't fast and clear, the marketplace has no inventory and the mobile (buyer) side has nothing to browse.

---

## 3. Target Users (Web Roles)

| Role | Who they are | Primary web jobs |
|---|---|---|
| **Farmer** (Vendor) | UK growers/producers, solo to mid-size; time-poor, moderately technical, often on rural connections | Create/manage listings, mark surplus, view and fulfil orders, track activity |
| **Kitchen** (Vendor) | Commercial/community kitchens, incl. NomadEat prep partners | Source produce, manage own prepared-goods listings, fulfil orders |
| **Organisation** | Charities, food banks, schools, community groups | Browse marketplace and surplus, place orders/claims, manage org profile (full application/verification flow is post-V1) |
| **Admin** | FarmNomad staff | Oversee users and listings, moderate content, verify accounts |

**Non-web roles (V1):** Customers and Drivers are mobile-first and out of scope here.

---

## 4. Core Features for V1 (max 5) — and the build order

Opinionated cut: V1 is the **supply-side loop** — a buyer can find a listing, and a farmer can manage listings and see orders. Anything not on that loop (messaging, weather, verification workflows, payments) is cut.

**Build order rationale:** functional auth (RTK Query flow, role routing, `BootstrapAuth`) already exists in the codebase, so auth *pages* are a revamp, not a blocker. Build public market pages first (no auth dependency, immediately demoable), then the dashboard shell + listings (highest farmer value), then orders, then finish auth. This matches your stated sequencing: market → dashboard → auth.

### F1. Marketplace browse & search (public) — *build first*
Public, server-rendered catalogue of produce/goods listings. Text search, filters (category, price range, location/region, surplus-vs-sale, organic), sort (newest, price, distance), pagination. Card grid with image, price/unit, vendor, location, surplus badge.

### F2. Listing detail page — *build second*
Full listing view: image gallery, description, price/unit, quantity available, vendor profile card, harvest/best-before dates, surplus/donation flag, collection/delivery info. CTA is role-aware: order/claim for authenticated buyers, "sign in to order" otherwise.

### F3. Platform shell + Farmer listing management — *build third*
The `(platform)` layout (role-aware Sidebar + TopBar — currently a stub) plus full listing CRUD: create/edit form with image upload (Cloudinary), quantity and pricing, surplus toggle, draft/active/sold-out/expired status, and a filterable "My Listings" table.

### F4. Farmer orders & activity dashboard — *build fourth*
Incoming orders table (buyer, items, quantity, status), order detail with status transitions (pending → accepted → ready → completed / cancelled), and a dashboard home with headline stats: active listings, pending orders, revenue this month, surplus redistributed (kg).

### F5. Authorization pages & role-based access — *build fifth (revamp)*
Redesigned login and register (role selection: Farmer / Kitchen / Organisation), field validation, error states, forgot-password stub. Hardening of what exists: fix the `routeAfterLogin` missing-slash bug, complete the `FOODBANK → ORGANISATION` rename, route-group middleware guarding `(platform)` routes by role, JWT refresh handling.

**Why these five:** F1+F2 make the platform real to buyers and demoable to supervisors/investors with zero auth work. F3 is the single highest-value farmer feature — no listings, no marketplace. F4 closes the loop so the dashboard is a working tool, not a brochure. F5 last because a functional (if unpolished) auth flow already exists; polishing it before there's anything to log into would be backwards.

---

## 5. User Stories

### F1 — Marketplace browse & search
- As an **Organisation**, I want to filter listings to surplus/donation items in my region so that I can source free or low-cost produce for the people we serve.
- As a **Kitchen**, I want to search by produce type and sort by price so that I can plan this week's menu around what's available and affordable.
- As a **visitor** (unauthenticated), I want to browse the marketplace without an account so that I can judge whether FarmNomad is worth signing up for.
- As an **Admin**, I want listings to paginate and load fast even at thousands of items so that the catalogue stays usable as supply grows.

### F2 — Listing detail
- As a **Kitchen**, I want to see quantity available, unit pricing, and collection/delivery options on one page so that I can decide to order without contacting the farmer.
- As an **Organisation**, I want to see whether an item is a donation/surplus claim or a purchase so that I don't waste time on stock we can't afford.
- As a **Farmer**, I want my vendor profile (name, location, other listings) shown on my listings so that buyers build trust in me and buy again.

### F3 — Platform shell + listing management
- As a **Farmer**, I want to create a listing with photos, price, quantity, and a surplus toggle in under 3 minutes so that listing stock fits into a working day.
- As a **Farmer**, I want to mark a listing sold-out or expired without deleting it so that my catalogue stays accurate with minimal effort.
- As a **Farmer**, I want a sidebar that shows only my role's sections so that I'm never lost in screens that don't apply to me.
- As a **Kitchen**, I want the same listing tools for my prepared goods so that vendors of both types work in one consistent dashboard.

### F4 — Orders & activity
- As a **Farmer**, I want new orders to appear in a table with buyer and quantity so that I can accept or decline quickly.
- As a **Farmer**, I want to move an order through pending → accepted → ready → completed so that the buyer always knows where their order stands.
- As a **Farmer**, I want dashboard stats (active listings, pending orders, monthly revenue, surplus redistributed) so that I can see at a glance whether the platform is paying off.

### F5 — Authorization
- As a **new user**, I want to register and pick my role (Farmer / Kitchen / Organisation) so that I land in the right experience immediately.
- As a **Farmer**, I want to stay signed in across visits and land on my dashboard after login so that daily use is frictionless.
- As an **Admin**, I want role-based route protection so that vendors cannot reach admin screens and vice versa.
- As a **user who mistyped**, I want inline validation and clear error messages so that I can fix mistakes without guessing.

---

## 6. Explicitly Out of Scope for V1

| Excluded | Why |
|---|---|
| Mobile app (Customer/Driver) | Separate React Native/Expo stream; web is the supply-side surface |
| NomadEat sub-brand | Depends on kitchen vendors existing at volume first |
| AI features (crop scanner, surplus prediction, smart matching, weather advisor) | Separate FastAPI stream; none are on the core buy/sell loop |
| Driver flows & logistics coordination | No orders exist yet to move; premature |
| **Payment processing (Stripe)** | Deliberately excluded — argued below |
| In-platform messaging / WebSocket features | Real-time adds infra surface; not on the V1 loop (STOMP client stays in the stack, unwired) |
| Organisation verification workflows (UK gov API checks, tiered verification) | Post-V1; V1 orgs register with basic profiles |
| Equipment rental/purchase marketplace | Separate vertical |

**The payments argument:** it's tempting to pull Stripe into V1 because "marketplace." Resist it. V1 orders are *commitments*, settled off-platform (cash/bank transfer on collection — how these buyers already pay). Stripe Connect for a multi-vendor UK marketplace means onboarding/KYC for every farmer, payout schedules, refund flows, and dispute handling — weeks of work that blocks the core loop and adds nothing to the dissertation's architectural story. The order-status model (F4) is designed so a `paid` state and Stripe webhooks slot in post-V1 without schema upheaval.

---

## 7. Tech Stack — validation, weak points, fixes

### Confirmed choices

| Choice | Justification |
|---|---|
| **Next.js (App Router) + TypeScript** | SSR/ISR for SEO-critical market pages, route groups map cleanly to role areas, TS types shared across API layer |
| **Tailwind CSS v4** | Fast iteration against the Figma designs; no runtime CSS cost |
| **RTK Query** | Already proven in the codebase (auth flow works); caching + invalidation fits dashboard CRUD perfectly |
| **Framer Motion** | Polish for market cards and dashboard transitions; differentiates the demo |
| **@stomp/stompjs** | Pairs natively with Spring's STOMP broker for post-V1 messaging/notifications |
| **Clash Grotesk** (`next/font/local`) | Distinct brand display face; self-hosting avoids layout shift and third-party requests |
| **Spring Boot + PostgreSQL** | Already built, 15 endpoint groups live; relational model fits listings/orders/roles |
| **JWT auth** | Stateless, already implemented server-side; works for web now and mobile later |

### Weak points & required fixes

1. **RTK Query vs. App Router server rendering (the big one).** RTK Query is client-side; if the public market pages (F1/F2) fetch through it, they ship as skeleton + spinner — bad for SEO and slow on rural connections, and SEO is the whole point of a public catalogue. **Fix:** split data fetching by surface. Public market pages fetch in **Server Components** (plain `fetch` with Next revalidation/ISR against Spring Boot); RTK Query owns everything behind auth (`(platform)` dashboard), where client-side caching/invalidation shines. Don't fight the framework by wrapping the whole app in a client-side store.
2. **JWT storage.** If `BootstrapAuth` restores tokens from `localStorage`, any XSS = account takeover. **Fix:** move the refresh token to an `httpOnly` cookie (Spring sets it), keep the short-lived access token in memory only; `BootstrapAuth` becomes "silent refresh on load." Also confirm token expiry/refresh interceptor exists in the RTK Query `baseQuery` — a 401 mid-session shouldn't dump users to login with lost form state.
3. **STOMP in V1.** `@stomp/stompjs` is in `package.json` but nothing in V1 needs real-time. **Fix:** keep the dependency, wire nothing. Don't build a WebSocket provider "for later" — it's dead code and a reconnection-bug surface.
4. **Framer Motion bundle weight.** Full `motion` import is ~30kb+ gzipped on every public page. **Fix:** use `LazyMotion` + `domAnimation` features, and keep animation out of the server-rendered market grid's critical path.
5. **No form layer specified.** Listing create/edit (F3) and register (F5) are non-trivial forms. **Fix (addition):** `react-hook-form` + `zod` — and reuse the zod schemas as API-boundary validation types.
6. **No testing story specified.** **Fix (addition):** Vitest + React Testing Library for units, Playwright for the three critical paths (browse→detail, create listing, login→dashboard). Also a dissertation asset.
7. **Backend contract risks.** Confirm Spring Boot exposes offset/limit **pagination + filtering** on the listings endpoint before building F1 (client-side filtering over a full table download won't survive real data); confirm CORS for the Vercel domains; and resolve the flagged `placeDonationOrder` argument-order bug **before** F4 wires order flows — a mis-persisted ID corrupts order data silently.
8. **Image handling.** Direct-to-Cloudinary signed uploads from the browser (Spring issues the signature); don't proxy multi-MB images through Spring Boot. Use `next/image` with the Cloudinary loader on market pages.

**Verdict:** stack approved with fix #1 and #2 treated as architectural requirements, not suggestions. No technology swaps needed.

---

## 8. Definition of Done

### F1 — Marketplace browse & search
- [ ] `/market` is server-rendered: listing content present in initial HTML (view-source test)
- [ ] Search + at least 4 filters (category, price, location, surplus) + 3 sorts, all reflected in URL query params (shareable/back-button-safe)
- [ ] Server-side pagination; 1,000+ seeded listings with no client-perceived degradation
- [ ] LCP < 2.5s on Fast 3G throttle; empty-state and zero-results states designed, not blank
- [ ] Usable without JavaScript enabled (progressive enhancement on filters acceptable)

### F2 — Listing detail
- [ ] `/market/[id]` server-rendered with OpenGraph meta (title, image, price) — link unfurls correctly in Slack/WhatsApp
- [ ] All listing fields displayed incl. surplus/donation flag and vendor card linking to vendor's other listings
- [ ] CTA renders correctly in all 3 states: unauthenticated, authenticated buyer, own-listing (edit shortcut)
- [ ] 404 and expired-listing states handled explicitly

### F3 — Shell + listing management
- [ ] `(platform)/layout.tsx` with Sidebar + TopBar; sidebar items driven by role config, verified for Farmer, Kitchen, Organisation, Admin
- [ ] Full listing CRUD against Spring Boot; create form validates with zod, supports ≥3 images via Cloudinary, saves in < 3 min end-to-end (timed test with a non-developer)
- [ ] Status transitions (draft/active/sold-out/expired) update the public market view within one ISR revalidation window
- [ ] My Listings table: filter by status, sort by date, optimistic delete with undo or confirm

### F4 — Orders & activity
- [ ] Orders table with status filter; order detail supports full transition chain with invalid transitions blocked in UI and by API
- [ ] Status changes invalidate RTK Query cache — no manual refresh anywhere
- [ ] Dashboard stats endpoint-driven (no client-side aggregation) and correct against seeded fixture data
- [ ] `placeDonationOrder` bug confirmed fixed with a regression test before this feature is called done

### F5 — Authorization
- [ ] Register with role selection creates correct role server-side; login routes each role to the correct landing page (`routeAfterLogin` slash bug covered by a test)
- [ ] Zero remaining `FOODBANK` references in the frontend codebase (`grep` gate in CI)
- [ ] Middleware blocks every `(platform)` route by role — verified by an automated matrix test (role × route)
- [ ] Refresh token in httpOnly cookie; access token never in `localStorage`; session survives hard refresh and expires cleanly
- [ ] All auth forms: inline validation, server-error surfacing, loading states, password visibility toggle

### Cross-cutting
- [ ] Playwright green on: browse→detail→CTA, login→create listing→see it on `/market`, order status transition
- [ ] Responsive 360px–1440px; keyboard-navigable forms; WCAG AA contrast on Tailwind theme tokens
- [ ] Deployed on Vercel `dev` branch preview; env-driven API base URL (no hardcoded localhost)

---

## 9. File & Folder Structure

```
farmnomad-web/
├── app/
│   ├── layout.tsx                     # Root: fonts (Clash Grotesk via next/font/local), Providers
│   ├── page.tsx                       # Landing → redirects/links to /market
│   ├── globals.css                    # Tailwind v4 entry + theme tokens
│   │
│   ├── market/                        # PUBLIC — Server Components, fetch + ISR (no RTK Query)
│   │   ├── layout.tsx                 # Public market layout (header, footer)
│   │   ├── page.tsx                   # F1: browse — searchParams-driven filters/sort/pagination
│   │   ├── loading.tsx               # Grid skeleton
│   │   └── [listingId]/
│   │       ├── page.tsx               # F2: detail — generateMetadata for OG tags
│   │       └── not-found.tsx
│   │
│   ├── (auth)/                        # F5 — public, minimal layout
│   │   ├── layout.tsx                 # Centered card layout
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx          # Role selection: Farmer / Kitchen / Organisation
│   │   └── forgot-password/page.tsx   # Stub
│   │
│   ├── (platform)/                    # AUTH — client-heavy, RTK Query domain
│   │   ├── layout.tsx                 # F3: shell — Sidebar + TopBar + BootstrapAuth
│   │   ├── dashboard/page.tsx         # F4: stats home (role-aware)
│   │   ├── listings/
│   │   │   ├── page.tsx               # F3: My Listings table
│   │   │   ├── new/page.tsx           # F3: create form
│   │   │   └── [listingId]/edit/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx               # F4: orders table
│   │   │   └── [orderId]/page.tsx     # F4: detail + status transitions
│   │   └── admin/
│   │       ├── users/page.tsx         # Admin: user oversight
│   │       └── listings/page.tsx      # Admin: moderation
│   │
│   └── api/                           # (Only if needed for cookie handling — else none; Spring owns the API)
│
├── middleware.ts                      # F5: role-based route guard for (platform)
│
├── components/
│   ├── ui/                            # Button, Input, Select, Badge, Card, Table, Modal, Skeleton, Toast
│   ├── market/                        # ListingCard, ListingGrid, FilterBar, SearchInput, SortSelect,
│   │                                  # Pagination, SurplusBadge, VendorCard, ImageGallery
│   ├── dashboard/                     # Sidebar, TopBar, StatCard, ListingsTable, ListingForm,
│   │                                  # ImageUploader, OrdersTable, OrderStatusStepper, EmptyState
│   ├── auth/                          # LoginForm, RegisterForm, RoleSelector, AuthGuard, BootstrapAuth
│   └── motion/                        # LazyMotionProvider, FadeIn, StaggerList (Framer Motion wrappers)
│
├── lib/
│   ├── store/
│   │   ├── index.ts                   # configureStore + listeners
│   │   ├── baseApi.ts                 # createApi: baseQuery w/ auth header + 401 reauth interceptor
│   │   ├── authApi.ts                 # injectEndpoints: login, register, refresh, me
│   │   ├── listingsApi.ts             # injectEndpoints: my listings CRUD, image signature
│   │   ├── ordersApi.ts               # injectEndpoints: orders, transitions, dashboard stats
│   │   └── authSlice.ts               # user, role, access token (memory only)
│   ├── server/
│   │   └── market.ts                  # Server-side fetchers for /market (fetch + revalidate)
│   ├── schemas/                       # zod: listing, register, login, order (shared with react-hook-form)
│   ├── constants/roles.ts             # Role enum + sidebar nav config per role (single source of truth)
│   └── utils/                         # formatters (currency, date, distance), cn()
│
├── fonts/                             # ClashGrotesk-*.woff2
├── types/                             # api.ts (DTOs mirroring Spring), listing.ts, order.ts, user.ts
├── tests/
│   ├── e2e/                           # Playwright: market.spec, listing-crud.spec, auth.spec
│   └── unit/
└── .env.example                       # NEXT_PUBLIC_API_URL, CLOUDINARY_*
```

**Structural rules:** `market/` never imports from `lib/store/` (server/client fetch split is enforced by convention and an ESLint boundary rule); all role logic reads from `lib/constants/roles.ts`; every RTK Query domain is an `injectEndpoints` module against one `baseApi` so cache invalidation tags work across listings ↔ orders.
