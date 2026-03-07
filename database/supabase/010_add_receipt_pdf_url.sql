-- Reçu PDF généré par n8n : stockage de l’URL pour affichage côté client

-- Colonne sur la commande
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS receipt_pdf_url TEXT;

-- Bucket Storage pour les reçus PDF (accès lecture publique pour le client)
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Lecture publique des reçus (le client ouvre l’URL avec le token dans la page suivi)
DROP POLICY IF EXISTS "Public read receipts" ON storage.objects;
CREATE POLICY "Public read receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'receipts');

-- Upload : fait par l’API (service_role) ou par n8n via l’API. Pas de policy upload pour les anonymes.
