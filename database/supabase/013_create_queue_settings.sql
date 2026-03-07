-- Paramètres de file d'attente/four pilotés depuis /admin

CREATE TABLE IF NOT EXISTS queue_settings (
  id                         SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  oven_available             BOOLEAN NOT NULL DEFAULT true,
  mode                       VARCHAR(10) NOT NULL DEFAULT 'auto' CHECK (mode IN ('auto', 'manual')),
  manual_estimated_minutes   INTEGER CHECK (manual_estimated_minutes IS NULL OR (manual_estimated_minutes >= 5 AND manual_estimated_minutes <= 180)),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ligne singleton par défaut
INSERT INTO queue_settings (id, oven_available, mode, manual_estimated_minutes)
VALUES (1, true, 'auto', NULL)
ON CONFLICT (id) DO NOTHING;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_queue_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS queue_settings_updated_at ON queue_settings;
CREATE TRIGGER queue_settings_updated_at
  BEFORE UPDATE ON queue_settings
  FOR EACH ROW EXECUTE PROCEDURE update_queue_settings_updated_at();

ALTER TABLE queue_settings ENABLE ROW LEVEL SECURITY;

-- Lecture/écriture via service role (API server)
CREATE POLICY "Service role queue settings" ON queue_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);
