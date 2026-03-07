# Audit de sécurité – Projet entier (Pizza dal Cielo)

**Date** : 9 février 2025  
**Périmètre** : Application Next.js (front + API + admin + Stripe + MySQL)  
**Référence** : Règles Karibloom, bonnes pratiques OWASP (entrées, auth, secrets, injection).

---

## 1. Synthèse

| Domaine              | État global | Points à traiter |
|----------------------|-------------|------------------|
| Admin                | ✅ Renforcé | Session cookie (optionnel) |
| API commandes        | ✅ Correct  | Rate limit POST, limites items |
| API Stripe / webhook | ✅ Corrigé  | Webhook + validate mettent à jour MySQL |
| Données / env        | ✅ Correct  | Pas de secrets en dur côté client |
| Formulaire contact   | N/A         | Pas d’API (submit désactivé) |
| Exposition / XSS     | ✅ Raisonnable | CSP à renforcer en prod |

---

## 2. Admin (déjà audité)

- **Auth** : PIN validé côté serveur via `GET /api/admin/me`, plus de PIN dans le bundle. `ADMIN_PIN` en prod uniquement.
- **Rate limiting** : 15 échecs / 1 min par IP → 429 pendant 15 min sur toutes les routes admin.
- **Validate** : Montant Stripe pris depuis la BDD uniquement (ordre chargé par `order.id`).
- **Stocks / réservations** : Validation Zod, `requireAdminWithRateLimit` sur toutes les routes.

Voir `docs/AUDIT_SECURITE_ADMIN.md` pour le détail.

---

## 3. API commandes (POST /api/orders)

- **Public** : Route volontairement sans auth (création commande par le client).
- **Validation** : `client_name` (min 2), `client_phone` (min 6), `type_service` (enum), `items` (array non vide), `total` (nombre ≥ 0), `status` (enum). Pas de schéma Zod ; limites de taille (ex. `items.length`, taille des strings) non explicites → risque DoS (très gros body). **Recommandation** : limiter `items.length` (ex. ≤ 50) et longueur max des champs texte (ex. 500 caractères).
- **Injection** : Paramètres passés en requêtes préparées (MySQL) via `ordersStore` → pas d’injection SQL directe.
- **Rate limiting** : Aucun sur POST /api/orders. **Recommandation** : rate limit par IP (ex. 10 créations / minute) pour limiter le spam de commandes.

---

## 4. API suivi commande (GET /api/orders/[token])

- **Public** : Accès par token (UUID) uniquement ; pas de liste des commandes.
- **Fuite d’info** : 404 si token inconnu (comportement normal). Pas de détail excessif en prod dans les réponses d’erreur (message générique si 500).
- **Cache** : `Cache-Control: no-store` déjà posé → pas de cache du détail commande.

---

## 5. Stripe

### 5.1 Création du lien de paiement (/api/admin/validate)

- Protégé par `requireAdminWithRateLimit`.
- Ordre et montant pris depuis MySQL (`getOrderById`), pas depuis le body → **sécurisé**.

### 5.2 Webhook Stripe (POST /api/webhooks/stripe)

- **Signature** : Vérification avec `stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)` → **correct**.
- **Problème fonctionnel** : En cas de `checkout.session.completed`, le webhook met à jour **uniquement Supabase** (`supabaseAdmin.from('orders').update({ status: 'paid' })`). Les commandes principales sont en **MySQL** (admin, suivi, liste). Donc après paiement Stripe, le statut **paid** n’est pas reporté en MySQL → incohérence métier et risque de double traitement.
- **Correction** : Appeler `updateOrderStatus(orderId, 'paid')` depuis `@/lib/ordersStore` dans le webhook (et éventuellement garder la mise à jour Supabase si utilisée en parallèle).
- **Statut** : Corrigé. Le webhook appelle désormais `ordersStore.updateOrderStatus(orderId, 'paid')` avant Supabase.

### 5.3 Validate : statut waiting_payment

- Après création du Payment Link, le code met à jour **uniquement Supabase** en `waiting_payment`, pas MySQL. Les commandes affichées en admin viennent de MySQL → le statut peut rester `pending_validation` en BDD. **Recommandation** : mettre à jour aussi MySQL via `ordersStore.updateOrderStatus(orderFromDb.id, 'waiting_payment')`.
- **Statut** : Corrigé. La route validate appelle désormais `ordersStore.updateOrderStatus(orderFromDb.id, 'waiting_payment')` avant Supabase.

---

## 6. Chat (POST /api/chat)

- **Public** : Pas d’auth (bot grand public).
- **Contenu** : Réponses rule-based à partir de `message` (string). Pas de rendu HTML côté serveur ; le client affiche la réponse en texte → risque XSS limité si le client n’injecte pas du HTML.
- **Rate limiting** : Aucun. **Recommandation** : rate limit par IP pour éviter l’abus (ex. 30 req/min).

---

## 7. Réservations (API admin + n8n)

- **GET /api/admin/reservations** : Protégé par `requireAdminWithRateLimit`.
- **POST /api/admin/reservations** : Protégé par `N8N_ADMIN_API_KEY` (header `x-api-key`) pour les créations depuis n8n. Schéma Zod sur le body.
- **PATCH /api/admin/reservations/[id]** : Protégé par `requireAdminWithRateLimit`, paramètres Next 15 gérés en Promise.

---

## 8. Variables d’environnement

- **Secrets serveur** : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DB_*`, `ADMIN_PIN`, `N8N_ADMIN_API_KEY` → à ne jamais exposer côté client ; utilisés uniquement dans des routes API ou `lib` serveur. **OK**.
- **Client** : `NEXT_PUBLIC_*` (Stripe publishable, App URL, Supabase URL/anon) → prévus pour être publics. Plus de `NEXT_PUBLIC_ADMIN_PIN` utilisé dans le code client après refactor.
- **.env.example** : Documente `ADMIN_PIN` et déconseille `NEXT_PUBLIC_ADMIN_PIN` en prod.

---

## 9. Base de données (MySQL)

- **Connexion** : Pool via `getDbPool()` (db.ts), variables `DB_*`. Pas de credentials en dur.
- **Requêtes** : Utilisation de requêtes paramétrées (ordersStore, stocksStore, reservationsStore) → pas d’injection SQL.
- **Erreurs** : Messages d’erreur détaillés uniquement en `NODE_ENV === 'development'` dans les réponses API.

---

## 10. Formulaire contact

- Le formulaire de la page Contact fait `onSubmit={(e) => e.preventDefault()}` : **aucune soumission serveur**. Pas d’API contact à auditer. Pour une future API email (ex. Resend), prévoir validation, rate limiting et sanitization.

---

## 11. Checklist déploiement (sécurité)

- [ ] `ADMIN_PIN` défini en prod (sans `NEXT_PUBLIC_*`).
- [ ] `STRIPE_WEBHOOK_SECRET` et `STRIPE_SECRET_KEY` configurés ; webhook Stripe pointe vers l’URL de prod.
- [x] Webhook Stripe met à jour **MySQL** (ordersStore) en `paid` après `checkout.session.completed`.
- [x] Validate met à jour **MySQL** en `waiting_payment` après création du lien Stripe.
- [ ] Variables sensibles (DB, Stripe, ADMIN_PIN, N8N) jamais commitées.
- [ ] Headers de sécurité (CSP, X-Frame-Options, etc.) configurés au niveau hébergeur / Vercel.
- [ ] Optionnel : rate limit sur POST /api/orders et POST /api/chat.

---

## 12. Résumé des actions recommandées

| Priorité | Action |
|----------|--------|
| ~~Haute~~ | ~~Webhook Stripe / Validate MySQL~~ → Fait. |
| Moyenne  | POST /api/orders : limite sur `items.length` et longueur des champs ; rate limit par IP. |
| Moyenne  | POST /api/chat : rate limit par IP. |
| Basse    | Session admin en cookie HttpOnly (remplacer envoi du PIN en header). |
| Basse    | CSP et headers de sécurité en production. |

---

*Audit projet entier – à mettre à jour après changements majeurs.*
