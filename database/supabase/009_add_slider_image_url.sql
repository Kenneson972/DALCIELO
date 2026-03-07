-- Image dédiée au slider homepage (pizzas) : fond transparent, réservée au bandeau
-- Ne remplace pas image_url (fiche produit, liste, etc.)

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS slider_image_url TEXT;

COMMENT ON COLUMN products.slider_image_url IS 'URL de l’image affichée uniquement dans le slider de la homepage (ex. pizza détourée). Optionnel.';
