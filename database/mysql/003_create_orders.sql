-- Orders table for Pizza dal Cielo (o2switch MySQL)
-- Aligned with src/types/order.ts (Order, OrderItem as JSON)

CREATE TABLE IF NOT EXISTS orders (
  id CHAR(36) PRIMARY KEY,
  token VARCHAR(64) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  client_name VARCHAR(120) NOT NULL,
  client_phone VARCHAR(24) NOT NULL,
  type_service VARCHAR(20) NOT NULL,
  heure_souhaitee VARCHAR(20) NOT NULL,

  items JSON NOT NULL,
  total DECIMAL(10, 2) NOT NULL,

  status VARCHAR(32) NOT NULL DEFAULT 'pending_validation',

  estimated_ready_time TIMESTAMP NULL,
  actual_ready_time TIMESTAMP NULL,
  preparation_started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,

  notes TEXT NULL,
  delivery_address VARCHAR(255) NULL,
  refusal_reason VARCHAR(255) NULL,
  payment_link VARCHAR(512) NULL,

  CONSTRAINT chk_type_service CHECK (type_service IN ('click_collect', 'delivery')),
  CONSTRAINT chk_status CHECK (status IN (
    'pending_validation', 'waiting_payment', 'paid', 'in_preparation',
    'ready', 'in_delivery', 'completed', 'cancelled', 'refused'
  ))
);

CREATE UNIQUE INDEX idx_orders_token ON orders(token);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
