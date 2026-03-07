# Récap session — Reçu PDF, panier, tunnel (pour reprise)

*Dernière mise à jour : session du jour.*

---

## 1. Contexte projet

- **Pizza dal Cielo** : site Next.js (Supabase, Stripe) — commandes, suivi, admin, mode cuisine.
- **Reçu PDF** : généré par **n8n** (Google Docs template → Copy → Update placeholders → Download PDF → Upload vers l’app → Send email).

---

## 2. Ce qu’on a fait cette session

### 2.1 Erreur 408 / tunnel (localtunnel → ngrok)

- **Problème** : n8n (cloud) appelait l’app en local via localtunnel → « Your request is invalid or could not be processed by the service » (408 / 401).
- **Cause** : Localtunnel affiche une page « Cliquez pour continuer » / mot de passe ; les requêtes automatiques (n8n) étaient bloquées.
- **Solution** : passer à **ngrok** pour le dev local.
  - Install : `brew install ngrok/ngrok/ngrok` (ou téléchargement depuis ngrok.com).
  - Compte gratuit + authtoken : https://dashboard.ngrok.com/get-started/your-authtoken → `ngrok config add-authtoken TON_TOKEN`.
  - Lancer : `ngrok http 3000` → URL type `https://xxxx.ngrok-free.app`.
- **Workflow n8n** : l’URL du nœud **GET Commande** a été mise à jour avec ton URL ngrok (`louella-bottomless-subtly.ngrok-free.dev`). En prod, remplacer par l’URL du site (ex. `https://dalcielo.fr`).

### 2.2 Panier qui ne se réinitialisait pas

- **Problème** : après envoi d’une commande, le panier n’était pas toujours vide pour en refaire une.
- **Modifs** (dans `CartDrawer.tsx`) :
  - À l’**ouverture** du tiroir panier : réinitialisation des états `sent` et `offlineWarning` pour afficher le panier à jour.
  - Au clic sur **« Fermer »** (après « Commande envoyée ! » ou « Problème de connexion ») : appel à `clearCart()` + reset des états pour forcer la persistance et un panier vide au prochain ouvert.

### 2.3 Reçu côté client = même PDF que n8n

- **Problème** : le bouton « Voir le reçu » ouvrait la **page imprimable** du site, pas le **PDF généré par n8n** (Google Docs).
- **Solution** : stocker le PDF généré par n8n (Supabase Storage), enregistrer l’URL sur la commande, afficher un lien de téléchargement sur la page suivi.

**Côté app :**

| Élément | Détail |
|--------|--------|
| **Migration** | `database/supabase/010_add_receipt_pdf_url.sql` — colonne `orders.receipt_pdf_url` + bucket Storage `receipts` (public read). |
| **Type** | `Order.receipt_pdf_url` dans `src/types/order.ts`. |
| **Store** | `ordersStore.ts` : `OrderRow`, `rowToOrder`, `setOrderReceiptPdfUrl(token, url)`. |
| **API** | `POST /api/orders/[token]/receipt-pdf` — corps = binaire PDF, en-tête `x-receipt-secret` obligatoire. Upload vers bucket `receipts`, mise à jour de la commande, retour de l’URL publique. |
| **Env** | `RECEIPT_UPLOAD_SECRET` dans `.env` / `.env.example` (même valeur à mettre dans n8n). |
| **Page suivi** | Si `order.receipt_pdf_url` existe : bouton **« Télécharger le reçu PDF »** (lien direct vers le PDF) + lien secondaire « Voir le récapitulatif / Imprimer ». Sinon : uniquement « Voir le reçu / Imprimer » (page HTML). |

**Côté n8n :**

- Nouveau nœud **« Upload PDF to app »** entre **Download as PDF** et **Envoyer email (Guylian)**.
- Méthode POST, URL : `https://YOUR-APP-URL/api/orders/` + token du webhook + `/receipt-pdf`.
- En-tête : `x-receipt-secret` = valeur de `RECEIPT_UPLOAD_SECRET`.
- Body : données binaires du nœud précédent (champ `data`). Si l’import ne configure pas le body binaire, le faire à la main dans le nœud (Send Body → Binary / n8n Binary File → champ `data`).

**À faire de ton côté (quand tu reprends) :**

1. Exécuter **010_add_receipt_pdf_url.sql** dans Supabase (SQL Editor).
2. Définir **RECEIPT_UPLOAD_SECRET** dans `.env.local` (et la même valeur en variable d’env ou en dur dans le nœud n8n **Upload PDF to app**).
3. Dans le nœud **Upload PDF to app** : remplacer **YOUR-APP-URL** par l’URL de l’app (prod ou ngrok).
4. Tester un paiement : après génération du reçu par n8n, la page suivi doit afficher « Télécharger le reçu PDF ».

---

## 3. Fichiers modifiés / créés (référence rapide)

- `src/components/layout/CartDrawer.tsx` — reset panier + Fermer.
- `src/components/order/OrderTrackingClient.tsx` — section « Votre reçu » avec lien PDF n8n si `receipt_pdf_url`.
- `src/types/order.ts` — `receipt_pdf_url?: string`.
- `src/lib/ordersStore.ts` — `receipt_pdf_url` dans row/order + `setOrderReceiptPdfUrl()`.
- `src/app/api/orders/[token]/receipt-pdf/route.ts` — **nouveau** : POST PDF, upload Storage, mise à jour commande.
- `database/supabase/010_add_receipt_pdf_url.sql` — **nouveau** : colonne + bucket.
- `n8n/Reçu-Pizza-dal-Cielo-PDF.json` — nœud **Upload PDF to app** + connexions.
- `.env.example` — `RECEIPT_UPLOAD_SECRET`.
- `docs/RECEPTE_PDF_N8N.md` — tunnel ngrok, upload PDF, étapes 6–7, config n8n.
- `docs/RECAP_SESSION_RECU_PANIER.md` — **ce fichier**.

---

## 4. URLs / variables utiles

| Usage | Où |
|-------|-----|
| Webhook reçu n8n | `N8N_RECEIPT_WEBHOOK_URL` (appelé après paiement Stripe) |
| Secret upload PDF | `RECEIPT_UPLOAD_SECRET` (app + en-tête n8n `x-receipt-secret`) |
| GET commande (n8n) | Nœud **GET Commande** : URL = app (ngrok en dev, domaine en prod) |
| Upload PDF (n8n) | Nœud **Upload PDF to app** : même base URL + `/api/orders/{{ token }}/receipt-pdf` |

---

## 5. Pour reprendre

1. Lire ce recap + `docs/RECEPTE_PDF_N8N.md` si besoin de détail reçu/n8n.
2. Vérifier que la migration 010 est bien exécutée et que `RECEIPT_UPLOAD_SECRET` est défini.
3. Tester le flux complet : commande → validation → paiement Stripe → reçu n8n → upload PDF → lien « Télécharger le reçu PDF » sur la page suivi.

Bonne pause, à la prochaine session.
