CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY,
  buyer_id uuid NOT NULL REFERENCES users(id),
  vendor_id uuid NOT NULL REFERENCES users(id),
  status text NOT NULL DEFAULT 'PLACED' CHECK (status IN ('PLACED', 'ACCEPTED', 'READY', 'COMPLETED', 'CANCELLED')),
  total_pence integer NOT NULL DEFAULT 0 CHECK (total_pence >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES listings(id),
  quantity numeric(12,2) NOT NULL CHECK (quantity > 0),
  unit_price_pence integer NOT NULL CHECK (unit_price_pence >= 0)
);

CREATE TABLE IF NOT EXISTS deliveries (
  id uuid PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id),
  driver_id uuid REFERENCES users(id),
  status text NOT NULL DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELLED')),
  pickup_address text NOT NULL,
  dropoff_address text NOT NULL,
  proof_of_delivery_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_vendor_status ON orders(vendor_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
