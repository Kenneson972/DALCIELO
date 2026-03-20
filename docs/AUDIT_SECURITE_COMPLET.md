# Audit de sécurité complet — Pizza dal Cielo

**Date :** 2026-03-18  
**Référence :** Règles Client Builder Karibloom `kb-security.mdc` (client-builder-rules).  
**Périmètre :** Headers, CSP, CSRF, rate limiting, Stripe, XSS, injection, env, API admin, validation, CORS.

---

## 1. Synthèse exécutive

| Domaine | État global | Commentaire |
|--------|-------------|-------------|
| Headers de sécurité | Conforme | HSTS (prod), CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, X-Content-Type-Options dans `next.config.js`. |
| Rate limiting | Conforme | Orders (10/60s), chat (20/60s), admin (15 échecs → 15 min blocage), reviews (1 avis/h par IP), delivery-fee (10/min). |
| Stripe | Conforme | Signature webhook avec `constructEvent`, body en `text()`, montant/orderId depuis BDD sur validate. |
| Auth admin | Conforme | PIN serveur (`ADMIN_PIN`), header `x-admin-pin`, jamais en query ; `NEXT_PUBLIC_ADMIN_PIN` ignoré en prod. |
| Validation des entrées | Partiellement conforme | Zod sur routes admin (orders, products, stocks, queue-settings, homepage-settings). POST /api/orders et /api/reviews : validation manuelle stricte (pas Zod). |
| XSS | Conforme | `dangerouslySetInnerHTML` limité au JSON-LD (données structurées, pas d’entrée utilisateur). |
| Données / SQL | Conforme | Supabase : requêtes paramétrées (`.eq()`, `.insert()`, `.update()`), pas de concaténation. |
| Env / secrets | Conforme | `.env*.local` dans `.gitignore` ; secrets utilisés uniquement côté serveur. |
| CORS | Conforme | Pas de CORS `*` ; API Next.js même origine par défaut. |
| Endpoints sensibles | À renforcer | `POST /api/admin/bot-notify` : pas de rate limit (clé longue recommandée). Cancel order par token : pas de rate limit (token non devinable). |

---

## 2. Headers de sécurité (kb-security)

**Source :** `next.config.js` → `async headers()`.

| Header | Règle | État | Détail |
|--------|--------|------|--------|
| Strict-Transport-Security | HSTS | OK | `max-age=31536000; includeSubDomains; preload` en production uniquement. |
| Content-Security-Policy | CSP | OK | default-src 'self' ; script-src (unsafe-inline en dev, restreint en prod) ; style-src, img-src, font-src, connect-src (Supabase, Stripe, Google), frame-src (Stripe, Google Maps), frame-ancestors 'self'. |
| X-Content-Type-Options | nosniff | OK | Présent. |
| X-Frame-Options | SAMEORIGIN | OK | Présent. |
| Referrer-Policy | strict-origin | OK | `strict-origin-when-cross-origin`. |
| Permissions-Policy | restreint | OK | `geolocation=(), microphone=(), camera=()`. |

**Recommandation :** Vérifier le score sur [securityheaders.com](https://securityheaders.com) après déploiement (objectif A).

---

## 3. Rate limiting (kb-security)

| Endpoint | Limite (règle kb-security) | Implémentation actuelle | État |
|----------|-----------------------------|--------------------------|------|
| POST /api/orders | Limite recommandée | 10 req / 60 s par IP (`rateLimit.ts`) | OK |
| POST /api/chat | 50 req / 1 h | 20 req / 60 s par IP | OK (plus strict) |
| Admin (toutes routes) | — | 15 échecs auth / 1 min → blocage 15 min (`adminAuth.ts`) | OK |
| POST /api/reviews | Limite recommandée | 1 soumission / 1 h par IP (hash) | OK |
| GET/POST /api/delivery-fee | — | 10 req / min par IP (Map locale) | OK |
| POST /api/admin/bot-notify | — | Aucun | À améliorer (optionnel) |

**Fichiers :** `src/lib/rateLimit.ts`, `src/lib/adminAuth.ts`, `src/app/api/orders/route.ts`, `src/app/api/chat/route.ts`, `src/app/api/reviews/route.ts`, `src/app/api/delivery-fee/route.ts`.

**Limitation connue :** Rate limits en mémoire (Map). En multi-instances (plusieurs workers), les compteurs ne sont pas partagés. Sur Vercel (serverless) ou un seul process, le comportement est cohérent.

---

## 4. Stripe (kb-security)

| Point | Règle | État | Fichier |
|-------|--------|------|---------|
| Signature webhook | `constructEvent(body, signature, secret)` | OK | Body lu en `req.text()` (corps brut), puis `stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)`. | `src/app/api/webhooks/stripe/route.ts` |
| Secrets | Jamais côté client | OK | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` utilisés uniquement en API. |
| Montant / orderId | Depuis BDD ou metadata Stripe | OK | Validate : ordre et total depuis `getOrderById()` ; Stripe session créée avec montant BDD. Webhook : orderId depuis `session.metadata?.orderId` ou Payment Link metadata. |

Checkout legacy (`/api/checkout`) renvoie 410 (désactivé) — pas de prix libre depuis le client.

---

## 5. Authentification admin (kb-security, kb-forms)

| Point | Règle | État |
|-------|--------|------|
| PIN côté serveur | Pas de PIN en clair dans le bundle | OK : `getExpectedAdminPin()` lit `ADMIN_PIN` ou en dev `NEXT_PUBLIC_ADMIN_PIN` ; en prod seul `ADMIN_PIN` est accepté. |
| Header | PIN jamais en query | OK : vérification via `x-admin-pin`. |
| Rate limit auth | Limiter brute force | OK : 15 échecs / 1 min → 429 et blocage 15 min. |
| Routes protégées | Toutes les routes admin | OK : `requireAdminWithRateLimit` sur me, orders, orders/[id], validate, products, products/[id], products/seed, stocks, stocks/[item_id], stocks/seed, reviews, reviews/[id], popups, popups/[id], homepage-settings, queue-settings, upload, orders/export. |

**Recommandation prod :** Utiliser un PIN long (≥ 6 caractères) ou mot de passe ; ne pas définir `NEXT_PUBLIC_ADMIN_PIN`. PIN stocké en localStorage/sessionStorage après login (contrainte du flux actuel).

---

## 6. Validation des entrées (kb-security)

| Zone | Méthode | État |
|------|---------|------|
| POST /api/orders | Validation manuelle | OK : longueurs max (client_name, client_phone, notes, delivery_address, items.length), type_service enum, prix recalculés côté serveur et comparés au catalogue, quantité entière positive. |
| POST /api/reviews | Validation manuelle | OK : menu_id, author_name, rating 1–5, comment longueur max, honeypot `website`. |
| POST /api/chat | Validation manuelle | OK : message string non vide, rate limit. |
| PATCH /api/admin/orders/[id] | Zod | OK : statuts autorisés, champs optionnels. |
| POST/PATCH admin products, stocks, queue-settings, homepage-settings | Zod | OK : schémas avec min/max, types. |

**Recommandation :** Pour homogénéité, envisager Zod sur POST /api/orders et POST /api/reviews (optionnel, la validation actuelle est stricte).

---

## 7. XSS (kb-security)

| Point | Règle | État |
|-------|--------|------|
| Rendu React | Échappement par défaut | OK : pas d’injection via `{userInput}`. |
| dangerouslySetInnerHTML | DOMPurify si contenu utilisateur | OK : utilisations limitées à `JsonLd.tsx` et `InlineJsonLd.tsx` avec `JSON.stringify(schema)`. Données issues de `contactInfo` / structures serveur, pas d’entrée utilisateur brute. |

Si à l’avenir du contenu utilisateur (avis, descriptions) est injecté en HTML, utiliser DOMPurify (ou équivalent) avant `dangerouslySetInnerHTML`.

---

## 8. Injection / Données (kb-security)

| Point | Règle | État |
|-------|--------|------|
| Supabase | Requêtes paramétrées | OK : `.from().select().eq()`, `.insert(row)`, `.update(patch)` ; pas de concaténation SQL. |
| Limites métier | Taille / nombre | OK : items ≤ 50, champs texte bornés (orders, reviews). |

---

## 9. Variables d’environnement (kb-security)

| Point | Règle | État |
|-------|--------|------|
| .env / secrets | Jamais commités | OK : `.gitignore` contient `.env`, `.env*.local`, `.env.production`. |
| Secrets serveur | Jamais exposés côté client | OK : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `ADMIN_PIN`, `SUPABASE_SERVICE_ROLE_KEY`, `N8N_ADMIN_API_KEY`, `RECEIPT_UPLOAD_SECRET` utilisés uniquement dans API ou `lib` serveur. |
| NEXT_PUBLIC_* | Données non sensibles | OK : Stripe publishable, Supabase URL/anon, App URL. En prod : ne pas définir `NEXT_PUBLIC_ADMIN_PIN`. |

---

## 10. CORS (kb-security)

| Point | Règle | État |
|-------|--------|------|
| API | Pas de `*` pour API | OK : routes API Next.js, même origine par défaut ; aucun CORS permissif configuré. |

---

## 11. Endpoints sensibles supplémentaires

| Endpoint | Rôle | Sécurité |
|----------|------|----------|
| POST /api/orders/[token]/cancel | Annulation par le client | Token non devinable (UUID). Statuts annulables restreints (`pending_validation`, `waiting_payment`). Pas de rate limit dédié (optionnel). |
| POST /api/orders/[token]/receipt-pdf | Upload reçu PDF (n8n) | Auth par header `x-receipt-secret` = `RECEIPT_UPLOAD_SECRET`. Token dans l’URL. OK. |
| POST /api/admin/bot-notify | Notification n8n après création commande | Auth par `apiKey` dans le body = `N8N_ADMIN_API_KEY`. Pas de rate limit → garder clé longue et aléatoire ; optionnel : rate limit par IP. |

---

## 12. Checklist pré-production (résumé)

- [ ] `ADMIN_PIN` défini en prod (sans `NEXT_PUBLIC_ADMIN_PIN`), de préférence ≥ 6 caractères.
- [ ] `STRIPE_WEBHOOK_SECRET` et `STRIPE_SECRET_KEY` configurés ; webhook Stripe pointant vers l’URL de prod.
- [ ] Variables Supabase, n8n, `RECEIPT_UPLOAD_SECRET` renseignées.
- [ ] Vérifier score [securityheaders.com](https://securityheaders.com) (objectif A).
- [ ] Optionnel : rate limit sur `POST /api/admin/bot-notify` (ex. 60 req/min par IP).

---

## 13. Références

- Règle : `client-builder-rules/kb-security.mdc`
- Docs existants : `docs/VERIFICATION_SECURITE.md`, `docs/AUDIT_SECURITE_ADMIN.md`, `docs/AUDIT_PRE_PROD.md`, `docs/AUDIT_SECURITE_PROJET.md`
