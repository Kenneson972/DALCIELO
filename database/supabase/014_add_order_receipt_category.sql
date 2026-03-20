-- Catégorie reçu / bon de commande pour classement par equipe de Dal Cielo (admin)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS receipt_category VARCHAR(64);

COMMENT ON COLUMN orders.receipt_category IS 'Catégorie de classement du bon de commande (ex. Comptabilité OK, À archiver, Litige)';
