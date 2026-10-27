# FarmNomad

> **Note on this repository:** This folder began as the development handoff documentation for FarmNomad and now includes a first-pass monorepo scaffold for `backend/`, `web/`, `mobile/`, and `ai-service/`. Where the documentation describes earlier existing repositories, it is reconstructed from project records; reconcile against the actual repositories before treating those contracts as final. See `docs/DECISIONS.md` -> "Unresolved questions".

## Product overview

FarmNomad is a UK AgriTech platform that unifies four functions that today require separate tools:

1. **Agricultural marketplace** — farmers and food vendors list produce and goods; organisations and customers browse and buy.
2. **Surplus food redistribution** — surplus produce is donated to verified organisations (food banks, schools, religious and student organisations).
3. **Logistics coordination** — independent drivers fulfil marketplace and donation deliveries.
4. **Farm tooling** — AI-assisted crop disease scanning, weather/planting guidance, and an equipment rental/purchase marketplace (future scope).

A sub-brand, **NomadEat**, is a prepared-meals vertical targeting students (future scope).

FarmNomad's competitive positioning (confirmed): it is the only platform combining marketplace, surplus redistribution, and logistics coordination simultaneously, rather than as point solutions.

The project is simultaneously a commercial product and an MSc Software Engineering dissertation (University of Bolton). Architecture decisions are therefore documented with explicit rationale and planned scaling paths — preserve this discipline (see `docs/DECISIONS.md`).

## Problem being solved

- UK farmers and food vendors lack a single channel to sell produce, redistribute surplus before it spoils, and arrange delivery — they juggle marketplaces, charity phone trees, and ad-hoc couriers.
- Charitable organisations have unreliable, unstructured access to surplus food supply.
- Customers wanting fresh local food have no unified marketplace connected to actual farm inventory.
- Existing point solutions do not connect these actors, so surplus goes to waste while demand goes unmet.

## Target users

Six roles across two surfaces:

| Role | Surface | Summary |
|---|---|---|
| Farmer | Web | Lists produce, manages orders/donations, uses farm tools. Grouped under the **Vendor** umbrella. |
| Kitchen | Web | Food vendor / prepared-food seller. Also under the **Vendor** umbrella. |
| Organisation | Web | Food banks, schools, religious/student organisations receiving surplus. Requires verification. |
| Admin | Web | Platform operations, verification, moderation. |
| Customer | Mobile | Browses and buys produce and meals. |
| Driver | Mobile | Accepts and fulfils deliveries. |

## Main features

**Existing (built, in varying states of completeness):**

- Spring Boot backend with JWT auth, role model (FARMER, KITCHEN, ORGANISATION, CUSTOMER, DRIVER, ADMIN), and CRUD for Organisation, Meal, Equipment, Notification, Message, CropScanResult, and Subscription entities, plus pre-existing marketplace/donation/order functionality. 15 endpoint groups documented in a Postman collection.
- Next.js web app with working auth flow (RTK Query, role-based routing, token restoration) and a Farmer dashboard.

**Current MVP focus (web):** public market/product pages (browse, search, listing detail), Farmer dashboard (listing CRUD, orders, activity), and revamped authorization pages (login, register, role-based access).

**Planned:** mobile app (five-tab navigation: Home, Market, Tools, Give, Me), AI service (crop disease scanner → weather & planting advisor → smart matching → surplus prediction), NomadEat, equipment marketplace, tiered organisation verification against UK government APIs.

## Technology stack (approved)

| Layer | Choice |
|---|---|
| Backend | Spring Boot (Java), PostgreSQL, JWT auth, Spring Events |
| Web frontend | Next.js (App Router), TypeScript, Tailwind CSS v4, RTK Query (authenticated areas only), Server Components + `fetch`/ISR (public market pages), Framer Motion, `@stomp/stompjs`, react-hook-form + zod |
| Mobile | React Native / Expo |
| AI service | Python, FastAPI, EfficientNet-B0 (transfer learning) |
| Infra / services | Vercel (web), Docker (local Postgres), Stripe (post-MVP), Cloudinary (media), WebSockets/STOMP (real-time) |
| Testing | Vitest (unit), Playwright (e2e) — web |

Justifications and trade-offs: `docs/ARCHITECTURE.md` and `docs/DECISIONS.md`.

## Setup instructions

> Reconstructed from known local-dev configuration; verify against each repository's own README.

### Backend (Spring Boot)

1. Start PostgreSQL via Docker, mapped to host port **5433** (native Windows Postgres services often occupy 5432 — do not assume container isolation):
   ```bash
   docker run -d --name farmnomad-db -p 5433:5432 \
     -e POSTGRES_DB=farmnomad_db -e POSTGRES_USER=farmnomad_user \
     -e POSTGRES_PASSWORD=<local password> postgres:16
   ```
2. Local configuration lives in `application-local.properties` (self-sufficient local dev). Run with the `local` profile:
   ```bash
   ./mvnw spring-boot:run -Dspring-boot.run.profiles=local
   ```
3. App serves on port **9000**.
4. **Gotchas (confirmed from project history):**
   - Spring env-var precedence beats profile property files even when the exported value is empty — unset stale shell variables before debugging config.
   - CRLF line endings in `.env` files corrupt credential values on Windows (appends `\r`). Use LF.
   - Secrets were previously hardcoded and flagged for rotation — never commit secrets; rotate anything found in history.
5. Import the Postman collection (15 endpoint groups, JWT auto-capture, environment variables) for API exploration.

### Web (Next.js)

```bash
npm install
npm run dev:web
```

Or from inside `web/`, run `npm install` and `npm run dev`.

The scaffold includes `framer-motion`, `@stomp/stompjs`, react-hook-form, zod, RTK Query, Vitest, and Playwright in `web/package.json`. Clash Grotesk is declared in CSS as the intended font family, but the actual local font files still need to be added before wiring `next/font/local`. Deploys to Vercel; `dev`/`main` branch strategy.

### AI service (FastAPI)

Repo name `farmnomad-ai`. Python + FastAPI; synchronous inference (no Celery/Redis in v1). Training runs on Google Colab / Kaggle T4 if no local GPU (unconfirmed — see `docs/DECISIONS.md`).

Current local scaffold:

```bash
cd ai-service
python -m venv .venv
.\.venv\Scripts\activate
pip install -e ".[test]"
uvicorn app.main:app --reload --port 8010
```

## Documentation map

| File | Contents |
|---|---|
| `docs/PRD.md` | Requirements, personas, user stories, MVP scope, acceptance criteria |
| `docs/ARCHITECTURE.md` | System architecture, folder structures, auth, trade-offs |
| `docs/USER-FLOWS.md` | Major journeys with empty/error/success states |
| `docs/DESIGN-SYSTEM.md` | Visual direction, tokens, components, accessibility |
| `docs/DATABASE-SCHEMA.md` | Tables, relationships, constraints, RLS recommendations |
| `docs/API-SPEC.md` | Endpoints, validation, errors |
| `docs/IMPLEMENTATION-PLAN.md` | Phased MVP plan with tasks and dependencies |
| `docs/DECISIONS.md` | Decision log, assumptions, open questions, risks |
| `AGENTS.md` | Rules for coding agents working on this project |

## Credits

Designed and built by **Hafsoh Bashar** ([@DhuniDesigns](https://github.com/DhuniDesigns)).
