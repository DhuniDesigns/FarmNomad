# FarmNomad — Database Schema

**Status:** **[Recommended baseline]**. The live schema is defined by the Spring Boot JPA entities in the backend repository, which is the source of truth. Confirmed entity names from project records: **User (with roles), Listing/marketplace domain, Order, Donation, Organisation, Meal, Equipment, Notification, Message, CropScanResult, Subscription**. Field-level detail below is a recommended shape for agents; **reconcile against the actual entities before writing migrations**, and record diffs in `docs/DECISIONS.md`.

Conventions: PostgreSQL, `snake_case`, plural table names, `uuid` PKs **[Recommended — existing code may use bigint identity; follow existing code]**, `created_at`/`updated_at timestamptz` on every table.

---

## 1. Tables

### users
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| email | citext | UNIQUE, NOT NULL |
| password_hash | text | NOT NULL (BCrypt) |
| role | text | NOT NULL, CHECK in ('FARMER','KITCHEN','ORGANISATION','CUSTOMER','DRIVER','ADMIN') **[Confirmed role set]** |
| display_name | text | NOT NULL |
| phone | text | nullable |
| status | text | CHECK in ('ACTIVE','SUSPENDED','PENDING') — default 'ACTIVE' |
| address / city / postcode / country | text | nullable — added `V6__add_geolocation.sql` (2026-08-04). This entity had no address fields at all before that migration. |
| address_lat / address_lng | double precision | nullable — geocoded from the address fields above, or a manually-placed pin |
| geocode_source | varchar(20) | nullable — `POSTCODES_IO`\|`MAPBOX`\|`MANUAL`\|`NONE`, see `GeocodeSource` |
| geocoded_at | timestamptz | nullable |
| created_at / updated_at | timestamptz | |

### organisations
Organisation profile for users with role ORGANISATION. **[Confirmed entity]**
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users | UNIQUE, NOT NULL |
| name | text | NOT NULL |
| org_type | text | e.g. FOOD_BANK, SCHOOL, RELIGIOUS, STUDENT_GROUP **[Recommended; tiers confirmed as future verification scope]** |
| verification_status | text | CHECK in ('PENDING','VERIFIED','REJECTED'), default 'PENDING' |
| verification_notes | text | admin-facing |
| address / postcode | text | UK postcode |

### listings
Marketplace produce/goods. **[Confirmed domain]**
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| vendor_id | uuid FK → users | NOT NULL; role must be FARMER or KITCHEN (service-enforced) |
| title | text | NOT NULL |
| description | text | |
| category | text | NOT NULL |
| price_pence | integer | NOT NULL, CHECK ≥ 0 — store money as integer pence |
| quantity | numeric(12,2) | NOT NULL, CHECK ≥ 0 |
| unit | text | e.g. kg, box, item |
| status | text | CHECK in ('ACTIVE','ARCHIVED','SOLD_OUT'), default 'ACTIVE' |
| location | text | display location; free text, geocoded on write (see below) |
| is_surplus | boolean | default false — flagged for donation |
| pickup_lat / pickup_lng | double precision | nullable — geocoded from `location` on create/update, or a manually-placed pin. Added `V6__add_geolocation.sql` (2026-08-04). Indexed (`idx_listings_pickup_coords`) as a bounding-box prefilter for `GET /api/surplus/nearby`. |
| geocode_source | varchar(20) | nullable — `POSTCODES_IO`\|`MAPBOX`\|`MANUAL`\|`NONE` |
| geocoded_at | timestamptz | nullable |

### listing_images
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| listing_id | uuid FK → listings | NOT NULL, ON DELETE CASCADE |
| cloudinary_public_id | text | NOT NULL — store IDs, not URLs **[Recommended]** |
| position | smallint | ordering |

### orders
Commitment-based at MVP (no payment fields required yet). **[Confirmed domain + no-payments decision]**
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| buyer_id | uuid FK → users | NOT NULL |
| vendor_id | uuid FK → users | NOT NULL (denormalised for vendor dashboards) |
| status | text | status set unresolved — see DECISIONS; suggested: PLACED, ACCEPTED, READY, COMPLETED, CANCELLED |
| total_pence | integer | derived, CHECK ≥ 0 |

### order_items
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| order_id | uuid FK → orders | NOT NULL, ON DELETE CASCADE |
| listing_id | uuid FK → listings | NOT NULL |
| quantity | numeric(12,2) | NOT NULL, CHECK > 0 |
| unit_price_pence | integer | snapshot at order time |

### donations
Surplus donation orders. **[Confirmed domain — and site of the known `placeDonationOrder` suspected argument-order bug: verify farmer/organisation/listing IDs persist to the correct columns; regression-test.]**
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| donor_id | uuid FK → users | NOT NULL — the Farmer/Kitchen donating |
| organisation_id | uuid FK → organisations | NOT NULL — the verified recipient |
| listing_id | uuid FK → listings | NOT NULL |
| quantity | numeric(12,2) | NOT NULL, CHECK > 0 |
| status | text | CHECK in ('AVAILABLE','CLAIMED','COMPLETED','CANCELLED') **[Recommended]** |
| claimed_at / completed_at | timestamptz | nullable |

### meals
Prepared meals (Kitchen / NomadEat groundwork). **[Confirmed entity; fields Recommended]**
id uuid PK · kitchen_id FK → users NOT NULL · name text NOT NULL · description text · price_pence integer CHECK ≥ 0 · available boolean default true.

### equipment
Equipment marketplace groundwork. **[Confirmed entity; fields Recommended]**
id uuid PK · owner_id FK → users NOT NULL · name text NOT NULL · description text · mode text CHECK in ('RENT','SALE','BOTH') · price_pence integer · status text CHECK in ('AVAILABLE','UNAVAILABLE').

### notifications **[Confirmed entity]**
id uuid PK · user_id FK → users NOT NULL · type text NOT NULL · payload jsonb · read_at timestamptz nullable.

### messages **[Confirmed entity]**
id uuid PK · sender_id FK → users NOT NULL · recipient_id FK → users NOT NULL · body text NOT NULL · read_at timestamptz nullable. (Thread/conversation modelling: unresolved — follow existing entity; if flat, a `conversations` table is a **[Recommended]** later refactor.)

### crop_scan_results **[Confirmed entity]**
id uuid PK · user_id FK → users NOT NULL · cloudinary_public_id text · predicted_class text · confidence numeric(5,4) · model_version text · created_at.

### subscriptions **[Confirmed entity; purpose under-documented — see DECISIONS]**
id uuid PK · user_id FK → users NOT NULL · plan text · status text · started_at / ends_at timestamptz.

### driver_locations **[Confirmed, implemented `V6__add_geolocation.sql`, 2026-08-04]**
Live driver position — one row per driver, upserted, not a history table. Written by `PUT /api/drivers/me/location` and the STOMP `/app/driver/location` destination. `driver_id` is a plain UUID FK, matching how `listings.vendor_id` references `users` elsewhere (not a JPA `@OneToOne` relation).
| Column | Type | Notes |
|---|---|---|
| id | bigserial PK | |
| driver_id | uuid FK → users | UNIQUE, NOT NULL, ON DELETE CASCADE |
| lat / lng | double precision | NOT NULL |
| heading | double precision | nullable — degrees from north, 0-360 |
| accuracy | double precision | nullable — metres, from the browser Geolocation API |
| updated_at | timestamptz | NOT NULL |

No history is retained (deliberately — see DECISIONS "Technical — geolocation & maps", UK GDPR retention rationale). A `driver_location_history` table, written to asynchronously, is the identified path if a breadcrumb trail is ever needed.

## 2. Relationships

- users 1—0..1 organisations (organisation profile only for ORGANISATION role)
- users (vendor) 1—* listings; listings 1—* listing_images
- users (buyer) 1—* orders; orders 1—* order_items *—1 listings
- users (donor) 1—* donations *—1 organisations; donations *—1 listings
- users 1—* meals / equipment / notifications / crop_scan_results / subscriptions
- users 1—* messages (as sender and as recipient)
- users (driver) 1—0..1 driver_locations

## 3. Constraints

- FK constraints on every relationship above; `ON DELETE CASCADE` only for owned children (listing_images, order_items); restrict elsewhere — never silently cascade user deletion **[Recommended]**.
- CHECK constraints on all status/role enums (defence in depth beneath JPA).
- Money as integer pence everywhere; never float.
- `UNIQUE(users.email)`; `UNIQUE(organisations.user_id)`.
- Donation claims: enforce single claim via `UPDATE … WHERE status='AVAILABLE'` + row count check (or `SELECT … FOR UPDATE`) to make concurrent claims first-wins **[Recommended — supports the claim-collision edge case in USER-FLOWS]**.

## 4. Indexes **[Recommended]**

- listings: `(status, category)`, `(vendor_id)`, `(is_surplus) WHERE is_surplus`, `(pickup_lat, pickup_lng)` **[Confirmed, implemented — bounding-box prefilter for GET /api/surplus/nearby]**, text search on title/description (`GIN` on `to_tsvector`) for market search
- orders: `(vendor_id, status)`, `(buyer_id)`
- donations: `(organisation_id, status)`, `(donor_id)`, `(status) WHERE status='AVAILABLE'`
- messages: `(recipient_id, read_at)`, `(sender_id)`
- notifications: `(user_id, read_at)`

## 5. Permissions and row-level security

Current model **[Confirmed]**: the Spring Boot service is the only database client; authorization is enforced in the service layer via JWT role claims. The app connects as `farmnomad_user`.

Recommendations:

- Keep service-layer authorization as the primary mechanism (JPA + a single app user is the standard Spring pattern; Postgres RLS adds friction with connection pooling and Hibernate).
- Principle of least privilege for `farmnomad_user`: no SUPERUSER, no DDL in production (migrations run under a separate migration role) **[Recommended]**.
- If defence-in-depth RLS is later desired (e.g. multi-tenant hardening for the dissertation's security chapter), the viable pattern is `SET LOCAL app.current_user_id` per transaction with policies like `vendor_id = current_setting('app.current_user_id')::uuid` on listings/orders/donations — document as future work, do not implement in MVP **[Recommended]**.
- Enforce every ownership rule in services now: vendors mutate only their listings; organisations see only their donations; admins bypass via explicit role check.

## 6. Migrations **[Recommended]**

Adopt Flyway (`src/main/resources/db/migration`) if not already in the repo; baseline `V1__baseline.sql` from the current Hibernate-generated schema, then disable `ddl-auto` mutation in favour of `validate`. Record adoption in DECISIONS.
