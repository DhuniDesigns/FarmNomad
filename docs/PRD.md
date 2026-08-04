# FarmNomad — Product Requirements Document

**Status:** Handoff baseline · **Scope:** Full platform, with the web app as the active MVP build
**Labelling:** Items marked **[Confirmed]** come from founder decisions or existing code. Items marked **[Recommended]** are proposals a coding agent may implement but the founder has not explicitly signed off. Unknowns live in `docs/DECISIONS.md`.

---

## 1. Product

**FarmNomad** — a UK AgriTech platform unifying an agricultural marketplace, surplus food redistribution, and delivery coordination in one system, with AI-powered farm tooling. **[Confirmed]**

Sub-brand: **NomadEat**, prepared meals for students. **[Confirmed — future scope]**

Dual mandate: commercial startup and MSc Software Engineering dissertation (University of Bolton). Architectural choices must remain academically defensible with documented scaling paths. **[Confirmed]**

## 2. Goals

- Ship a usable web MVP: public marketplace pages, Farmer dashboard, and role-based authorization. **[Confirmed — current focus]**
- Let farmers convert surplus into sales or donations before spoilage, in one workflow. **[Confirmed — core thesis]**
- Give verified organisations reliable access to surplus food. **[Confirmed]**
- Support a defensible dissertation narrative: every simplification documented with its scaling path. **[Confirmed]**

## 3. Non-goals (for the MVP)

All **[Confirmed]** as out of MVP scope:

- Payment processing (Stripe integrates post-MVP; MVP orders are commitments, not transactions)
- Mobile app (Customer/Driver surfaces) — planned next, not MVP
- NomadEat vertical
- AI features in production (crop scanner, weather advisor, matching, surplus prediction — parallel stream, not an MVP gate)
- Driver dispatch/routing flows
- Equipment rental/purchase marketplace
- Expanded tiered organisation verification against UK government APIs

## 4. Target users and personas

Roles are **[Confirmed]**; persona narratives are **[Recommended]** fleshing-out of confirmed role definitions.

**Farmer (web, Vendor umbrella).** Small-to-mid UK farm operator. Has perishable surplus and no time for multiple tools. Needs fast listing creation, a clear view of orders, and a low-friction donation path. Often on poor rural connectivity — pages must be light and fast.

**Kitchen (web, Vendor umbrella).** Food vendor/prepared-food business. Lists goods and meals; same dashboard needs as Farmer with meal-oriented inventory.

**Organisation (web).** Food bank, school, religious or student organisation. Needs to browse/receive surplus donations dependably. Must pass verification before receiving (verification depth for MVP: see DECISIONS).

**Customer (mobile, post-MVP).** Price-conscious buyer of fresh local food; browses marketplace, orders produce/meals.

**Driver (mobile, post-MVP).** Independent driver fulfilling marketplace and donation deliveries.

**Admin (web).** Platform operator: verifies organisations, moderates listings, manages users.

## 5. User stories

### F1 — Public market pages **[Confirmed feature; stories Recommended]**
- As a visitor, I want to browse produce/goods listings without an account so that I can see value before signing up.
- As a buyer, I want to search and filter listings (category, price, location) so that I find relevant produce quickly.
- As a buyer, I want a listing detail page with photos, price, quantity, and vendor info so that I can decide to order.

### F2 — Farmer dashboard **[Confirmed feature; stories Recommended]**
- As a Farmer, I want to create, edit, and archive listings so that my available produce is always accurate.
- As a Farmer, I want to see incoming orders with status so that I can plan fulfilment.
- As a Farmer, I want to mark surplus for donation so that unsold produce reaches organisations instead of spoiling.
- As a Farmer, I want an activity overview so that I can see sales and donations at a glance.

### F3 — Authorization **[Confirmed feature; stories Recommended]**
- As a new user, I want to register with a role so that I get the right experience for who I am.
- As a returning user, I want to log in and land on my role's home so that I don't navigate manually. (Role-based `routeAfterLogin` exists; has a known leading-slash bug — see DECISIONS.)
- As any user, I want my session restored on refresh so that I stay logged in securely.

### F4 — Donations (backend exists) **[Confirmed capability]**
- As an Organisation, I want to receive/claim donated surplus so that my beneficiaries are supplied.
- As an Admin, I want to verify organisations so that donations reach legitimate recipients.

### Post-MVP streams **[Confirmed direction]**
- As a Farmer, I want to photograph a crop and get a disease diagnosis (AI scanner).
- As a Farmer, I want weather-aware planting advice.
- As a Customer (mobile), I want a five-tab app (Home, Market, Tools, Give, Me) to buy food and track orders.
- As a Driver (mobile), I want to accept and complete delivery jobs.

## 6. Functional requirements

**[Confirmed]** unless noted:

1. Role-based access control across six roles: FARMER, KITCHEN, ORGANISATION, CUSTOMER, DRIVER, ADMIN. Web serves Vendors, Organisations, Admins; mobile serves Customers, Drivers.
2. JWT authentication (backend exists). Web token handling to be revamped: refresh token in httpOnly cookie, access token in memory. **[Confirmed decision]**
3. Public, SEO-indexable market browse/search/detail pages rendered server-side (Server Components + ISR). **[Confirmed decision]**
4. Listing CRUD for Vendors (create, edit, archive; photos via Cloudinary).
5. Order creation and status tracking (MVP: commitment-based, no payment capture).
6. Donation flow: surplus flagged by Vendor, received by verified Organisation. (Existing `placeDonationOrder` has a suspected argument-order bug persisting incorrect IDs — must be fixed and regression-tested in Phase 0.)
7. Real-time messaging and notifications via WebSocket/STOMP (backend entities exist; web UI pending).
8. Admin verification and moderation capabilities (backend endpoints exist; web UI scope for MVP: minimum required to verify organisations — **[Recommended]**).
9. Form validation with react-hook-form + zod on all web forms. **[Confirmed decision]**

## 7. Non-functional requirements

- **Performance [Recommended]:** public market pages usable on poor rural connections; target LCP < 2.5s on Fast 3G, minimal client JS on public pages (a core reason for the Server Components decision **[Confirmed]**).
- **Security [Confirmed]:** no wildcard CORS (already fixed); no secrets in code (rotation flagged); JWTs not in localStorage; role checks enforced server-side, never UI-only.
- **Accessibility [Confirmed expectation, details Recommended]:** WCAG 2.1 AA; see `docs/DESIGN-SYSTEM.md`.
- **Maintainability [Confirmed]:** Conventional Commits, `dev`/`main` branching, documented decisions.
- **Portability [Confirmed]:** fully self-sufficient local dev (Docker Postgres on 5433, `application-local.properties`, app on 9000).

## 8. Success metrics **[Recommended — founder has not set numeric targets]**

- MVP launch: a Farmer can register → list produce → receive an order → mark surplus donated, end-to-end without dev intervention.
- ≥ 1 verified organisation successfully receiving donations in pilot.
- Public market pages indexed by search engines; LCP budget met.
- Zero P0 security findings (secrets, CORS, token storage) at launch review.
- Dissertation: each architecture decision has a written rationale and scaling path.

## 9. MVP scope (build order) **[Confirmed]**

1. Market browse page (public, server-rendered)
2. Listing detail page (public, server-rendered)
3. Platform shell — `(platform)` layout with role-aware Sidebar and TopBar — plus listing CRUD
4. Orders dashboard (Farmer)
5. Auth revamp last (existing auth already works functionally; upgrade token storage, fix `routeAfterLogin`, complete FOODBANK→ORGANISATION rename in web code)

Backend Phase 0 precedes web work where blocking: fix `placeDonationOrder` bug, rotate flagged secrets. See `docs/IMPLEMENTATION-PLAN.md`.

## 10. Future scope **[Confirmed direction]**

- Mobile app (React Native/Expo), five-tab nav: Home, Market, Tools, Give, Me
- AI service rollout in order: crop disease scanner → weather & planting advisor → smart matching → surplus prediction (cold-start acknowledged; synthetic data v1)
- NomadEat prepared-meals vertical
- Equipment rental/purchase marketplace
- Tiered organisation verification against UK government APIs (schools, religious organisations, student groups)
- Stripe payments; Celery/Redis inference queue when AI load requires it

## 11. Acceptance criteria

**Market pages** — a signed-out visitor can browse a paginated grid of active listings, filter/search, open a detail page with photos/price/quantity/vendor, and all of this renders server-side (view-source shows content). Empty and error states designed (see USER-FLOWS).

**Farmer dashboard** — an authenticated Farmer can create a listing with photos, edit it, archive it, view orders with statuses, and mark surplus for donation. Non-Vendor roles cannot reach vendor routes (server-enforced).

**Authorization** — register with role selection; login routes each role to the correct home (leading-slash bug fixed); refresh restores session without localStorage-held JWTs; no `FOODBANK` string remains in the web codebase.

**Backend fixes** — `placeDonationOrder` persists correct IDs, proven by a regression test that failed before the fix; flagged secrets rotated.

**Quality gates** — Playwright covers each flow above (happy + one error path); `npm run build` and backend tests green; WCAG AA checks pass on new pages.
