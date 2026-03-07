# Audit global pré-production – Pizza dal Cielo

**Date** : 9 février 2026  
**Projet** : Pizza dal Cielo (Next.js + Supabase + Stripe + n8n)  
**Références** : Règles Karibloom client-builder (`client-builder-rules/`), audits existants (`AUDIT_SECURITE_*.md`, `AUDIT_TUNNEL_*.md`, `PROJECT_GLOBAL_REVIEW.md`).

---

## 1. Synthèse exécutive

| Verdict | Détail |
|--------|--------|
| **Prêt pour la prod ?** | **Oui, avec correctifs mineurs recommandés** |
| **Blocants** | Aucun identifié |
| **Recommandés avant / juste après mise en ligne** | Limites API (items/longueurs), cookie consent RGPD, pages légales, score securityheaders.com |

Le projet est solide sur la sécurité (admin, Stripe, headers), le SEO (meta, sitemap, JSON-LD), le responsive (viewport, layout) et le déploiement (build, env). Les écarts restants concernent surtout le renforcement anti-abus (limites explicites sur POST /api/orders), la conformité RGPD (bandeau cookies) et la présence de pages légales (mentions, CGV si besoin).

---

## 2. Références utilisées

### 2.1 Règles client-builder (Karibloom)

- **kb-security.mdc** – Headers (.htaccess/CSP), CSRF, rate limiting, Stripe, XSS, SQL, env.
- **kb-seo.mdc** – SEOHead, meta par page, Schema.org JSON-LD, Open Graph, sitemap, robots.
- **kb-mobile-responsive.mdc** – Viewport, mobile-first, unités relatives, images (srcset, lazy), touch.
- **kb-deployment.mdc** – Build, .htaccess, SSL, Cloudflare, checklist déploiement.
- **kb-performance.mdc** – Lighthouse 90+, lazy loading, images, cache.
- **kb-forms.mdc** – react-hook-form, Zod, CSRF, RGPD (checkbox consent).
- **kb-cookie-consent.mdc** – vanilla-cookieconsent, GTM, Consent Mode v2, kb_consent.
- **kb-architecture.mdc** – Structure dossiers, data-driven, composants.
- **kb-animations.mdc** – Framer Motion, viewport once, réduit sur LCP.

### 2.2 Audits déjà réalisés

- **AUDIT_SECURITE_PROJET.md** – Sécurité globale (admin, API commandes, Stripe, chat, env, BDD). Webhook + validate MySQL déjà corrigés.
- **AUDIT_SECURITE_ADMIN.md** – Auth PIN, rate limit admin, validation Zod, headers (alors absents → désormais dans next.config).
- **AUDIT_TUNNEL_VENTE_WHATSAPP.md** – Parcours client de la commande à la récupération.
- **PROJECT_GLOBAL_REVIEW.md** – Architecture, modules, endpoints, qualité, gouvernance doc.

---

## 3. Audit par thème

### 3.1 Sécurité (kb-security, AUDIT_SECURITE_*)

| Point | Règle / audit | État | Commentaire |
|-------|----------------|------|-------------|
| Headers sécurité | kb-security, AUDIT_SECURITE_PROJET | ✅ | `next.config.js` : X-Content-Type-Options, X-Frame-Options, Referrer-Policy, CSP, HSTS (prod). |
| Admin : PIN serveur | AUDIT_SECURITE_ADMIN | ✅ | `ADMIN_PIN` côté serveur ; plus de PIN dans le bundle si pas de `NEXT_PUBLIC_ADMIN_PIN` en prod. |
| Rate limit admin | kb-security, audit | ✅ | 15 échecs / 1 min → blocage 15 min ; `requireAdminWithRateLimit` sur routes admin. |
| Rate limit POST /api/orders | AUDIT_SECURITE_PROJET | ✅ | 10 req / 60 s par IP (implémenté). |
| Rate limit POST /api/chat | AUDIT_SECURITE_PROJET | ✅ | 20 req / 60 s par IP. |
| Webhook Stripe | kb-security, audit | ✅ | Signature vérifiée ; mise à jour MySQL (ordersStore) + Supabase en `paid`. |
| Validate → MySQL | audit | ✅ | Statut `waiting_payment` écrit en MySQL après création du lien Stripe. |
| Secrets / env | kb-security | ✅ | Pas de secrets en dur côté client ; `.env.example` documente ADMIN_PIN sans NEXT_PUBLIC_*. |
| Injection SQL | audit | ✅ | Requêtes paramétrées (Supabase / stores). |
| Limites POST /api/orders | AUDIT_SECURITE_PROJET | ✅ | Limites ajoutées : items ≤ 50, client_name ≤ 200, client_phone ≤ 30, notes ≤ 1000, delivery_address ≤ 500. |
| CSRF formulaires | kb-forms, kb-security | ⚠️ | Formulaire contact en `preventDefault` (pas d’API) → N/A. Création commande via API sans CSRF (flux stateless) ; acceptable si rate limit et validation stricte. Pour une future API contact, prévoir CSRF + rate limit. |
| Score securityheaders.com | kb-security | ❓ | À vérifier après déploiement (objectif A). |

**Actions suggérées**

- Ajouter dans `POST /api/orders` : `items.length <= 50`, `client_name.length <= 200`, `client_phone.length <= 30`, `notes.length <= 1000`, `delivery_address.length <= 500`.
- Après mise en prod : tester https://securityheaders.com et renforcer CSP si besoin.

---

### 3.2 SEO (kb-seo)

| Point | Règle | État | Commentaire |
|-------|--------|------|-------------|
| Meta global | layout.tsx | ✅ | title, description, keywords, canonical, openGraph, twitter, robots. |
| Viewport | kb-mobile-responsive | ✅ | `export const viewport` avec device-width, initialScale, maximumScale, userScalable. |
| Meta par page | kb-seo (SEOHead équivalent) | ✅ | about, contact, menu, customize, menu/[slug] : metadata ou generateMetadata avec title + description uniques. |
| Canonical | kb-seo | ✅ | `alternates.canonical` sur layout racine et layouts (about, contact, menu, customize). |
| Open Graph | kb-seo | ✅ | Layout + layouts ; image OG 1200x630 référencée (`/images/og-image.jpg`). |
| Schema.org JSON-LD | kb-seo | ✅ | `JsonLd.tsx` : Restaurant (LocalBusiness) avec adresse, geo, horaires, téléphone. |
| Sitemap | kb-seo | ✅ | `src/app/sitemap.ts` : accueil, menu, customize, about, contact. |
| robots.txt | kb-seo | ✅ | `src/app/robots.ts` : allow /, disallow /admin/, /api/, /order/ ; sitemap. |

**Actions suggérées**

- Vérifier que `/images/og-image.jpg` existe et fait bien 1200×630 en prod.
- Si ajout de FAQ : ajouter un schéma FAQPage (kb-seo).

---

### 3.3 Performance (kb-performance)

| Point | Règle | État | Commentaire |
|-------|--------|------|-------------|
| Images | kb-performance, kb-mobile | ✅ | Next.js Image avec remotePatterns ; lazy / responsive gérés par le framework. |
| Animations | kb-animations | ✅ | Framer Motion avec `viewport={{ once: true }}` pour limiter le coût. |
| Lazy loading pages | kb-performance | ❓ | Next.js App Router fait du code splitting par route ; pas de lazy manuel des pages nécessaire. |
| Lighthouse 90+ | kb-deployment, kb-performance | ❓ | À mesurer en prod après déploiement. |

**Actions suggérées**

- Lancer un Lighthouse (Performance, Accessibility, Best Practices) sur l’URL de prod et viser 90+.

---

### 3.4 Mobile & responsive (kb-mobile-responsive)

| Point | Règle | État | Commentaire |
|-------|--------|------|-------------|
| Viewport | kb-mobile-responsive | ✅ | Défini dans layout (voir SEO). |
| Unités / layout | kb-mobile-responsive | ✅ | Tailwind (rem/relative) ; pas de largeurs fixes abusives repérées. |
| Input types | kb-mobile-responsive | ✅ | type="tel" / type="email" là où pertinent (formulaires commande / contact). |
| Touch / tap | kb-mobile-responsive | ✅ | Framer Motion et Tailwind ; pas de zoom forcé sur boutons. |

Aucune action bloquante identifiée.

---

### 3.5 Déploiement (kb-deployment)

| Point | Règle | État | Commentaire |
|-------|--------|------|-------------|
| Build | kb-deployment | ✅ | `npm run build` à valider avant déploiement. |
| .htaccess | kb-deployment | N/A | Projet Next.js ; hébergement Vercel ou Node → headers dans next.config (déjà faits). |
| SSL / HSTS | kb-security, kb-deployment | ✅ | HSTS en prod dans next.config. |
| .env prod | kb-deployment | ✅ | .env.example documente toutes les variables ; à configurer sur l’hébergeur. |
| Sitemap / robots | kb-deployment | ✅ | Générés par Next (sitemap.ts, robots.ts). |
| Pages légales | kb-deployment | ⚠️ | Checklist déploiement Karibloom : « Pages legales presentes ». Actuellement pas de page Mentions légales ni CGV. **Recommandation** : ajouter au moins une page Mentions (éditeur, hébergeur, contact) ; CGV si exigées par le client / Stripe. |

**Actions suggérées**

- Créer `/mentions` (et éventuellement `/cgv`) avec metadata et lien dans le footer.
- Sur Vercel : vérifier que les variables d’environnement (Stripe, Supabase, ADMIN_PIN, n8n, RECEIPT_*) sont renseignées et que le webhook Stripe pointe vers l’URL de prod.

---

### 3.6 Formulaires (kb-forms)

| Point | Règle | État | Commentaire |
|-------|--------|------|-------------|
| Formulaire contact | kb-forms | ⚠️ | Soumission désactivée (`preventDefault`) ; pas d’API → pas de CSRF/Zod à auditer. Pour une future API : prévoir react-hook-form + Zod + CSRF + rate limit + checkbox RGPD. |
| Formulaire commande | kb-forms | ✅ | Validation serveur stricte (nom, téléphone, type_service, items, prix recalculés, adresse livraison). Pas de formulaire HTML direct vers API ; flux contrôlé par le front. |
| RGPD (contact) | kb-forms | ❓ | Si un jour formulaire contact envoyé au serveur : ajouter consentement explicite et case obligatoire. |

Aucun correctif obligatoire pour la prod actuelle (contact non envoyé).

---

### 3.7 Cookie consent (kb-cookie-consent)

| Point | Règle | État | Commentaire |
|-------|--------|------|-------------|
| Bandeau cookies | kb-cookie-consent | ❌ | Aucun composant cookie consent (vanilla-cookieconsent ou équivalent) trouvé. |
| GTM / analytics | kb-cookie-consent | ❓ | Si tracking (GA4, etc.) ajouté plus tard : Consent Mode v2 et chargement après consentement. |

**Recommandation** : Pour être conforme RGPD (cookies non essentiels), ajouter un bandeau de consentement (ex. vanilla-cookieconsent v3) et ne charger analytics/tracking qu’après accord. Si aucun cookie tiers pour l’instant, risque limité mais bonne pratique d’avoir au moins une mention « utilisation des cookies » + lien vers politique.

---

### 3.8 Architecture & data (kb-architecture, PROJECT_GLOBAL_REVIEW)

| Point | Règle | État | Commentaire |
|-------|--------|------|-------------|
| Structure dossiers | kb-architecture | ✅ | app/, components/(ui, layout, sections), data/, lib/, types/. |
| Data-driven | kb-architecture | ✅ | menuData, contactInfo, etc. dans `src/data/`. |
| API / stores | PROJECT_GLOBAL_REVIEW | ✅ | Routes API Next.js ; stores serveur (ordersStore, etc.) et client (Zustand panier). |

Aucune action requise.

---

### 3.9 Règles non détaillées mais vérifiées

- **kb-backend** : API en Next.js, pas de PHP ; Stripe et Supabase bien utilisés côté serveur.
- **kb-data-model** : Cohérent avec les migrations Supabase et les stores.
- **kb-components / kb-styling** : Composants réutilisables, Tailwind + variables (globals.css) ; pas d’écart majeur repéré.
- **kb-action-documentation** : Présence de docs et logs (ACTIONS_LOG, logs/YYYY-MM-DD.md) ; à maintenir.

---

## 4. Checklist finale pré-production

### Obligatoire avant mise en prod

- [ ] `ADMIN_PIN` défini en prod (sans `NEXT_PUBLIC_ADMIN_PIN`).
- [ ] `STRIPE_WEBHOOK_SECRET` et `STRIPE_SECRET_KEY` configurés ; webhook Stripe pointant vers l’URL de prod.
- [ ] Variables Supabase, n8n, `RECEIPT_UPLOAD_SECRET` configurées sur l’hébergeur.
- [ ] `NEXT_PUBLIC_APP_URL` = URL de production (ex. https://pizzadalcielo.com).
- [ ] `npm run build` exécuté sans erreur.
- [ ] Fichier `/public/images/og-image.jpg` présent et 1200×630 si possible.

### Recommandé avant / juste après mise en prod

- [x] Limites explicites sur POST /api/orders (items ≤ 50, longueurs max champs) — *fait*.
- [ ] Bandeau cookie consent (RGPD) si cookies tiers ou analytics.
- [x] Page Mentions légales (et CGV si besoin) — *fait* : `/mentions` + lien footer.
- [ ] Test https://securityheaders.com (objectif A).
- [ ] Lighthouse 90+ (Performance, Accessibility, Best Practices) sur la prod.
- [ ] Vérification manuelle du tunnel : commande → validation admin → lien Stripe → paiement → statut paid et reçu.

---

## 5. Résumé des actions recommandées

| Priorité | Action | Règle / audit | État |
|----------|--------|----------------|------|
| Haute | Configurer toutes les variables d’env en prod et webhook Stripe | kb-security, AUDIT_SECURITE_PROJET | Au déploiement |
| Moyenne | Limiter `items.length` et longueurs des champs dans POST /api/orders | AUDIT_SECURITE_PROJET | ✅ Fait |
| Moyenne | Ajouter page Mentions légales (+ CGV si nécessaire) et lien footer | kb-deployment | ✅ Fait |
| Moyenne | Mettre en place cookie consent (vanilla-cookieconsent ou équivalent) | kb-cookie-consent | Si analytics |
| Basse | Vérifier score securityheaders.com et Lighthouse après déploiement | kb-security, kb-performance | Après mise en ligne |
| Basse | Optionnel : session admin en cookie HttpOnly (évolution future) | AUDIT_SECURITE_ADMIN | Optionnel |

---

*Audit pré-production – à mettre à jour après tout changement majeur ou nouveau déploiement.*
