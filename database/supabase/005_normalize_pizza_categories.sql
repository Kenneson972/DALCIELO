-- Normalise les catégories des pizzas : uniquement "Classique" ou "Du Chef"
-- À exécuter sur les environnements déjà seedés avec les anciennes catégories (Spéciale, Signature).

-- Toutes les pizzas qui ne sont pas "Du Chef" passent en "Classique"
UPDATE products
SET category = 'Classique', updated_at = NOW()
WHERE type = 'pizza'
  AND (category IS NULL OR category NOT IN ('Du Chef'));

-- S'assurer que la Pizza du Chef (menu_id 900 ou is_chef_special) a bien "Du Chef"
UPDATE products
SET category = 'Du Chef', updated_at = NOW()
WHERE type = 'pizza'
  AND (menu_id = 900 OR is_chef_special = true);
