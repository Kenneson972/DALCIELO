# Audit – Tunnel de vente et validation WhatsApp

**Projet** : Pizza dal Cielo  
**Date** : 9 février 2025  
**Périmètre** : Panier → commande → validation admin → WhatsApp → paiement Stripe → suivi client

---

## 1. Schéma du tunnel de vente

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  CLIENT (site web)                                                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  1. Découverte    → Accueil, Menu, Customize, CieloBot                                │
│  2. Panier        → CartDrawer (Zustand + localStorage)                               │
│  3. Formulaire    → Nom, Téléphone WhatsApp, Click & Collect / Livraison, Heure       │
│  4. Envoi         → POST /api/orders → Supabase (table orders)                        │
│  5. Redirection   → /order/[token] (suivi en direct)                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  ADMIN (iPad)                                                                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  6. Liste          → GET /api/admin/orders (filtres : today, all, status)             │
│  7. Validation     → Bouton « Valider » → POST /api/admin/validate                    │
│                      → Stripe Payment Link créé, statut = waiting_payment             │
│  8. Envoi WhatsApp → Bouton « Envoyer le lien par WhatsApp »                          │
│                      → Ouvre wa.me/CLIENT_PHONE avec message pré-rempli               │
│  9. Cuisine        → Statuts : in_preparation → ready → completed                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  CLIENT (suite)                                                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  10. Réception     → Page /order/[token] se rafraîchit (poll 10s)                     │
│                      → Statut waiting_payment + bouton « Payer maintenant »           │
│  11. Paiement      → Clic lien Stripe → paiement sécurisé                             │
│  12. Webhook       → Stripe envoie checkout.session.completed                         │
│                      → Statut = paid (Supabase)                                       │
│  13. Notifications → Admin envoie WhatsApp (prépa, prête, retard)                     │
│  14. Récupération  → Client vient chercher (Click & Collect) ou livraison             │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Mode de validation dans le dashboard

### 2.1 Authentification admin

| Élément | Détail |
|---------|--------|
| **Protection** | Page `/admin` protégée par code PIN à 4 chiffres |
| **Variables d’env** | `ADMIN_PIN` (prod) ou `NEXT_PUBLIC_ADMIN_PIN` (dev) ; fallback `1234` uniquement en dev |
| **Stockage** | PIN conservé dans `localStorage` + `sessionStorage` après connexion réussie |
| **En-tête API** | `x-admin-pin` envoyé sur toutes les requêtes admin |
| **Rate limiting** | 15 échecs d’auth → blocage 15 min par IP |
| **Déconnexion** | Bouton « Déconnexion » dans le menu mobile ; efface auth et PIN |

---

### 2.2 Structure du dashboard

Le dashboard admin propose 6 vues via la sidebar (ou le menu mobile sur téléphone) :

| Vue | Rôle |
|-----|------|
| **Vue d’ensemble** | KPIs (CA du jour, commandes payées, en cours, temps moyen), file d’attente four, alertes stock, graphiques |
| **Commandes** | Liste des commandes avec actions rapides (validation incluse) |
| **Mode Cuisine** | Vue simplifiée des commandes `paid` et `in_preparation` |
| **Menu & Produits** | Gestion des pizzas et produits (Supabase) |
| **Stocks** | Gestion des stocks ingrédients |
| **Analytics** | CA 7j, commandes 7j, **taux de validation**, top pizzas, distribution des statuts |

Le badge « Commandes » affiche le nombre de commandes actives (`pending_validation`, `paid`, `in_preparation`).

---

### 2.3 Où et comment se fait la validation

**Lieu** : Vue **Commandes** (sidebar → « Commandes »).

**Affichage des commandes**

1. **Filtres** : En cours (par défaut) | Toutes | Terminées  
   - *En cours* : `pending_validation`, `waiting_payment`, `paid`, `in_preparation`, `ready`, `in_delivery`  
   - *Terminées* : `completed`, `cancelled`, `refused`
2. **Recherche** : par nom ou numéro de téléphone
3. **Tri** : `pending_validation` en premier, puis par date décroissante

**Fiche commande (OrderCard)**

- Clic sur une carte → expansion pour voir le détail
- Informations : #ID (8 premiers caractères), statut (badge coloré), client, heure souhaitée, type de service, téléphone, total
- Les commandes en attente de validation ont une bordure jaune à gauche + badge **« Action requise »**

**Actions rapides (QuickActions)**

Les boutons dépendent du statut :

| Statut | Boutons affichés |
|--------|------------------|
| `pending_validation` | **Valider la commande** (vert) + **Refuser** (rouge) |
| `waiting_payment` | **Envoyer le lien de paiement par WhatsApp** (vert) |
| `paid` | **Commencer la préparation** (orange) |
| `in_preparation` | **Marquer comme prête** (vert) + **Signaler un retard** (jaune) |
| `ready` | **Marquer comme récupérée** (violet) |

Actions disponibles dans tous les cas : **Appeler** (tel:), **Message** (WhatsApp personnalisé).

---

### 2.4 Fonctionnement technique de la validation

1. L’admin ouvre la vue **Commandes**, filtre **En cours**.
2. Il repère les commandes avec le badge « À valider » ou « Action requise ».
3. Il clique sur la carte pour l’ouvrir.
4. Dans **Actions rapides**, il clique sur **« Valider la commande »**.
5. Le bouton passe en « Création du lien de paiement... » (spinner).
6. Appel à `POST /api/admin/validate` avec `{ order: { id } }` et en-tête `x-admin-pin`.
7. L’API :
   - Vérifie le PIN et le rate limit
   - Charge l’ordre en base (Supabase)
   - Vérifie le statut (`pending_validation` ou `waiting_payment`) et le montant
   - Crée un Price Stripe puis un Payment Link avec `orderId` dans les metadata
   - Met à jour la commande : statut `waiting_payment`, `payment_link` stocké
8. L’UI met à jour la carte en local (ou rafraîchit via `onStatusChange`).
9. Un nouveau bouton apparaît : **« Envoyer le lien de paiement par WhatsApp »**.

En cas d’erreur (ex. Stripe, BDD), un message d’erreur s’affiche sous le bouton.

---

### 2.5 Taux de validation (Analytics)

Dans **Analytics**, le KPI **« Taux validation »** est calculé sur les 7 derniers jours :

```
taux = (commandes non refusées / total commandes) × 100
```

Une commande est considérée comme « validée » si son statut n’est pas `refused` (pending_validation, waiting_payment, paid, in_preparation, ready, completed, cancelled comptent comme validées dans ce calcul).

---

## 3. Flux détaillé

### 3.1 Création de commande (client)

| Étape | Composant | Action |
|-------|-----------|--------|
| Panier | `CartDrawer` | Nom, téléphone, type service, heure souhaitée |
| Validation | `canSubmit` | Nom ≥ 2 caractères, téléphone ≥ 6, panier non vide |
| Envoi | `handleSubmit` | POST `/api/orders` avec `orderPayload` |
| Succès | | Redirige vers `/order/{token}` |
| Fallback API KO | | Essaie Supabase client (insert direct), puis localStorage |

**Validation API** : `client_name`, `client_phone`, `type_service` (click_collect/delivery), `items` (array non vide), `total` ≥ 0, `status` (enum). Pas de limite sur `items.length` ni longueur des champs.

---

### 3.2 Validation admin (Guylian)

| Étape | API / Composant | Action |
|-------|-----------------|--------|
| Liste | GET `/api/admin/orders` | Liste des commandes (filtres) |
| Valider | POST `/api/admin/validate` | Body : `{ order: { id } }` |
| Vérifications | `validate/route.ts` | Ordre chargé depuis BDD, montant = `orderFromDb.total`, statut pending_validation ou waiting_payment |
| Stripe | | Crée Price + Payment Link, metadata `orderId` |
| BDD | | `updateOrderStatus(id, 'waiting_payment', { payment_link })` |
| Réponse | | `{ paymentLink: url }` |

**Sécurité** : Montant Stripe basé uniquement sur la BDD (audit admin appliqué).

---

### 3.3 Envoi WhatsApp

| Action | Mécanisme | Remarque |
|--------|-----------|----------|
| Envoyer lien paiement | `getWhatsAppLink(order.client_phone, whatsappTemplates.paymentLink(...))` | Ouvre `wa.me/PHONE?text=MESSAGE` dans nouvel onglet |
| En préparation | Template `inPreparation` | Message avec heure estimée |
| Prête | Template `ready` | Invitation à venir récupérer |
| Retard | Template `delay` | Nouvelle heure + raison |
| Refus | Template `refused` | Raison du refus |

**Important** : L’envoi n’est pas automatisé. Guylian doit cliquer sur le bouton pour ouvrir WhatsApp avec le message pré-rempli, puis envoyer manuellement. Aucune API WhatsApp Business n’est utilisée.

---

### 3.4 Suivi client (/order/[token])

| Statut | Affichage | Comportement |
|--------|-----------|--------------|
| `pending_validation` | `PendingValidationView` | Animation, estimation file, FAQ |
| `waiting_payment` | Bouton « Payer maintenant » + « M'envoyer le lien par WhatsApp » | Lien Stripe cliquable ; son + vibration si nouveau |
| `paid` | « Paiement confirmé » | |
| `in_preparation` | « En préparation » | |
| `ready` | « Prête » + lien Maps | |
| `refused` / `cancelled` | Message + retour accueil | |

**Polling** : `load()` toutes les 10 s tant que le statut n’est pas final (refused, cancelled, completed).

---

## 4. Points forts

| Point | Détail |
|-------|--------|
| **Validation manuelle** | Guylian contrôle stocks et disponibilité avant paiement |
| **Montant sécurisé** | Total pris en BDD, pas côté client |
| **Templates WhatsApp** | Messages cohérents (lien paiement, prépa, prête, retard, refus) |
| **Double accès au lien** | Client peut payer via le site ou via le lien envoyé par WhatsApp |
| **Fallback** | En cas d’erreur API, fallback Supabase puis localStorage + message « contacter par WhatsApp » |
| **Estimations file** | `useQueueEstimate` + `/api/orders/queue-estimate` pour afficher un temps d’attente indicatif |
| **Webhook Stripe** | Signature vérifiée, statut `paid` mis à jour en BDD |

---

## 5. Points faibles et risques

### 5.1 [MOYEN] Envoi WhatsApp non automatisé

**Risque** : Guylian doit cliquer, copier le lien et envoyer. Oubli ou retard possible.

**Pistes** : Intégration WhatsApp Business API (Coût élevé, validation Meta) ou n8n avec script d’envoi automatique après validation.

---

### 5.2 [MOYEN] Redirection après paiement Stripe

**Risque** : Le Payment Link Stripe est créé sans `after_completion.redirect.url`. La page de succès affichée est celle par défaut Stripe, pas `/success` du site.

**Piste** : Ajouter dans `validate/route.ts` :
```ts
const paymentLink = await stripe.paymentLinks.create({
  line_items: [...],
  metadata: {...},
  after_completion: {
    type: 'redirect',
    redirect: {
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pizzadalcielo.vercel.app'}/success`,
    },
  },
})
```

---

### 5.3 [MOYEN] Pas de délai d’expiration du Payment Link

**Risque** : Le lien reste valide. Si la commande est refusée après coup, le client peut encore payer.

**Piste** : Utiliser des Checkout Sessions avec `expires_at` plutôt que des Payment Links, ou gérer un statut `expired` côté BDD et bloquer le webhook pour les commandes non `waiting_payment`.

---

### 5.4 [FAIBLE] « 15 minutes pour payer »

**Constat** : Le message « Vous avez 15 minutes » est affiché, mais aucune expiration technique n’est appliquée.

**Piste** : Soit implémenter une vraie expiration (Stripe ou BDD), soit adapter le message (« Validez le paiement dès réception du lien »).

---

### 5.5 [FAIBLE] Validation du numéro WhatsApp

**Constat** : Le téléphone est validé (longueur ≥ 6), mais pas le format (ex. +596...). Un mauvais numéro peut empêcher l’envoi du lien.

**Piste** : Normalisation côté client ou API (ex. `normalizePhone` comme pour les réservations).

---

### 5.6 [FAIBLE] Heure souhaitée optionnelle côté API

**Constat** : Le formulaire propose des créneaux, mais l’API accepte `heure_souhaitee` vide (`String(heure_souhaitee ?? '').trim()`).

**Piste** : Rendre l’heure obligatoire côté API si elle est obligatoire métier.

---

### 5.7 [MOYEN] Fallback Supabase client

**Constat** : En cas d’échec de POST `/api/orders`, le CartDrawer tente un insert via `supabase.from('orders')` (client anon). Avec RLS sur `orders` (accès via service_role), l’insert peut échouer.

**Piste** : Adapter la politique RLS ou documenter que le fallback Supabase peut ne pas fonctionner, le fallback principal restant le localStorage.

---

## 6. Recommandations prioritaires

| Priorité | Action |
|----------|--------|
| 1 | Configurer `after_completion.redirect` sur le Payment Link pour rediriger vers `/success` |
| 2 | Normaliser le numéro de téléphone (format +596) avant envoi à l’API et pour WhatsApp |
| 3 | Rendre `heure_souhaitee` obligatoire côté API si pertinent métier |
| 4 | Adapter le message « 15 minutes » ou implémenter une vraie expiration du lien |
| 5 | Tester le fallback (API KO) pour vérifier le comportement Supabase / localStorage |

---

## 7. Récapitulatif des statuts

| Statut | Côté client | Côté admin |
|--------|-------------|------------|
| `pending_validation` | Page attente + animation | Liste + boutons Valider / Refuser |
| `waiting_payment` | Bouton Payer + lien WhatsApp | Bouton « Envoyer lien par WhatsApp » |
| `paid` | Suivi | Bouton « Commencer la préparation » |
| `in_preparation` | Suivi | Boutons « Prête » / « Signaler retard » |
| `ready` | Suivi + Maps | Bouton « Récupérée » |
| `completed` | Fin | — |
| `refused` | Message refus | — |
| `cancelled` | Message annulation | — |

---

*Audit tunnel de vente et validation WhatsApp – Pizza dal Cielo*
