-- Ajoute le flag desserts_enabled à homepage_settings
-- Par défaut FALSE (désactivé jusqu'à confirmation du client)

ALTER TABLE homepage_settings
  ADD COLUMN IF NOT EXISTS desserts_enabled BOOLEAN NOT NULL DEFAULT false;

-- Met à jour la ligne existante pour confirmer la valeur par défaut
UPDATE homepage_settings SET desserts_enabled = false WHERE id = 1;
