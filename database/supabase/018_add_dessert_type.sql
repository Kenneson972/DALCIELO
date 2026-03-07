-- Ajoute 'dessert' comme type valide dans la table products

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_type_check;
ALTER TABLE products ADD CONSTRAINT products_type_check
  CHECK (type IN ('pizza', 'friand', 'drink', 'dessert'));
