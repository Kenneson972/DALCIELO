-- Products table for Pizza dal Cielo (Supabase / PostgreSQL)
-- Source de vérité pour le menu : géré via /admin, seedé depuis menuData.ts

CREATE TABLE IF NOT EXISTS products (
  id            SERIAL PRIMARY KEY,
  menu_id       INTEGER NOT NULL UNIQUE,  -- id dans menuData.ts (101, 201…)
  slug          VARCHAR(120) NOT NULL UNIQUE,
  type          VARCHAR(20)  NOT NULL CHECK (type IN ('pizza', 'friand', 'drink')),

  name          VARCHAR(120) NOT NULL,
  category      VARCHAR(64),
  price         DECIMAL(10, 2) NOT NULL,
  description   TEXT,
  ingredients   JSONB,        -- tableau de chaînes ex. ["Tomate","Mozzarella"]
  image_url     TEXT,
  size          VARCHAR(32),  -- boissons uniquement (ex. "50cl")

  available     BOOLEAN NOT NULL DEFAULT true,
  popular       BOOLEAN NOT NULL DEFAULT false,
  vegetarian    BOOLEAN NOT NULL DEFAULT false,
  premium       BOOLEAN NOT NULL DEFAULT false,

  -- Pizza du Chef : champ éphémère
  is_chef_special  BOOLEAN  NOT NULL DEFAULT false,
  chef_valid_until DATE,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_type     ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug     ON products(slug);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE PROCEDURE update_products_updated_at();

-- RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Lecture publique (pages menu)
CREATE POLICY "Public read" ON products
  FOR SELECT USING (true);

-- Écriture réservée au service_role (API admin)
CREATE POLICY "Service role write" ON products
  FOR ALL
  USING (true)
  WITH CHECK (true);
