CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY,
  vendor_id uuid NOT NULL REFERENCES users(id),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  price_pence integer NOT NULL CHECK (price_pence >= 0),
  quantity numeric(12,2) NOT NULL CHECK (quantity >= 0),
  unit text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED', 'SOLD_OUT')),
  location text NOT NULL,
  is_surplus boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS listing_images (
  id uuid PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  cloudinary_public_id text NOT NULL,
  position smallint NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_listings_status_category ON listings(status, category);
CREATE INDEX IF NOT EXISTS idx_listings_vendor ON listings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_listings_surplus ON listings(is_surplus) WHERE is_surplus;
