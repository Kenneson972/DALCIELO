-- Réglages page d'accueil (slider pizzas, etc.) pilotés depuis /admin

CREATE TABLE IF NOT EXISTS homepage_settings (
  id              SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  slider_enabled  BOOLEAN NOT NULL DEFAULT true,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO homepage_settings (id, slider_enabled)
VALUES (1, true)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION update_homepage_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS homepage_settings_updated_at ON homepage_settings;
CREATE TRIGGER homepage_settings_updated_at
  BEFORE UPDATE ON homepage_settings
  FOR EACH ROW EXECUTE PROCEDURE update_homepage_settings_updated_at();

ALTER TABLE homepage_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role homepage settings" ON homepage_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);
