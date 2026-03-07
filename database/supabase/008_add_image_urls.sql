-- Plusieurs images par produit (pizzas, etc.) : galerie en plus de l’image principale
-- image_url reste l’image principale (affichée en liste) ; image_urls = tableau pour la galerie détail

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS image_urls JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN products.image_urls IS 'URLs des images additionnelles (tableau). image_url reste l’image principale.';

-- Synchroniser image_url dans image_urls pour les lignes qui ont déjà une image
UPDATE products
SET image_urls = jsonb_build_array(image_url)
WHERE image_url IS NOT NULL AND image_url != '' AND (image_urls IS NULL OR image_urls = '[]'::jsonb);
