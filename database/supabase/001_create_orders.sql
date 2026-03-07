-- Orders table for Pizza dal Cielo (Supabase / PostgreSQL)
-- Aligned with src/types/order.ts

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  client_name VARCHAR(120) NOT NULL,
  client_phone VARCHAR(24) NOT NULL,
  type_service VARCHAR(20) NOT NULL CHECK (type_service IN ('click_collect', 'delivery')),
  heure_souhaitee VARCHAR(20) NOT NULL,

  items JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,

  status VARCHAR(32) NOT NULL DEFAULT 'pending_validation'
    CHECK (status IN (
      'pending_validation', 'waiting_payment', 'paid', 'in_preparation',
      'ready', 'in_delivery', 'completed', 'cancelled', 'refused'
    )),

  estimated_ready_time TIMESTAMPTZ,
  actual_ready_time TIMESTAMPTZ,
  preparation_started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  notes TEXT,
  delivery_address VARCHAR(255),
  refusal_reason VARCHAR(255),
  payment_link VARCHAR(512)
);

CREATE INDEX IF NOT EXISTS idx_orders_token ON orders(token);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Enable RLS (Row Level Security) - optionnel si vous utilisez service_role
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Politique : permettre tout au service_role (utilisé par l'API)
CREATE POLICY "Service role full access" ON orders
  FOR ALL
  USING (true)
  WITH CHECK (true);
