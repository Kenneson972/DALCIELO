# Audit sécurité – Zone admin (Pizza dal Cielo)

**Date :** février 2025  
**Périmètre :** `/admin`, `/api/admin/*`, authentification et déploiement (pré-o2switch)

---

## 1. Synthèse

| Critère | État | Commentaire |
|--------|------|-------------|
| Authentification admin | ✅ | PIN via header `x-admin-pin`, jamais en query |
| Rate limiting (auth) | ✅ | 15 échecs → blocage 15 min par IP |
| Protection des routes API | ✅ | Toutes les routes admin utilisent `requireAdminWithRateLimit` |
| Validation des entrées | ✅ | Zod sur PATCH (orders, products, stocks) |
| Stockage du secret côté client | ⚠️ | PIN en localStorage/sessionStorage après login (contrainte du flux actuel) |
| PIN en production | ⚠️ | Ne pas utiliser `NEXT_PUBLIC_ADMIN_PIN` ; 4 chiffres = espace faible |
| Headers de sécurité (CSP, HSTS, etc.) | ❌ | Absents dans `next.config.js` |
| Middleware / protection de route | ❌ | Pas de middleware ; la page `/admin` est accessible (écran de login) |
| Endpoint bot-notify | ⚠️ | Clé API en body, pas de rate limit |
| Webhook Stripe | ✅ | Signature vérifiée, body lu en `text()` |

---

## 2. Authentification admin

### 2.1 Mécanisme

- **Côté serveur** (`src/lib/adminAuth.ts`) :
  - PIN attendu : `ADMIN_PIN` (prod) ou `NEXT_PUBLIC_ADMIN_PIN` (dev) ou `'1234'` en dev uniquement si rien n’est défini.
  - Vérification : header HTTP `x-admin-pin` comparé au PIN attendu (égalité stricte).
  - Pas de PIN en query string → pas d’exposition dans logs / Referer.

- **Côté client** (`src/app/admin/page.tsx` et composants admin) :
  - Après succès sur `/api/admin/me`, le PIN est stocké en **localStorage** (`admin_pin`) et **sessionStorage** (`admin_pin`), et un flag `admin_auth` en localStorage.
  - Chaque requête vers `/api/admin/*` envoie `x-admin-pin` avec ce PIN.

### 2.2 Points d’attention

1. **Stockage du PIN en clair**  
   Une fois connecté, le PIN est en clair dans le stockage du navigateur. C’est une contrainte du design actuel (pas de session serveur). À accepter en connaissance de cause ; en cas de machine partagée, déconnexion = vider stockage (à faire côté UI si ce n’est pas déjà le cas).

2. **Production**  
   En production, ne **pas** définir `NEXT_PUBLIC_ADMIN_PIN` pour éviter que le PIN soit inclus dans le bundle client. Utiliser uniquement `ADMIN_PIN` (côté serveur). L’utilisateur saisit le PIN dans le formulaire ; il est alors stocké en mémoire / stockage comme aujourd’hui.

3. **Force du PIN (4 chiffres)**  
   Le champ est limité à 4 chiffres (`maxLength={4}`) → 10 000 combinaisons. Avec 15 tentatives / minute puis blocage 15 min, un brute force est ralenti mais pas impossible.  
   **Recommandation :** en production, autoriser un PIN plus long (6–8 chiffres) ou un mot de passe, et adapter `getExpectedAdminPin()` et le formulaire.

---

## 3. Rate limiting

- **Implémentation** : en mémoire dans `adminAuth.ts` (Map `failureCountByIp`).
- **Règles** : 15 échecs (401) dans une fenêtre de 1 minute → blocage 15 minutes pour l’IP.
- **Appliqué** : sur toutes les routes qui utilisent `requireAdminWithRateLimit` (me, orders, orders/[id], validate, products, products/[id], products/seed, stocks, stocks/[item_id], stocks/seed).

**Limitation :** en déploiement multi-instances (plusieurs processus/workers), le rate limit n’est pas partagé (chaque instance a sa propre Map). Sur o2switch avec un seul process Node, le comportement reste cohérent. Pour une future montée en charge, envisager un store partagé (Redis, etc.).

---

## 4. Routes API admin

### 4.1 Liste et protection

| Route | Méthode | Auth | Validation |
|-------|---------|------|------------|
| `/api/admin/me` | GET | ✅ | - |
| `/api/admin/orders` | GET | ✅ | `filter` (allowlist) |
| `/api/admin/orders/[id]` | PATCH | ✅ | Zod (status, refusal_reason, etc.) |
| `/api/admin/validate` | POST | ✅ | order.id + logique métier |
| `/api/admin/products` | GET | ✅ | - |
| `/api/admin/products` | (autres) | - | - |
| `/api/admin/products/[id]` | PATCH | ✅ | Zod (champs produit) |
| `/api/admin/products/seed` | POST | ✅ | - |
| `/api/admin/stocks` | GET/PATCH | ✅ | - |
| `/api/admin/stocks/[item_id]` | PATCH | ✅ | Zod + `item_id` (longueur) |
| `/api/admin/stocks/seed` | POST | ✅ | - |
| `/api/admin/bot-notify` | POST | Clé API (body) | Pas de rate limit |

Aucune route admin métier n’est exposée sans contrôle d’auth (sauf `bot-notify`, protégé par clé).

### 4.2 Endpoint `/api/admin/bot-notify`

- Utilisé par n8n après création de commande.
- Auth : `N8N_ADMIN_API_KEY` envoyée dans le body (`apiKey`).
- Pas de rate limiting → risque de brute force si l’URL est découverte.  
**Recommandation :** garder `N8N_ADMIN_API_KEY` longue et aléatoire ; optionnellement ajouter un rate limit par IP (ex. 60 req/min) pour les réponses 401.

### 4.3 IDOR / autorisation

- **Orders** : les identifiants de commande viennent du dashboard (liste déjà filtrée par l’utilisateur connecté). Pas de contrôle “cette commande appartient à X” car toutes les commandes sont admin. Pas d’IDOR métier.
- **Products / Stocks** : IDs / `item_id` validés (types, longueurs) ; pas de contrôle supplémentaire nécessaire pour un back-office unique.

---

## 5. Validation des entrées

- **PATCH orders [id]** : schéma Zod avec statuts autorisés, champs optionnels (refusal_reason, etc.).
- **PATCH products [id]** : Zod (nom, slug, prix, catégorie, etc.).
- **PATCH stocks [item_id]** : Zod (quantity, min_threshold, adjust, etc.) + `item_id` limité en longueur.
- **POST validate** : order.id requis, commande chargée depuis la BDD ; montant Stripe dérivé de la BDD, pas du client.

Pas de concaténation SQL directe ; Supabase/client utilisé avec paramètres. Pas de risque d’injection identifié dans la zone admin.

---

## 6. Page `/admin` et exposition

- **Accès** : la route `/admin` est publique (pas de middleware). Elle affiche l’écran de login puis le dashboard si le PIN est valide. Comportement acceptable pour un back-office (pas de données sensibles sans auth).
- **Données sensibles** : aucune donnée sensible (liste commandes, etc.) n’est rendue sans appel API ; ces appels sont protégés par le PIN.
- **robots.txt** : `disallow: ['/admin/', '/api/', '/order/']` → les crawlers sont découragés d’indexer l’admin et les API.

---

## 7. Headers de sécurité (manquants)

Aucun header de sécurité n’est défini dans `next.config.js` (ni dans un middleware). Pour la mise en production (o2switch ou autre) :

- **Strict-Transport-Security (HSTS)** : forcer HTTPS.
- **X-Content-Type-Options: nosniff** : limiter le MIME sniffing.
- **X-Frame-Options: SAMEORIGIN** (ou DENY) : limiter le clickjacking.
- **Referrer-Policy** : ex. `strict-origin-when-cross-origin`.
- **Content-Security-Policy (CSP)** : restreindre `script-src`, `connect-src`, etc.

**Recommandation :** ajouter ces headers en production (via `next.config.js` ou, sur o2switch, via `.htaccess` / config serveur si le rendu passe par un reverse proxy).

---

## 8. Déploiement o2switch (pré-déploiement)

### 8.1 Variables d’environnement

- **À définir côté serveur (jamais en `NEXT_PUBLIC_*` pour les secrets)** :  
  `ADMIN_PIN`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `N8N_ADMIN_API_KEY`, `N8N_CHATBOT_WEBHOOK_URL`, `N8N_ORDER_NOTIFY_WEBHOOK_URL`.
- **Autorisées en public si besoin** : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_APP_URL`.
- Vérifier que `.env` / `.env.local` ne sont **jamais** commités (déjà le cas si on suit `.env.example`).

### 8.2 HTTPS

Sur o2switch, s’assurer que le site est servi en HTTPS et que les redirections HTTP → HTTPS sont actives (idéalement avec HSTS une fois les headers ajoutés).

### 8.3 Webhook Stripe

- URL de webhook à configurer dans le dashboard Stripe (ex. `https://votredomaine.fr/api/webhooks/stripe`).
- Vérification de signature déjà en place (`stripe.webhooks.constructEvent` avec body en `text()`). Conserver `STRIPE_WEBHOOK_SECRET` propre à cet environnement.

---

## 9. Checklist avant mise en production

- [ ] **ADMIN_PIN** défini en production (longueur ≥ 6 chiffres recommandée), **sans** `NEXT_PUBLIC_ADMIN_PIN`.
- [ ] Aucune clé secrète (Stripe, Supabase, n8n) en variable `NEXT_PUBLIC_*`.
- [ ] Headers de sécurité (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, CSP) activés (Next ou serveur).
- [ ] Site accessible uniquement en HTTPS.
- [ ] Webhook Stripe configuré avec la bonne URL et le bon secret.
- [ ] Optionnel : renforcer le PIN (6–8 chiffres ou mot de passe) et adapter le formulaire admin.
- [ ] Optionnel : rate limit léger sur `POST /api/admin/bot-notify` (par IP) pour limiter les tentatives de brute force sur la clé.

---

## 10. Résumé des actions recommandées

| Priorité | Action |
|----------|--------|
| Haute | Définir **ADMIN_PIN** en prod (sans NEXT_PUBLIC_). |
| Haute | Ajouter les **headers de sécurité** (HSTS, nosniff, X-Frame-Options, Referrer-Policy, CSP) avant ou au déploiement. |
| Moyenne | Renforcer le **PIN** (6–8 chiffres ou mot de passe) et adapter le champ + `getExpectedAdminPin()` si besoin. |
| Basse | Rate limit sur **bot-notify** (par IP) pour les 401. |
| Basse | Documenter la déconnexion admin (vider `admin_pin` / `admin_auth` du stockage) si pas déjà clair dans l’UI. |

L’ensemble de la zone admin est déjà bien protégé (auth, rate limit, validation). Les principaux gains avant déploiement sur o2switch sont : **secrets correctement configurés** et **headers de sécurité** activés en production.
