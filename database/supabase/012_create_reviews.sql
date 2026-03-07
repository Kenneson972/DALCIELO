-- 012_create_reviews.sql
-- Table des avis clients sur les produits

CREATE TABLE IF NOT EXISTS reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id     integer NOT NULL,            -- correspond à MenuItem.id / product.menu_id
  author_name text    NOT NULL CHECK (char_length(author_name) BETWEEN 1 AND 80),
  rating      smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     text CHECK (char_length(comment) <= 1000),
  status      text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  ip_hash     text,                        -- SHA-256 de l'IP pour déduplication silencieuse
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS reviews_menu_id_status_idx ON reviews (menu_id, status);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx     ON reviews (created_at DESC);

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Lecture publique : uniquement les avis approuvés
CREATE POLICY "reviews_select_approved" ON reviews
  FOR SELECT USING (status = 'approved');

-- Insertion publique (sans authentification)
CREATE POLICY "reviews_insert_public" ON reviews
  FOR INSERT WITH CHECK (true);

-- Toutes opérations pour le service role (admin via supabaseAdmin)
-- Le service role bypasse RLS automatiquement.

COMMENT ON TABLE reviews IS 'Avis clients sur les produits. Modération manuelle via le panneau admin.';
