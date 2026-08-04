# FarmNomad — Architecture

**Labelling:** **[Confirmed]** = decided by the founder or existing in code. **[Recommended]** = proposed baseline for agents; adopt unless the founder or existing code says otherwise. Existing repositories are the source of truth for existing code — this document reconstructs their state from project records.

---

## 1. System overview

Four services/apps **[Confirmed]**:

```
                 ┌───────────────────────────────┐
                 │        Web (Next.js)          │  Vendors, Organisations, Admins
                 │  Vercel · SSR/ISR + RTK Query │
                 └──────────────┬────────────────┘
                                │ REST + WebSocket/STOMP
┌────────────────┐   ┌──────────▼────────────────┐   ┌──────────────────────┐
│ Mobile (Expo)  │──▶│   Backend (Spring Boot)   │──▶│  PostgreSQL (Docker  │
│ Customers,     │   │   port 9000 · JWT · REST  │   │  local: 5433)        │
│ Drivers        │   │   Spring Events           │   └──────────────────────┘
└────────────────┘   └──────────┬────────────────┘
                                │ REST (service-to-service)
                     ┌──────────▼────────────────┐      ┌────────────────┐
                     │  AI service (FastAPI)     │      │ Cloudinary     │ media
                     │  farmnomad-ai · sync      │      │ Stripe (post-  │
                     │  inference, EfficientNet  │      │ MVP) payments  │
                     └───────────────────────────┘      └────────────────┘
```

The Spring Boot backend is the single system of record and sole owner of the PostgreSQL database. The AI service is stateless at v1 (results persisted via the backend's `CropScanResult` entity) **[Recommended interpretation — verify against backend code]**.

## 2. Backend (Spring Boot) **[Confirmed core, structure Recommended]**

**Confirmed facts:** package root `com.farmnomad` (fully renamed from `com.agriroute`); runs on port 9000; PostgreSQL via Docker on host 5433 (`farmnomad_db` / `farmnomad_user`); `application-local.properties` for self-sufficient local dev; JWT auth; SecurityConfig wildcard removed; domain events use Spring Events (replaced a hand-rolled Observer); entities include Organisation, Meal, Equipment, Notification, Message, CropScanResult, Subscription with full CRUD, plus pre-existing user/listing/order/donation domain; 15 endpoint groups (Postman collection exists with JWT auto-capture).

**Recommended layout** (feature-oriented; reconcile with the actual repo):

```
farmnomad-backend/
├─ src/main/java/com/farmnomad/
│  ├─ config/            # SecurityConfig, CORS, WebSocket/STOMP config
│  ├─ auth/              # JWT issue/refresh, login/register controllers
│  ├─ user/              # User entity, roles (FARMER, KITCHEN, ORGANISATION, CUSTOMER, DRIVER, ADMIN)
│  ├─ listing/           # Marketplace listings
│  ├─ order/             # Orders (commitment-based at MVP)
│  ├─ donation/          # Surplus donations (contains placeDonationOrder — known bug, see DECISIONS)
│  ├─ organisation/      # Organisation profile + verification
│  ├─ meal/              # Meals (Kitchen / NomadEat groundwork)
│  ├─ equipment/         # Equipment (future marketplace groundwork)
│  ├─ notification/      # Notifications
│  ├─ message/           # Messaging (STOMP)
│  ├─ cropscan/          # CropScanResult persistence for AI service
│  ├─ subscription/      # Subscriptions
│  └─ common/            # Shared DTOs, exceptions, event definitions (Spring Events)
├─ src/main/resources/
│  ├─ application.properties
│  └─ application-local.properties   # local profile (not committed if it holds secrets)
└─ src/test/java/com/farmnomad/      # JUnit; regression tests required for bug fixes
```

**Patterns:** controller → service → repository; DTOs at the boundary (no entity leakage); domain events via Spring `ApplicationEventPublisher` **[Confirmed pattern]** (e.g. OrderPlaced → notification listener).

## 3. Web frontend (Next.js) **[Confirmed core decisions]**

**Confirmed decisions:**
- **Split data strategy:** public market pages (`/market`, listing detail) are **Server Components using plain `fetch` + ISR** — for SEO and speed on rural connections. **RTK Query is used only behind auth** (dashboard, orders, messaging).
- **Token handling:** refresh token in an **httpOnly cookie**, access token **in memory**. Never localStorage.
- react-hook-form + zod for forms; Framer Motion; `@stomp/stompjs` for realtime; Tailwind v4; Clash Grotesk via `next/font/local`.
- Existing code has: working auth flow with RTK Query, role-based routing, `BootstrapAuth` token restoration, a Farmer dashboard. Pending known work: FOODBANK→ORGANISATION rename, functional Sidebar, `(platform)` layout shell, missing packages (`framer-motion`, `@stomp/stompjs`), font wiring, `routeAfterLogin` leading-slash fix.

**Recommended structure** (App Router; reconcile with actual repo):

```
farmnomad-web/
├─ src/
│  ├─ app/
│  │  ├─ (public)/
│  │  │  ├─ page.tsx                 # landing
│  │  │  ├─ market/page.tsx          # Server Component + ISR
│  │  │  └─ market/[id]/page.tsx     # listing detail, Server Component + ISR
│  │  ├─ (auth)/
│  │  │  ├─ login/page.tsx
│  │  │  └─ register/page.tsx
│  │  ├─ (platform)/                 # authenticated shell — TO BUILD
│  │  │  ├─ layout.tsx               # Sidebar + TopBar, role-aware
│  │  │  ├─ dashboard/page.tsx       # Farmer/Kitchen dashboard
│  │  │  ├─ listings/…               # listing CRUD
│  │  │  ├─ orders/…
│  │  │  ├─ donations/…
│  │  │  ├─ messages/…               # STOMP-driven
│  │  │  ├─ organisation/…           # organisation home / application flow
│  │  │  └─ admin/…                  # verification queue, moderation
│  │  └─ layout.tsx                  # fonts (Clash Grotesk), providers
│  ├─ components/
│  │  ├─ ui/                         # design-system primitives (see DESIGN-SYSTEM.md)
│  │  └─ features/                   # composed feature components
│  ├─ store/
│  │  ├─ index.ts                    # Redux store
│  │  └─ api/                        # RTK Query slices: authApi, listingsApi, ordersApi, …
│  ├─ lib/                           # fetch helpers (server), auth bootstrap, stomp client
│  ├─ schemas/                       # zod schemas (shared client/server-action validation)
│  └─ types/                         # Role enum, DTO types mirroring backend
├─ e2e/                              # Playwright
└─ src/**/__tests__/                 # Vitest
```

**State management [Confirmed direction]:** server state via RTK Query (auth'd) / RSC fetch (public); minimal client state (UI state in components, auth session in Redux slice). No additional state libraries.

## 4. Mobile (React Native / Expo) **[Confirmed direction, structure Recommended]**

Five-tab navigation **[Confirmed]**: Home, Market, Tools, Give, Me. Serves Customers and Drivers. Reuse the backend REST API and zod-mirrored types. Structure and stack details (Expo Router, state) to be decided when the stream starts — record in DECISIONS when chosen.

## 5. AI service (Python / FastAPI) **[Confirmed decisions]**

- Repo `farmnomad-ai`, FastAPI skeleton + Colab-ready `train.py` (next step in that stream).
- Crop disease scanner: **EfficientNet-B0 with ImageNet pretrained weights (transfer learning, not from scratch)**; dataset `abdallahalidev/plantvillage-dataset` (full 38-class); **PlantDoc used for evaluation** to quantify the lab-vs-field domain gap; augmentation as mitigation.
- **Synchronous inference in v1 — Celery/Redis deliberately dropped**, documented as the scaling path.
- Build order: scanner → weather & planting advisor (API + rule-based) → smart matching (rule-based scoring) → surplus prediction (cold-start acknowledged; synthetic data v1).
- Open: GPU availability (local NVIDIA vs Colab/Kaggle T4) — determines training scaffold (see DECISIONS).

## 6. Authentication **[Confirmed]**

- Backend issues JWT access + refresh tokens; role claims drive authorization. Server-side role enforcement on every protected endpoint — UI hiding is never sufficient.
- Web: refresh token in httpOnly, Secure, SameSite cookie; access token in memory; `BootstrapAuth`-style silent restore on load; single-flight refresh **[Recommended]**.
- Roles: FARMER, KITCHEN, ORGANISATION, CUSTOMER, DRIVER, ADMIN. FOODBANK is a dead legacy name.
- Secrets: previously hardcoded values are flagged for rotation; secrets come from environment/profile files excluded from VCS. Watch the two known local-dev traps: env-var precedence over profile files, and CRLF corruption of `.env` values on Windows.

## 7. Database approach **[Confirmed core]**

Single PostgreSQL instance owned by Spring Boot (JPA/Hibernate). Local dev via Docker on host port 5433 (native Windows Postgres often holds 5432). Schema detail: `docs/DATABASE-SCHEMA.md`. Migrations: **[Recommended]** adopt Flyway if not already present — schema history is currently unrecorded in project docs (see DECISIONS).

## 8. API structure

REST, JSON, JWT bearer auth; 15 existing endpoint groups; STOMP over WebSocket for messaging/notifications. Contract detail: `docs/API-SPEC.md`. The Postman collection is the most accurate current contract record — reconcile the spec against it.

## 9. File storage **[Confirmed]**

Cloudinary for media (listing photos, crop scan images). **[Recommended]** upload via signed uploads from the client with backend-issued signatures; store only the Cloudinary public ID + metadata in Postgres.

## 10. Deployment architecture

- **Web:** Vercel; `dev` → preview, `main` → production **[Confirmed]**.
- **Backend & AI service:** production hosting **not yet decided** (see DECISIONS). Local: Docker Postgres + local Spring Boot. **[Recommended]** containerise both services for parity.
- **Database (prod):** managed Postgres **[Recommended]**; not yet chosen.

## 11. Important technical trade-offs (with rationale)

| Decision | Trade-off accepted | Why | Scaling path |
|---|---|---|---|
| Server Components + ISR for public market; RTK Query only behind auth **[Confirmed]** | Two data-fetching styles in one app | SEO + performance on rural connections outweigh uniformity | Move more surfaces to RSC over time |
| JWT refresh in httpOnly cookie, access in memory **[Confirmed]** | More complex than localStorage | Eliminates XSS token theft | — |
| Synchronous AI inference, no Celery/Redis **[Confirmed]** | Blocks a request during inference | v1 load doesn't justify a queue; academically documented | Introduce queue + workers when load demands |
| Spring Events over hand-rolled Observer **[Confirmed]** | Framework coupling | Less code, transactional event support | Externalise to a broker if services split |
| EfficientNet-B0 transfer learning **[Confirmed]** | Ceiling below larger models | Trainable on free GPUs, strong accuracy/size ratio | Larger EfficientNet variants later |
| Orders as commitments, no payments in MVP **[Confirmed]** | No revenue capture at MVP | Cuts PCI/Stripe scope from the critical path | Stripe post-MVP |
| Monolithic backend owning all domains **[Confirmed by current shape]** | Eventually large | Right for team size and dissertation timeline | Feature packages make later extraction feasible |
