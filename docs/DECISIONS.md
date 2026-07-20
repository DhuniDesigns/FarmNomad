# FarmNomad — Decision Log

Decisions already made (do not re-litigate without founder approval), rejected alternatives, working assumptions, open questions, and risks. New decisions get appended here in the same format.

---

## 1. Decisions made

### Product
| Decision | Rationale | Rejected alternative |
|---|---|---|
| All-in-one platform: marketplace + surplus redistribution + logistics coordination | Competitive positioning — only platform combining these simultaneously | Point solution in a single vertical |
| Six roles: FARMER, KITCHEN (Vendor umbrella), ORGANISATION, CUSTOMER, DRIVER, ADMIN | Matches real actors; Vendor umbrella simplifies shared vendor UX | — |
| `FOODBANK` role renamed to `ORGANISATION` | Broader recipient base (schools, religious, student groups) | Keeping FOODBANK and adding parallel roles |
| Web = Vendors/Organisations/Admins; Mobile = Customers/Drivers | Each audience on its natural surface | Single responsive web app for all roles |
| NomadEat as a sub-brand (prepared meals, students) — future scope | Focus MVP on core platform | Building the vertical into MVP |
| Payments out of MVP; orders are commitments | Cuts Stripe/PCI scope from critical path | Stripe in V1 |
| MVP = market pages + Farmer dashboard + authorization, in build order: market browse → listing detail → shell + listing CRUD → orders dashboard → auth revamp last | Auth already works functionally; public value first | Auth-first rebuild |
| Dual mandate: commercial product + MSc dissertation (University of Bolton) | Every simplification documented with rationale + scaling path | — |

### Technical — backend
| Decision | Rationale | Rejected alternative |
|---|---|---|
| Full rename AgroRoute → FarmNomad (`com.agriroute` → `com.farmnomad`) | Brand change; complete, guarded against regressions | Alias/gradual rename |
| Spring Events for domain events | Less code, transactional support, framework-native | Hand-rolled Observer pattern (removed) |
| Wildcard removed from SecurityConfig; hardcoded secrets flagged for rotation | Security hygiene | — |
| Local dev: Docker Postgres on host 5433, `farmnomad_db`/`farmnomad_user`, app port 9000, `application-local.properties` | Self-sufficient local dev; 5432 conflicts with native Windows Postgres services | Assuming container isolation on 5432 |
| Seven entities added with full CRUD: Organisation, Meal, Equipment, Notification, Message, CropScanResult, Subscription | Groundwork for platform breadth | — |

### Technical — web
| Decision | Rationale | Rejected alternative |
|---|---|---|
| Public market pages: Server Components + `fetch` + ISR; RTK Query only behind auth | SEO + speed on rural connections | RTK Query everywhere (rejected for public pages) |
| JWT: refresh in httpOnly cookie, access token in memory | Eliminates XSS token theft | localStorage tokens (rejected; some legacy usage must be removed) |
| react-hook-form + zod for all forms | Identified as a stack gap; typed validation shared with server actions | Ad-hoc validation |
| Vitest + Playwright testing layer | Identified as a stack gap | Shipping untested |
| Tailwind v4, Framer Motion, `@stomp/stompjs`, Clash Grotesk via `next/font/local` | Founder's chosen stack, validated | — |
| Vercel with `dev`→preview / `main`→production; Conventional Commits; scoped branch prefixes | Established workflow | — |

### Technical — AI/ML
| Decision | Rationale | Rejected alternative |
|---|---|---|
| EfficientNet-B0 + ImageNet transfer learning | Trainable on free GPUs; strong accuracy/size trade-off; academically defensible | Training from scratch |
| Synchronous inference in v1; queue documented as scaling path | v1 load doesn't justify infrastructure; dissertation documents the path | Celery/Redis in v1 (explicitly dropped) |
| Dataset: `abdallahalidev/plantvillage-dataset` (full 38-class) | Complete class coverage | `emmarex/plantdisease` (subset) |
| PlantDoc as evaluation set for lab-vs-field domain gap; augmentation as mitigation | Demonstrates domain-gap awareness (dissertation) | Reporting PlantVillage-only accuracy |
| Build order: scanner → weather advisor → matching → surplus prediction | Scanner is the differentiator; surplus prediction has cold-start (synthetic data v1) | — |
| Weather advisor: API + rule-based; matching: rule-based scoring | Right-sized v1; ML later if warranted | ML-first for all features |

## 2. Assumptions (working — verify before relying on them)

- The Postman collection accurately reflects the current 15 endpoint groups; `docs/API-SPEC.md` shapes beyond confirmed groups are reconstructions.
- Field-level schema in `docs/DATABASE-SCHEMA.md` approximates the JPA entities; the backend repo is authoritative.
- Admin accounts are provisioned, not self-registered; Customer/Driver registration happens on mobile.
- MVP donation handover is arranged directly between parties (driver coordination post-MVP).
- Organisation verification at MVP is manual admin review; UK-gov API tiered verification is future scope.
- The AI service persists scan results through the backend (stateless FastAPI at v1).
- Design tokens in `docs/DESIGN-SYSTEM.md` are placeholders pending Figma delivery from the design lead.

## 3. Unresolved questions (owner: founder unless noted)

1. **`placeDonationOrder` bug** — suspected argument-order defect persisting incorrect IDs to the donations table. Flagged, not yet investigated. Highest-priority fix (Phase 0.1).
2. **Source-code access for this handoff** — the existing backend/web repositories were not available when this documentation was written; folder structures and contracts herein are reconstructions. First agent task: reconcile docs against real code (Phase 0.7).
3. **Order status set** — exact lifecycle states/transitions not decided (blocking task 4.1).
4. **Archiving listings with open orders** — block, warn, or allow?
5. **GPU availability** — local NVIDIA vs Colab/Kaggle T4; determines the training scaffold approach for `farmnomad-ai`.
6. **Backend + AI production hosting** — not chosen (Vercel covers web only).
7. **Database migrations** — is Flyway (or similar) already in place? If not, adopt per DATABASE-SCHEMA §6.
8. **Subscription entity purpose/plans** — entity exists; business model behind it undocumented.
9. **Messaging model** — flat sender/recipient vs conversation threads in the existing entity.
10. **Donation constraints** — perishability/time windows; partial claims of large lots.
11. **Organisation re-verification** — expiry and profile-edit effects on verified status.
12. **Success metrics** — no numeric business targets set; PRD §8 metrics are placeholders.
13. **Notification preferences UI** — scope undefined.
14. **Secret rotation** — flagged as needed; completion not confirmed.

## 4. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Docs drift from unreconciled repos | Agents build against wrong contracts | Phase 0.7 reconciliation before feature work; update docs with code (AGENTS.md rule 7) |
| Donation bug ships under new UI | Corrupt donation records, trust damage | Phase 0.1 fix + regression test gates everything |
| Leaked secrets in git history | Credential compromise | Rotate all flagged secrets; history scan; CI secret scanning |
| Scope breadth (6 roles, 2 surfaces, AI, sub-brand) vs solo founder + dissertation deadline | MVP slips | Strict phase gates; Phase 6 streams locked until Phase 5 closes |
| PlantVillage lab-vs-field gap | Scanner underperforms on real farm photos | PlantDoc evaluation + augmentation; report honestly in dissertation |
| Surplus prediction cold start | Feature launches without data | Synthetic data v1, documented as such |
| Windows local-dev traps (env-var precedence, CRLF in `.env`, port conflicts) | Hours lost to config ghosts | Documented in README setup; keep `application-local.properties` authoritative |
| Two data-fetching paradigms on web | Developer confusion | Hard rule: public = RSC/ISR, auth'd = RTK Query (AGENTS.md) |
| Design revamp lands mid-build | Rework of built UI | Build against tokens/components, not hard-coded values; treat Figma as source of truth |
