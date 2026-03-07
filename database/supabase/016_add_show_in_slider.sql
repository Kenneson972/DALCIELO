-- Option par produit : afficher ou non dans le slider de la page d'accueil (pizzas + Pizza du Chef)

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS show_in_slider BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN products.show_in_slider IS 'Si true, la pizza apparaît dans le carousel de la homepage (slider). Pizzas et Pizza du Chef uniquement.';
