-- Bucket Supabase Storage pour les images des produits (menu admin : upload au lieu d'URL)
-- Après exécution : l'app pourra uploader des fichiers et enregistrer l'URL publique dans products.image_url
-- La table products ne change pas : image_url reste une URL (celle du fichier stocké).

-- Étape 1 : Créer le bucket (à faire une seule fois)
-- Option A — Dashboard : Storage > New bucket > id = "product-images", Public = oui, limit 5 MB, types image/*.
-- Option B — SQL (si ton projet l'autorise) :s
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Étape 2 : Lecture publique des images (affichage site)
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Upload / suppression : faits depuis l'API avec service_role (bypass RLS). Aucune policy supplémentaire nécessaire.
