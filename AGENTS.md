# AGENTS.md — Instructions for coding agents (Codex and others)

These rules govern any AI coding agent working on FarmNomad. Read this file fully before making any change.

## 1. Required reading before any change

Read, in order, before writing code:

1. `README.md` — product context and stack
2. `docs/DECISIONS.md` — decisions already made; do not re-litigate them
3. `docs/ARCHITECTURE.md` — where code goes and why
4. The doc for your work area: `docs/PRD.md` (scope), `docs/API-SPEC.md` (backend), `docs/DATABASE-SCHEMA.md` (data), `docs/DESIGN-SYSTEM.md` + `docs/USER-FLOWS.md` (frontend)
5. `docs/IMPLEMENTATION-PLAN.md` — confirm your task's phase and dependencies

**Critical:** the existing backend and web repositories are the source of truth for existing code. This documentation reconstructs their state from project records and may lag reality. When docs and code disagree, inspect the code, then update the doc — do not silently follow either.

## 2. Approved technology stack

Do not introduce alternatives to the following without an entry in `docs/DECISIONS.md` approved by the founder:

- **Backend:** Spring Boot (Java), PostgreSQL, JWT auth, Spring Events (not hand-rolled Observer), Maven
- **Web:** Next.js App Router, TypeScript (strict), Tailwind CSS v4, RTK Query (authenticated areas only), Server Components + fetch/ISR (public market pages), Framer Motion, `@stomp/stompjs`, react-hook-form + zod, Clash Grotesk via `next/font/local`
- **Mobile:** React Native / Expo
- **AI service:** Python, FastAPI, EfficientNet-B0 transfer learning; synchronous inference (no Celery/Redis in v1 — this is a documented dissertation decision)
- **Services:** Vercel, Docker, Cloudinary, Stripe (post-MVP only), WebSockets/STOMP
- **Testing (web):** Vitest, Playwright

Explicitly rejected (see `docs/DECISIONS.md`): Celery/Redis in AI v1, training CNNs from scratch, JWTs in `localStorage`, RTK Query for public market pages.

## 3. Project conventions

### Git
- Branches: `dev` (integration) and `main` (production/Vercel). Feature work branches off `dev`.
- Branch naming: scoped prefixes — `feat/`, `fix/`, `chore/`, `refactor/`, `docs/`, `test/` (e.g. `feat/market-browse-page`).
- Commits: **Conventional Commits** (`feat(market): add listing grid`, `fix(auth): leading slash in routeAfterLogin`).
- Never commit secrets. Secrets have leaked into this codebase before and were flagged for rotation — treat any credential in code or history as compromised.

### Naming
- **Roles are exactly:** `FARMER`, `KITCHEN`, `ORGANISATION`, `CUSTOMER`, `DRIVER`, `ADMIN`. The legacy role `FOODBANK` was renamed to `ORGANISATION`; if you find `FOODBANK` anywhere, that is a bug — rename it (British spelling: ORGANISATION, not ORGANIZATION).
- The product/brand is **FarmNomad** (one word, capital F and N). The legacy name `AgroRoute`/`agriroute` was fully replaced; backend package root is `com.farmnomad`. Any surviving `agriroute` reference is a bug.
- Java: standard Spring conventions — `PascalCase` classes, `camelCase` methods, packages by feature under `com.farmnomad`.
- TypeScript: `PascalCase` components, `camelCase` functions/variables, kebab-case route segments, RTK Query slices as `<domain>Api`.
- Database: `snake_case` tables and columns, plural table names.

### Code placement
Follow the folder structures in `docs/ARCHITECTURE.md`. Do not create new top-level folders without a `docs/DECISIONS.md` entry.

## 4. Testing expectations

- Web: unit tests (Vitest) for utilities, hooks, and validation schemas; Playwright e2e for each completed user flow (happy path + one error path minimum). New pages ship with tests.
- Backend: JUnit tests for services and controllers; any bug fix (e.g. the `placeDonationOrder` argument-order bug) must land with a regression test that fails before the fix.
- Do not mark a task done with failing tests. Do not delete or skip tests to make a build pass.

## 5. Accessibility expectations

- WCAG 2.1 AA is the bar for the web app (see `docs/DESIGN-SYSTEM.md`).
- Semantic HTML first; ARIA only where semantics are insufficient.
- All interactive elements keyboard-reachable with visible focus states; forms have labelled inputs and inline, screen-reader-announced errors; images have alt text; colour contrast ≥ 4.5:1 for body text.

## 6. Commands

> Verify against each repo's package manifest — reconstructed from project records.

| Context | Command |
|---|---|
| Backend run (local profile) | `./mvnw spring-boot:run -Dspring-boot.run.profiles=local` |
| Backend tests | `./mvnw test` |
| Local database | Docker Postgres on host port `5433`, db `farmnomad_db`, user `farmnomad_user` |
| Web dev server | `npm run dev` |
| Web lint / build | `npm run lint` / `npm run build` |
| Web unit tests | `npx vitest` |
| Web e2e | `npx playwright test` |

Backend serves on port **9000**. Do not change ports; local tooling (Postman environment, frontend API base URL) depends on them.

## 7. Rules against scope creep and unnecessary change

1. **Do only the task you were given.** If you notice adjacent problems, record them in `docs/DECISIONS.md` under "Unresolved questions" or open a TODO — do not fix them in the same change unless they block your task.
2. **No drive-by refactors.** Do not reformat files, reorder imports, rename symbols, or "clean up" code outside the lines your task touches.
3. **No new dependencies** without a `docs/DECISIONS.md` entry stating the problem, the package, and rejected alternatives.
4. **No invented requirements.** If the docs don't specify a behaviour, do not guess business logic — flag it as an open question. Confirmed requirements vs recommendations are explicitly labelled throughout `docs/`; treat unlabelled gaps as unknowns.
5. **Respect dissertation framing.** Simplifications (synchronous inference, synthetic data, Spring Events) are deliberate, documented decisions with planned scaling paths. Do not "upgrade" them.
6. **Small diffs.** Prefer several reviewable commits over one large one. Each commit should build and pass tests.
7. **Update docs with code.** If your change alters an endpoint, table, flow, or decision, update the corresponding file in `docs/` in the same branch.

## Farm Nomad UI quality rules

- Preserve a contextual Back route on nested public and platform pages; prefer internal hrefs with useful state over browser-history-only behaviour.
- Keep market search/filter/sort state in the URL when practical so result pages can be shared, refreshed, and restored from listing detail pages.
- Protect dirty forms with an accessible confirmation dialog before navigation; do not silently discard listing drafts.
- Use semantic controls, labelled inputs, visible focus states, and icon-only `aria-label`s; destructive actions need confirmation.
- Keep motion purposeful, transform/opacity based, and respectful of `prefers-reduced-motion`.
- Verify responsive layouts at 320px, 360px, 390px, 430px, 768px, 1024px, 1280px, and 1440px widths before shipping UI polish.
