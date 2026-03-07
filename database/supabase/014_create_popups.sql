-- Migration 014 — Système de popups multi-types
-- Remplace le mécanisme hard-codé "Pizza du Chef" par un système flexible
-- géré depuis le dashboard admin (4 types : chef, promo, event, alert).

CREATE TABLE IF NOT EXISTS popups (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type         text NOT NULL CHECK (type IN ('chef','promo','event','alert')),
  title        text NOT NULL,
  subtitle     text,           -- badge ex: "Édition Limitée", "PROMO -15%"
  message      text,           -- description / corps du popup
  image_url    text,
  cta_label    text,           -- "Découvrir la pizza", "Commander", null
  cta_url      text,           -- "/menu/supreme", null
  price        numeric(10,2),  -- type 'chef' uniquement
  expires_at   date,           -- chef_valid_until / date événement
  active       boolean NOT NULL DEFAULT false,
  dismiss_mode text NOT NULL DEFAULT 'once_daily'
               CHECK (dismiss_mode IN ('once_daily','once_session')),
  priority     integer NOT NULL DEFAULT 0,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE popups ENABLE ROW LEVEL SECURITY;

-- Lecture publique des popups actifs uniquement
CREATE POLICY "public read active popups" ON popups
  FOR SELECT USING (active = true);

-- Index pour la requête publique (filtre active + tri priority)
CREATE INDEX IF NOT EXISTS idx_popups_active_priority
  ON popups (active, priority ASC)
  WHERE active = true;
