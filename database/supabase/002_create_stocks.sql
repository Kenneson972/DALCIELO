-- Stocks table for Pizza dal Cielo (Supabase / PostgreSQL)
-- Pizzas, boissons, friands - quantités et seuils

CREATE TABLE IF NOT EXISTS stocks (
  id SERIAL PRIMARY KEY,
  item_id VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(64) NOT NULL,
  quantity INT NOT NULL DEFAULT 20,
  min_threshold INT NOT NULL DEFAULT 5,
  unit VARCHAR(32) NOT NULL DEFAULT 'unité',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stocks_category ON stocks(category);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stocks_updated_at ON stocks;
CREATE TRIGGER stocks_updated_at
  BEFORE UPDATE ON stocks
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();
