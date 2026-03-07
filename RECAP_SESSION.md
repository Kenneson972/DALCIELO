/# Récap Session — Pizza dal Cielo
**Stack :** Next.js 14 · TypeScript · Supabase · Stripe · n8n · Framer Motion

Ce document regroupe les récaps de sessions de développement. Chaque section est datée et peut indiquer l’outil utilisé (Claude Code, Cursor/Auto).

---

# Session du 9 février 2025 (Cursor / Auto)

**Focus :** Audit tunnel, refonte page d’accueil, transparence visuelle, carte Google Maps, avis TripAdvisor.

---

## 1. Audit tunnel de vente et validation WhatsApp

**Fichier créé :** `docs/AUDIT_TUNNEL_VENTE_WHATSAPP.md`

- Schéma du tunnel complet : client → panier → validation admin → paiement Stripe → suivi
- Mode de validation dans le dashboard : authentification PIN, structure des vues, QuickActions par statut
- Points forts et risques identifiés (redirection post-paiement, expiration lien, fallback)
- Recommandations prioritaires

---

## 2. PizzaSlider — Remplacement section « L’art de la pizza traditionnelle »

**Composant créé :** `src/components/sections/PizzaSlider.tsx`

- Slider auto (3 500 ms, transition 600 ms), pause au survol, swipe tactile, boucle infinie
- Affichage : 3 cartes desktop, 2 tablette, 1 mobile
- Chaque carte : photo, nom, prix, bouton « Commander » (ajout panier + ouverture tiroir)
- Données : `menuData.pizzas` ou Supabase `products` (type pizza)
- Intégré à la place de **AboutSection** sur l’index (Hero conservé)

**Événement `open-cart`** : listener dans `Header.tsx` pour ouvrir le panier depuis le slider.

---

## 3. Sections transparentes — Fond dégradé continu

**Objectif :** Laisser voir le fond orange/saumon sur toute la page.

- **MenuHighlight** : `bg-white` → `bg-transparent`, bloc principal → `bg-white/30 backdrop-blur-sm`
- **GallerySection** : suppression overlay `bg-cream/90`
- **ContactSection** : `bg-white` → `bg-transparent`, cartes → `bg-white/30 backdrop-blur-sm`
- Ajustements de contraste : `text-gray-600` → `text-[#3D2418]/90` pour lisibilité sur fond clair

---

## 4. Google Maps — Emplacement exact + affichage direct

- **Adresse mise à jour** dans `menuData.ts` : `146 Bd De La Pointes Des Négres`
- **Carte intégrée** sous la section « Prêt à commander » sur l’index
- **Requête Maps** : « Pizza Dal Cielo, 146 Bd De La Pointes Des Négres, Fort-de-France 97200 »
- Même carte sur la page `/contact` (remplacement du placeholder)
- Affichage automatique (pas de clic requis)

---

## 5. Suppression faux avis TripAdvisor

- **Hero** : suppression avatars (pravatar.cc) et badge « 5.0 sur TripAdvisor » → lien « Voir nos avis sur TripAdvisor »
- **WaitingCarousel** : fausse citation supprimée → lien vers TripAdvisor + bouton « Voir les avis »
- **AboutSection** : bloc 5.0 remplacé par lien vers TripAdvisor
- **menuData.ts** : ajout `socials.tripadvisor` avec l’URL officielle

---

## Fichiers modifiés (session 9 fév. 2025)

| Fichier | Action |
|---|---|
| `docs/AUDIT_TUNNEL_VENTE_WHATSAPP.md` | **Nouveau** — audit tunnel + mode validation |
| `src/components/sections/PizzaSlider.tsx` | **Nouveau** — slider pizzas |
| `src/components/sections/ContactSection.tsx` | Transparence · Carte Google Maps |
| `src/components/sections/MenuHighlight.tsx` | Transparence · Glassmorphism |
| `src/components/sections/GallerySection.tsx` | Transparence |
| `src/components/sections/Hero.tsx` | Lien TripAdvisor (remplacement faux avis) |
| `src/components/sections/AboutSection.tsx` | Lien TripAdvisor |
| `src/components/order/WaitingCarousel.tsx` | Lien TripAdvisor |
| `src/components/layout/Header.tsx` | Listener `open-cart` |
| `src/app/page.tsx` | PizzaSlider · flux pizzas |
| `src/app/contact/page.tsx` | Carte Google Maps |
| `src/data/menuData.ts` | Adresse exacte · `socials.tripadvisor` |

---

# Session du 22 février 2026 (Claude Code)

> **Commentaire :** Session axée sur l’automatisation du tunnel de commande et l’intégration CieloBot ↔ n8n. Tunnel 100 % côté client, sans étape WhatsApp manuelle pour le paiement. Notifications en temps réel (admin + client) et refus structurés. Très cohérent avec l’audit de la session du 9 fév. 2025.

---

## 1. Tunnel de commande — Suppression WhatsApp + Refus structuré

### Problème
Le tunnel de paiement dépendait de WhatsApp à chaque étape : Guylian devait manuellement envoyer un lien Stripe au client, et les refus utilisaient un `window.prompt` basique (non mobile-friendly, pas de raisons prédéfinies).

### Ce qui a changé

#### `src/components/admin/QuickActions.tsx`
- **Suppression** du bouton WhatsApp pour la validation et le refus
- **Ajout** d'un modal de refus avec 6 raisons prédéfinies :
  - Stock insuffisant
  - Fermeture exceptionnelle
  - Zone de livraison hors périmètre
  - Heure de commande trop tardive
  - Produit indisponible ce soir
  - Autre (champ libre)
- **Statut `waiting_payment`** : remplacé le bouton WhatsApp par un encart vert _"Lien de paiement actif sur la page client"_ + bouton discret _"Voir le lien Stripe"_
- **WhatsApp conservé uniquement** pour les notifications opérationnelles (pizza en préparation, pizza prête, retard)

#### `src/components/order/OrderTrackingClient.tsx`
- **Bouton de paiement** amélioré : plus grand, plus visible (`text-xl`, `py-5`, ombre, emoji 💳)
- **Statut `refused`** : affiche la raison du refus dans un encart rouge + bouton _"Commander à nouveau"_
- **Statut `cancelled`** : bouton _"Commander à nouveau"_
- **Statut `completed`** : encart _"Vous avez apprécié ?"_ + bouton _"Commander à nouveau"_
- **Reorder** : pré-remplit le panier localStorage (`pizza-cart-storage`) avec les mêmes articles et redirige vers `/menu`
- **Section "Que se passe-t-il maintenant ?"** masquée pour les statuts terminaux (completed, refused, cancelled)

### Résultat
Le tunnel est 100% automatique côté client. La page de suivi se met à jour toutes les 10 secondes. Aucun échange WhatsApp requis pour payer.

---

## 2. CieloBot n8n — Amélioration du bot

### Problème
Le bot avait plusieurs bugs et lacunes :
- Mauvais URL (`pizzadalcielo.vercel.app`)
- Message post-commande mentionnait encore WhatsApp pour le paiement
- `delivery_address` absent du parsing
- L'Error Handler était dans le même tableau `main[0]` que Format Order Response (les deux s'exécutaient sur succès)
- Numéros de téléphone non normalisés correctement (ex : `696XXXXXX` sans `0`)

### Ce qui a changé dans `n8n/CieloBot - Pizza dal Cielo.json`

#### Prompt système (AI Agent)
Réécriture complète avec :
- Adresse complète : _146 Bd De La Pointes Des Nègres, Quartier Bellevue, Fort-de-France, Martinique 97200_
- Menu complet avec IDs, prix et catégories exacts tirés de `menuData.ts`
- Section **TUNNEL DE PAIEMENT** : explication que le paiement se fait 100% sur la page de suivi, jamais via WhatsApp
- Créneaux horaires explicites : 18:00, 18:30, ..., 22:00
- Normalisation téléphone : `696XXXXXX` → `+596696XXXXXX` / `0696XXXXXX` → `+596696XXXXXX`
- Exemples JSON pour click & collect et livraison
- Info four : 4 pizzas max, ~15 min par fournée

#### Parse Response (Code node)
- Message de succès : _"Surveillez votre page de suivi, le lien de paiement y apparaîtra automatiquement"_ (plus de mention WhatsApp)
- Normalisation robuste du téléphone et de l'heure
- `delivery_address: null` pour click & collect
- Total arrondi au centime : `Math.round(total * 100) / 100`

#### Format Order Response (Code node)
- Construction du lien de suivi : `https://dalcielo.fr/order/${token}`
- Message enrichi : `"🔗 Suivre votre commande : [lien]"`
- Gestion différenciée DB_UNAVAILABLE vs autres erreurs

#### Correction du bug de connexion
- L'Error Handler était connecté en `main[0]` (même sortie que Format Order Response) → les deux s'exécutaient sur chaque succès
- Corrigé : seul Format Order Response est dans `main[0]`
- `continueOnFail: true` sur le nœud Create Order

---

## 3. CieloBot → Dashboard Admin — Notification nouvelle commande

### Problème
Quand CieloBot créait une commande, Guylian n'était pas notifié en temps réel sur le dashboard.

### Architecture mise en place

```
CieloBot crée une commande (Supabase)
        ↓
n8n "Format Order Response" → envoie en parallèle :
  ├─ "Respond (Order)"   → client reçoit son lien de suivi
  └─ "Notify Admin"      → POST /api/admin/bot-notify
                                ↓
                     Dashboard poll toutes les 10s
                                ↓
                     Détecte nouveau pending_validation
                                ↓
               🔔 Son + Toast "Nouvelle commande !"
```

### Fichiers créés / modifiés

#### `src/app/api/admin/bot-notify/route.ts` _(nouveau)_
- Endpoint POST sécurisé par `N8N_ADMIN_API_KEY`
- Reçoit `{ apiKey, orderId, trackingUrl, success }` depuis n8n
- Retourne `{ ok: true }` — le dashboard détecte automatiquement via son polling

#### `src/app/admin/page.tsx`
- **Refs** : `prevPendingIdsRef` (Set des IDs déjà vus) + `isFirstLoadRef` (évite les fausses alertes au chargement)
- **Dans `loadData`** : compare les commandes `pending_validation` entrantes avec le Set précédent
- **Si nouvelle commande détectée** :
  - Joue `/sounds/notification.mp3`
  - Affiche un toast Framer Motion (8 secondes) avec nom du client + heure souhaitée
  - Bouton _"Voir les commandes →"_ switch directement sur la vue Orders
- **Toast** : coin inférieur droit sur mobile, coin supérieur droit sur tablette/desktop

#### `n8n/CieloBot - Pizza dal Cielo.json`
- Nouveau nœud **"Notify Admin"** (`continueOnFail: true`) — POST `/api/admin/bot-notify`
- Connecté en parallèle avec "Respond (Order)" dans `main[0]` de "Format Order Response"

---

## 4. Notification bot au client — Après validation Guylian

### Problème
Quand Guylian validait une commande, le client ne recevait aucun signal sauf si sa page de suivi était ouverte.

### Architecture mise en place

```
Guylian clique "Valider" (admin dashboard)
        ↓
PATCH /api/admin/orders/[id] → status: waiting_payment
        ↓
Fire-and-forget → POST N8N_ORDER_NOTIFY_WEBHOOK_URL
        ↓
n8n "Order Validated Webhook" reçoit les données
        ↓
"Format Validation Message" → construit le message :
  "Bonne nouvelle ! Guylian a validé votre commande.
   💳 Lien de paiement : dalcielo.fr/order/XXX"
        ↓
"Send WhatsApp Confirmation" → API WhatsApp Business
```

### Fichiers modifiés

#### `src/app/api/admin/orders/[id]/route.ts`
- Après `updateOrderStatus`, si `status === 'waiting_payment'` et `N8N_ORDER_NOTIFY_WEBHOOK_URL` défini :
  - Fire-and-forget POST vers le webhook n8n
  - Payload : `{ event, client_name, client_phone, token, payment_link, heure_souhaitee, tracking_url }`
  - `AbortSignal.timeout(5000)` + `.catch(() => {})` — échec silencieux, ne bloque jamais la validation

#### `n8n/CieloBot - Pizza dal Cielo.json`
- Nouveau nœud **"Order Validated Webhook"** (path: `order-validated`) — reçoit la notification
- Nouveau nœud **"Format Validation Message"** — construit le message de confirmation
- Nouveau nœud **"Send WhatsApp Confirmation"** (`continueOnFail: true`) — envoie via `$env.WHATSAPP_SEND_URL`

#### `.env.example`
```env
N8N_ADMIN_API_KEY=your-strong-secret
N8N_ORDER_NOTIFY_WEBHOOK_URL=https://ton-n8n/webhook/order-validated
```

---

## Variables d'environnement à configurer

### `.env.local` (site Next.js)
| Variable | Rôle |
|---|---|
| `N8N_ADMIN_API_KEY` | Secret partagé entre n8n et `/api/admin/bot-notify` |
| `N8N_ORDER_NOTIFY_WEBHOOK_URL` | URL du webhook n8n `order-validated` |
| `APP_URL` | `https://dalcielo.fr` (utilisé pour construire les liens de suivi) |

### Variables n8n (Settings → Variables)
| Variable | Rôle |
|---|---|
| `N8N_ADMIN_API_KEY` | Même secret que le site |
| `APP_URL` | `https://dalcielo.fr` |
| `WHATSAPP_SEND_URL` | URL de l'API de ton fournisseur WhatsApp (360dialog, Twilio, Meta…) |
| `WHATSAPP_API_KEY` | Clé API WhatsApp |

> **Note :** Sans WhatsApp Business API, le nœud "Send WhatsApp Confirmation" échoue silencieusement (`continueOnFail: true`). Le reste du tunnel fonctionne normalement.

---

## Fichiers modifiés (récap global)

| Fichier | Action |
|---|---|
| `src/components/admin/QuickActions.tsx` | Suppression WhatsApp tunnel · Modal refus structuré |
| `src/components/order/OrderTrackingClient.tsx` | Bouton paiement amélioré · Raison refus · Reorder |
| `src/app/api/admin/bot-notify/route.ts` | **Nouveau** — endpoint notification bot→dashboard |
| `src/app/api/admin/orders/[id]/route.ts` | Appel webhook n8n après validation |
| `src/app/admin/page.tsx` | Détection nouvelle commande · Son · Toast animé |
| `n8n/CieloBot - Pizza dal Cielo.json` | Prompt · Parse · Format · Notify Admin · Order Validated |
| `.env.example` | Nouvelles variables N8N |

---

## État du build (22 fév. 2026)

```
✅ 61 routes compilées
✅ TypeScript strict — zéro erreur
✅ Linting OK
```

---

# Synthèse des deux sessions

| Session | Orientation |
|---|---|
| **22 fév. 2025** CURSOR| Audit + UX page d’accueil (slider pizzas, transparence, Maps, avis TripAdvisor) |
| **22 fév. 2026** CLAUDE | Automatisation tunnel (suppression WhatsApp, n8n, notifications admin/client) |

Les deux sessions se complètent : l’audit documente le flux, la session 22 fév. l’optimise côté backend/n8n.
