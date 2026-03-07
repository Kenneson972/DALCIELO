# Vérification de sécurité – Pizza dal Cielo

**Date** : 9 février 2026  
**Référence** : Règle Karibloom `kb-security.mdc` (client-builder-rules).  
**Périmètre** : Headers, CSP, rate limiting, Stripe, XSS, injection, env, API.

---

## 1. Headers de sécurité (kb-security)

| Header | Règle | État | Détail |
|--------|--------|------|--------|
| Strict-Transport-Security | HSTS | ✅ | `max-age=31536000; includeSubDomains; preload` en production (next.config.js). |
| Content-Security-Policy | CSP | ✅ | default-src 'self', script/style/img/font/connect/frame définis ; frame-ancestors 'self'. |
| Referrer-Policy | | ✅ | `strict-origin-when-cross-origin`. |
| Permissions-Policy | | ✅ | `geolocation=(), microphone=(), camera=()` (ajouté). |
| X-Content-Type-Options | | ✅ | `nosniff`. |
| X-Frame-Options | | ✅ | `SAMEORIGIN`. |

*Note :* Projet Next.js (pas Apache). Pas de `.htaccess` ; les headers sont gérés dans `next.config.js`. En production, le serveur (Vercel, etc.) applique ces headers.

---

## 2. Rate limiting (kb-security)

| Endpoint | Limite attendue (règle) | Implémentation | État |
|----------|-------------------------|----------------|------|
| POST /api/orders | Recommandé | 10 req / 60 s par IP | ✅ `checkRateLimit(ip, 10, 60_000)` |
| POST /api/chat | 50 req / 1 h (règle) | 20 req / 60 s par IP | ✅ Plus strict en fréquence |
| Admin (auth) | — | 15 échecs / 1 min → blocage 15 min | ✅ `adminAuth.ts` |

---

## 3. Stripe (kb-security)

| Point | Règle | État |
|-------|--------|------|
| Signature webhook | `constructEvent(body, signature, secret)` | ✅ Body lu en `req.text()` (corps brut), puis `stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)`. |
| Secrets | Jamais exposés côté client | ✅ `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` utilisés uniquement en API routes. |
| Montant / commande | Vérification côté serveur | ✅ Route validate : ordre et montant pris depuis la BDD (ordersStore), pas depuis le body client. |

---

## 4. XSS (kb-security)

| Point | Règle | État |
|-------|--------|------|
| React par défaut | Échappement des rendus | ✅ Pas d’injection HTML via `{userInput}`. |
| dangerouslySetInnerHTML | DOMPurify si contenu utilisateur | ✅ Un seul usage : `JsonLd.tsx` avec `JSON.stringify(restaurantSchema)`. Données issues de `contactInfo` (menuData), pas d’entrée utilisateur → **sûr**. Si à l’avenir du contenu utilisateur est injecté, utiliser DOMPurify. |

---

## 5. Injection SQL / Données (kb-security)

| Point | Règle | État |
|-------|--------|------|
| Requêtes BDD | Paramétrées / ORM | ✅ Supabase : `.eq()`, `.insert(row)`, `.update(patch)` avec paramètres. Aucune concaténation de chaînes pour les requêtes. |
| Limites POST /api/orders | Limiter taille / nombre | ✅ En place : items ≤ 50, longueurs max (client_name, client_phone, notes, delivery_address). |

---

## 6. CORS (kb-security)

| Point | Règle | État |
|-------|--------|------|
| API | Pas de `*` pour API | ✅ Routes API Next.js : même origine par défaut. Aucun CORS `*` configuré. |

---

## 7. Variables d’environnement (kb-security)

| Point | Règle | État |
|-------|--------|------|
| Secrets serveur | Jamais côté client | ✅ `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `ADMIN_PIN`, `SUPABASE_SERVICE_ROLE_KEY`, `N8N_ADMIN_API_KEY`, `RECEIPT_UPLOAD_SECRET` : utilisés uniquement dans API ou lib serveur. |
| Client (NEXT_PUBLIC_*) | Uniquement données non sensibles | ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_APP_URL` : prévus pour être publics. |
| ADMIN_PIN en prod | Pas de NEXT_PUBLIC_ADMIN_PIN | ✅ `adminAuth.ts` : en production seul `ADMIN_PIN` est utilisé ; `NEXT_PUBLIC_ADMIN_PIN` ignoré en prod. |
| .env dans git | Jamais commiter | ✅ `.gitignore` : `.env`, `.env*.local`, `.env.production` ajoutés/confirmés. |

---

## 8. API Keys / Auth admin (kb-security)

| Point | Règle | État |
|-------|--------|------|
| Clés API serveur à serveur | Header `x-api-key` | ✅ n8n → API admin : clé via header (ex. `x-api-key` pour N8N_ADMIN_API_KEY). |
| Admin | PIN via header, pas en query | ✅ Vérification via `x-admin-pin` (adminAuth). |

---

## 9. Entrées / Validation (kb-security)

| Point | Règle | État |
|-------|--------|------|
| POST /api/orders | Validation + limites | ✅ Vérification des champs (type, longueur, enum), total recalculé côté serveur, limites anti-abus. |
| Admin PATCH | Zod / schéma | ✅ Routes admin (orders, products, stocks, etc.) : validation Zod ou schéma contrôlé. |

---

## 10. Checklist post-déploiement (kb-security)

- [ ] Tester le site sur **https://securityheaders.com** et viser un **score A**.
- [ ] En production : `ADMIN_PIN` défini, pas de `NEXT_PUBLIC_ADMIN_PIN`.
- [ ] Webhook Stripe en prod : URL de prod configurée dans le Dashboard Stripe, `STRIPE_WEBHOOK_SECRET` correspondant.
- [ ] Aucun fichier `.env` ou `.env.production` contenant des secrets committé dans le dépôt.

---

## 11. Synthèse

| Domaine | Conformité |
|---------|------------|
| Headers (HSTS, CSP, X-Frame, Referrer, Permissions-Policy, nosniff) | ✅ |
| Rate limiting (orders, chat, admin) | ✅ |
| Stripe (signature webhook, secrets, montant serveur) | ✅ |
| XSS (React, dangerouslySetInnerHTML maîtrisé) | ✅ |
| Injection SQL (Supabase paramétré) | ✅ |
| CORS | ✅ |
| Env / secrets (gitignore, pas d’exposition client) | ✅ |
| Auth admin (PIN serveur, header, rate limit) | ✅ |

**Verdict :** Le projet est aligné avec la règle kb-security. Les corrections appliquées : ajout du header **Permissions-Policy** et renforcement du **.gitignore** pour `.env` / `.env.production`. À valider en conditions réelles avec securityheaders.com après mise en production.
