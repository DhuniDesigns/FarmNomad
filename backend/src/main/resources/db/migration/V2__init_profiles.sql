CREATE TABLE IF NOT EXISTS organisations (
  id uuid PRIMARY KEY,
  user_id uuid UNIQUE NOT NULL REFERENCES users(id),
  name text NOT NULL,
  org_type text NOT NULL,
  verification_status text NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  verification_notes text,
  address text NOT NULL,
  postcode text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendor_profiles (
  id uuid PRIMARY KEY,
  user_id uuid UNIQUE NOT NULL REFERENCES users(id),
  vendor_type text NOT NULL CHECK (vendor_type IN ('FARMER', 'KITCHEN')),
  business_name text NOT NULL,
  address text NOT NULL,
  postcode text NOT NULL,
  operating_radius_miles integer NOT NULL DEFAULT 20,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
