CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY,
  order_id uuid UNIQUE REFERENCES orders(id),
  provider text NOT NULL DEFAULT 'STRIPE',
  provider_reference text,
  amount_pence integer NOT NULL DEFAULT 0 CHECK (amount_pence >= 0),
  status text NOT NULL DEFAULT 'PENDING',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY,
  actor_id uuid REFERENCES users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
