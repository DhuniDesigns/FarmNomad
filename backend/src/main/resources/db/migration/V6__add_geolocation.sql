-- Coordinates for the two entities that actually have real Java persistence
-- today: listings (the spec's "Product") and users. Orders, deliveries, and
-- organisations already have address/postcode columns from earlier
-- migrations, but have no JPA entity or service behind them yet (Phase 4 —
-- see docs/IMPLEMENTATION-PLAN.md) — adding coordinate columns to tables
-- nothing in the codebase reads or writes would be dead schema, so that's
-- deferred to whenever those entities are actually built. See
-- docs/DECISIONS.md for the full scoping note.

ALTER TABLE listings
  ADD COLUMN pickup_lat DOUBLE PRECISION,
  ADD COLUMN pickup_lng DOUBLE PRECISION,
  ADD COLUMN geocode_source VARCHAR(20),
  ADD COLUMN geocoded_at TIMESTAMPTZ;

ALTER TABLE users
  ADD COLUMN address TEXT,
  ADD COLUMN city TEXT,
  ADD COLUMN postcode TEXT,
  ADD COLUMN country TEXT,
  ADD COLUMN address_lat DOUBLE PRECISION,
  ADD COLUMN address_lng DOUBLE PRECISION,
  ADD COLUMN geocode_source VARCHAR(20),
  ADD COLUMN geocoded_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS driver_locations (
  id          BIGSERIAL PRIMARY KEY,
  driver_id   UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  heading     DOUBLE PRECISION,
  accuracy    DOUBLE PRECISION,
  updated_at  TIMESTAMPTZ NOT NULL
);

-- Bounding-box prefilters for proximity queries (e.g. GET /api/surplus/nearby)
-- so the index eliminates most rows before the Haversine expression runs.
-- Plain columns + Haversine are correct at this scale; PostGIS is the
-- identified scaling path if row counts grow, deliberately not adopted yet
-- (see docs/DECISIONS.md).
CREATE INDEX IF NOT EXISTS idx_listings_pickup_coords ON listings (pickup_lat, pickup_lng);
