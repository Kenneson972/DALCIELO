-- Ajout du champ sauce_au_choix (Variante 2 dans import_articles_source.csv)
-- Pizzas avec sauce au choix : Crispy, Saucisse fumée, Bouchère, Burger, Suprême, Bergère,
-- Saumon, Crevettes, Colombo, Végétarienne, Veggie, Duchesse, Thon (menu_id 201-208, 210-211, 213-215)

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sauce_au_choix BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN products.sauce_au_choix IS 'Si true, la pizza propose un choix de sauce après cuisson (Ketchup, Barbecue, Burger, Miel, Pesto).';

-- Mise à jour des pizzas qui ont la sauce au choix (ids cohérents avec menuData.ts)
UPDATE products
SET sauce_au_choix = true
WHERE type = 'pizza'
  AND menu_id IN (201, 202, 203, 204, 205, 206, 207, 208, 210, 211, 213, 214, 215);
