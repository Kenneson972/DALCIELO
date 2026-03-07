# Reçu client & PDF — intégration n8n (inspiré EMMA 2.0)

## Ce qui existe côté app

- **Page reçu imprimable** : `/order/[token]/receipt` — le client peut « Imprimer / Enregistrer en PDF » depuis le navigateur.
- **API commande** : `GET /api/orders/[token]` — retourne l’objet `order` complet (articles, total, client, statut, etc.).

---

## En local (localhost) : tunnel obligatoire

n8n tourne dans le cloud et **ne peut pas appeler localhost**. Pour tester le reçu PDF pendant le dev :

1. **Utilise ngrok** (évite les blocages localtunnel) :
   - `ngrok http 3000` → tu obtiens une URL type `https://xxxx.ngrok-free.app`
   - Aucune page « Cliquez pour continuer » : les appels de n8n passent directement.
2. Dans le nœud **GET Commande** du workflow n8n, remplace **`YOUR-NGROK-OR-TUNNEL-URL`** par ton URL ngrok (sans `https://` ni slash final).  
   Exemple : si ngrok donne `https://abc123.ngrok-free.app`, l’URL dans le nœud doit être :  
   `https://abc123.ngrok-free.app/api/orders/` + token (le workflow utilise déjà `$json.body.token`).
3. **Localtunnel** : il affiche une page « mot de passe tunnel » et renvoie souvent **401** ou **408** aux requêtes automatiques (n8n), même avec l’en-tête `Bypass-Tunnel-Reminder`. Pour le reçu PDF, **préfère ngrok**.
4. **Prod** : quand le site sera en ligne, remplace l’URL du nœud par l’URL de prod (ex. `https://dalcielo.fr/api/orders/` + token).

---

## Pattern EMMA 2.0 (à réutiliser pour le reçu PDF)

Dans le workflow **EMMA 2.0**, le PDF est généré ainsi :

1. **Template Google Docs** : un document avec des placeholders (`{{DESTINATION}}`, `{{PRENOM}}`, `{{ITINERAIRE}}`, etc.).
2. **Copy file** (Google Drive) : copie ce template dans un nouveau document.
3. **Update a document** (Google Docs) : remplace chaque placeholder par la valeur réelle (Replace All).
4. **Download file** (Google Drive) : télécharge le document en PDF (`googleFileConversion`: `docsToFormat` → `application/pdf`).
5. **Send email** : envoi du PDF en pièce jointe (`attachments: data`).

On applique le même enchaînement pour le **reçu Pizza dal Cielo**.

---

## Flux n8n proposé : Reçu PDF Pizza dal Cielo

### 1. Déclencheur

- **Webhook** (POST) qui reçoit par exemple : `{ "token": "abc123..." }`.
- Ce webhook peut être appelé par votre app quand une commande est **payée** (depuis le webhook Stripe ou après mise à jour du statut en `paid` / `in_preparation`).

### 2. Récupérer la commande

- **HTTP Request** :  
  `GET https://dalcielo.fr/api/orders/{{ $json.body.token }}`  
  (ou `$json.token` selon le corps du webhook.)
- Sortie : `{ "order": { ... } }`.

### 3. Préparer les variables pour le template (Code node)
Le nœud **SET champs reçu** construit notamment :

- **ITEMS** : tableau en texte, **une ligne par article** avec colonnes séparées par une **tabulation** :  
  `Article [TAB] Qté [TAB] P.U. [TAB] Total`  
  Exemple : `Margherita	2	11,00€	22,00€`

Le template doit donc afficher une **ligne d’en-tête** (Article, Qté, P.U., Total), puis le placeholder **{{ITEMS}}** qui sera remplacé par ces lignes.

### 4. Template Google Doc (reçu) — avec tableau Article / Qté / P.U. / Total

Créer un document **Google Docs** avec les placeholders suivants :

- `{{CLIENT_NAME}}` — Nom du client
- `{{ORDER_ID}}` — N° commande (8 caractères)
- `{{DATE}}` — Date et heure de la commande
- `{{HEURE}}` — Heure souhaitée
- `{{SERVICE}}` — Click & Collect ou Livraison
- `{{STATUT}}` — Statut de la commande
- `{{PHONE}}` — Téléphone
- `{{ADDRESS}}` — Adresse (livraison) ou —
- **Tableau articles** : une ligne d’en-tête puis `{{ITEMS}}`
- `{{TOTAL}}` — Total à payer
- `{{NOTES}}` — Notes / instructions

**À mettre dans le template pour le tableau :**

1. **Ligne d’en-tête** (à taper telle quelle, avec des tabulations entre les colonnes) :  
   `Article	Qté	P.U.	Total`
2. **Ligne suivante** : uniquement le placeholder  
   `{{ITEMS}}`

n8n remplacera `{{ITEMS}}` par des lignes du type :  
`Margherita	2	11,00€	22,00€`  
`Orangina	1	2,50€	2,50€`  
(chaque ligne : Article [tab] Quantité [tab] Prix unitaire [tab] Total ligne)

Exemple de corps de reçu :

```
PIZZA DAL CIELO — Reçu
N° Commande: {{ORDER_ID}}
Date: {{DATE}}
Heure: {{HEURE}}
Service: {{SERVICE}}
Statut: {{STATUT}}

Client : {{CLIENT_NAME}}
Tél : {{PHONE}}
Adresse : {{ADDRESS}}

Article	Qté	P.U.	Total
{{ITEMS}}

TOTAL À PAYER : {{TOTAL}}

Notes : {{NOTES}}
```

### 5. Enchaînement n8n (comme EMMA)

| Étape            | Nœud              | Action |
|------------------|-------------------|--------|
| 1                | Webhook           | Reçoit `token` (ou `order` complet). |
| 2                | HTTP Request      | GET `/api/orders/{{ token }}` → récupère `order`. |
| 3                | Code              | Construit les champs (CLIENT_NAME, ITEMS, TOTAL, etc.) pour le template. |
| 4                | Google Drive      | **Copy file** : copie le Doc template (ID du template en dur ou variable). |
| 5                | Google Docs       | **Update a document** : Replace All pour chaque `{{PLACEHOLDER}}` par la valeur du Code. |
| 6                | Google Drive      | **Download file** : télécharge le Doc en PDF (option de conversion → `application/pdf`). |
| 7                | HTTP Request      | **Upload PDF to app** : POST du PDF vers l’API → stockage Supabase + URL enregistrée sur la commande. |
| 8                | Send email        | Envoi du PDF en pièce jointe (binary `data`) à Guylian et/ou au client. |

**Reçu côté client** : une fois le PDF uploadé (étape 7), l’app enregistre son URL sur la commande (`receipt_pdf_url`). Sur la page de suivi (`/order/[token]`), le client voit un bouton **« Télécharger le reçu PDF »** qui ouvre ce même PDF (celui généré par n8n).

### 6. Upload du PDF vers l’app (pour affichage client)

- **API** : `POST /api/orders/[token]/receipt-pdf` — corps = binaire PDF, en-tête obligatoire : `x-receipt-secret: <RECEIPT_UPLOAD_SECRET>`.
- L’API enregistre le PDF dans le bucket Supabase **receipts**, met à jour la commande avec l’URL publique, puis le client peut télécharger ce PDF depuis la page de suivi.
- **Base de données** : exécuter la migration `database/supabase/010_add_receipt_pdf_url.sql` (colonne `receipt_pdf_url` + bucket Storage `receipts`).
- **Variables d’environnement** (app) : `RECEIPT_UPLOAD_SECRET` (voir `.env.example`). Même valeur à configurer dans n8n (variable d’env ou en dur dans le nœud **Upload PDF to app**) pour l’en-tête `x-receipt-secret`.
- Dans le nœud **Upload PDF to app** : remplacer `YOUR-APP-URL` par l’URL de l’app (ex. `https://dalcielo.fr` ou ton URL ngrok en local). Body = binary data du nœud précédent (champ `data`).

### 7. Appeler le webhook depuis l’app

L’app appelle le webhook n8n **automatiquement** quand un paiement Stripe est reçu (`checkout.session.completed`) : après mise à jour de la commande en `paid`, elle envoie un POST avec `{ "token": "..." }` vers l’URL configurée.

**Variable d’environnement** (voir `.env.example`) : `N8N_RECEIPT_WEBHOOK_URL` — ex. `https://kenneson.app.n8n.cloud/webhook/receipt-pizza-dal-cielo`. À définir en prod pour que le reçu PDF soit déclenché après chaque paiement.

---

## Résumé

- **Même principe qu’EMMA 2.0** : Google Doc template → Copy → Update (placeholders) → Download as PDF → Send email.
- **Données** : fournies par `GET /api/orders/[token]` (ou par le webhook si vous envoyez déjà l’objet `order`).
- **Template** : un seul Google Doc « Reçu » avec les placeholders listés ci‑dessus.
- **Résultat** : un PDF reçu généré automatiquement et envoyé par email (Guylian, client, ou les deux selon les branches du workflow).

---

## Workflow n8n prêt à importer

Le fichier **`n8n/Reçu-Pizza-dal-Cielo-PDF.json`** contient un workflow calqué sur EMMA 2.0 :

1. **Webhook Reçu** (POST) → reçoit `{ "token": "..." }`.
2. **GET Commande** → appelle `GET /api/orders/[token]`.
3. **SET champs reçu** (Code) → construit CLIENT_NAME, ORDER_ID, DATE, ITEMS, TOTAL, etc.
4. **Copy template Doc** (Google Drive) → copie le document template.
5. **Update document** (Google Docs) → remplace tous les `{{PLACEHOLDER}}`.
6. **Download as PDF** (Google Drive) → télécharge le Doc en PDF.
7. **Upload PDF to app** (HTTP Request) → envoie le PDF à l’API pour stockage et affichage client.
8. **Envoyer email (Guylian)** → envoie le PDF en pièce jointe.
9. **Respond to Webhook** → répond au caller.

**À faire après import :**

- Créer un **Google Doc** « Template Reçu » avec le texte et les placeholders. Pour le **tableau des articles**, mettre sur deux lignes :
  1. En-tête (avec tabulations entre les mots) : **Article	Qté	P.U.	Total**
  2. Puis la balise : **{{ITEMS}}**  
  Le workflow remplace `{{ITEMS}}` par une ligne par article (Article [tab] Qté [tab] P.U. [tab] Total par ligne).
- Dans le nœud **Copy template Doc** : remplacer `ID_DU_DOC_TEMPLATE_GOOGLE` par l’ID du document (dans l’URL du Doc : `.../d/XXXXX/...`).
- Configurer les **credentials** : Google Drive OAuth2, Google Docs OAuth2, SMTP (pour l’email).
- Dans le nœud **GET Commande** : remplacer l’URL par celle de ton app (prod : `https://dalcielo.fr`, local : ton URL ngrok).
- Dans le nœud **Upload PDF to app** : remplacer `YOUR-APP-URL` par la même URL que GET Commande ; configurer l’en-tête `x-receipt-secret` avec la valeur de `RECEIPT_UPLOAD_SECRET` (définie dans `.env` de l’app). En n8n tu peux utiliser une variable d’environnement `RECEIPT_UPLOAD_SECRET` si elle est définie.
- Côté app : exécuter la migration **010_add_receipt_pdf_url.sql** et définir **RECEIPT_UPLOAD_SECRET** dans `.env`.
