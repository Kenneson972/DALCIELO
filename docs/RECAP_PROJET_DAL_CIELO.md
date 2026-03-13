# Récapitulatif du projet Pizza dal Cielo

**Dernière mise à jour** : 2026-03-11  
**Client** : Karibloom — Pizzeria Pizza dal Cielo (Fort-de-France, Martinique)

---

## 1. Vue d’ensemble

- **Type** : Site vitrine + prise de commande en ligne pour pizzeria.
- **Objectif** : Carte complète (pizzas, friands, boissons), panier → validation → suivi commande tokenisé, paiement Stripe, back-office admin (iPad), chatbot CieloBot, reçu PDF via n8n.
- **Données** : Supabase (PostgreSQL) en production ; MySQL documenté en parallèle (migrations dans `database/mysql/`).

---

## 2. Stack technique

| Couche | Technologie |
|--------|-------------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | TailwindCSS 3.4, CSS Variables, Framer Motion |
| **État client** | Zustand (panier, stores métier) |
| **Formulaires** | react-hook-form, Zod |
| **Backend** | Routes API Next.js (`src/app/api/**/route.ts`) |
| **Base de données** | Supabase (PostgreSQL) — scripts dans `database/supabase/` |
| **Paiement** | Stripe (checkout, webhooks) |
| **Automatisation** | n8n (CieloBot, notification commande validée, reçu PDF) |

---

## 3. Structure du projet

```
DALCIELO/
├── src/
│   ├── app/                    # App Router Next.js
│   │   ├── layout.tsx          # Layout racine, fonts, metadata, JsonLd
│   │   ├── page.tsx            # Accueil
│   │   ├── menu/               # Carte + fiche produit [slug]
│   │   ├── customize/          # Personnalisation pizza
│   │   ├── commander/          # Tunnel commande
│   │   ├── order/[token]/      # Suivi commande + reçu imprimable
│   │   ├── contact/, about/, mentions/
│   │   ├── success/            # Page après paiement
│   │   ├── admin/              # Dashboard admin (PIN)
│   │   └── api/                # Routes API (voir § 5)
│   ├── components/
│   │   ├── layout/             # Header, Footer, CartDrawer, StickyCartBar, LayoutSwitch
│   │   ├── sections/           # Hero, AboutSection, GallerySection, ContactSection, MenuHighlight, PizzaSlider, AnnouncementPopup
│   │   ├── menu/               # PizzaCard, MenuPageClient, CategoryFilter, AddToCartButton, PizzaOptionsModal, ProductDetailTabs, ProductImageGallery, ProductReviews, ChefPizzaPage
│   │   ├── order/              # OrderSummary, PendingValidationView, OrderTrackingClient, WaitingTimeline, WaitingCarousel, FAQAccordion
│   │   ├── admin/              # AdminSidebar, OrdersList, StocksManager, MenuManager, ReviewsManager, ReceiptsManager, KitchenMode, KPICard, RevenueChart, TopPizzas, QuickActions, StockAlerts, AnnouncementEditor, ChefPizzaEditor
│   │   ├── ui/                 # Button, Card, Modal, Badge, Chatbot, ChefValidUntilTimer
│   │   └── seo/                # JsonLd
│   ├── data/                   # Données métier (data-driven)
│   │   └── menuData.ts         # bases, sauces, pizzas, friands, boissons, dessert
│   ├── lib/                    # Utils, clients, stores
│   │   ├── supabaseClient.ts, supabaseAdmin.ts
│   │   ├── adminAuth.ts
│   │   ├── *Store.ts           # productsStore, stocksStore, reviewsStore, popupsStore, homepageSettingsStore, queueSettingsStore
│   │   ├── menuUtils.ts, utils.ts
│   │   └── whatsappTemplates.ts
│   ├── hooks/                  # ex. useQueueEstimate
│   └── types/                  # order.ts, review.ts, popup.ts
├── database/
│   ├── supabase/               # Migrations PostgreSQL (orders, stocks, products, reviews, popups, homepage_settings, queue_settings, etc.)
│   └── mysql/                  # Scripts MySQL (orders, stocks, réservations) — doc dans README
├── docs/                       # Documentation, audits, logs d’actions
├── n8n/                        # Workflow CieloBot + template reçu
├── public/                     # Images, favicons (icon.png, apple-icon.png)
└── scripts/                    # generate-favicon.mjs, start-session-log.mjs, log-action.mjs, finalize-session-log.mjs
```

---

## 4. Pages principales

| Route | Description |
|-------|-------------|
| `/` | Accueil (hero, mise en avant menu, galerie, contact, popup annonce) |
| `/menu` | Carte complète avec filtres par catégorie |
| `/menu/[slug]` | Fiche produit (détails, options, avis, ajout au panier) |
| `/customize` | Personnalisation pizza |
| `/commander` | Tunnel de commande (panier → infos client → envoi) |
| `/order/[token]` | Suivi commande (statuts, timeline, lien paiement si en attente) |
| `/order/[token]/receipt` | Reçu imprimable / enregistrer en PDF |
| `/contact` | Contact |
| `/about` | À propos |
| `/mentions` | Mentions légales |
| `/success` | Confirmation après paiement Stripe |
| `/admin` | Dashboard admin (PIN) : vue d’ensemble, commandes, stocks, menu, avis, reçus, cuisine, annonces, paramètres |

---

## 5. API (endpoints principaux)

### Public

- `POST /api/orders` — Création commande
- `GET /api/orders/[token]` — Détail commande (suivi)
- `POST /api/orders/[token]/cancel` — Annulation par le client
- `GET /api/orders/queue-estimate` — Estimation file d’attente four
- `GET /api/orders/health` — Santé (connexion BDD)
- `GET /api/reviews` — Liste avis (public)
- `POST /api/chat` — Chatbot CieloBot (→ n8n)
- `GET /api/delivery-fee` — Calcul frais livraison
- `GET /api/announcement` — Annonce / popup active

### Paiement & reçu

- `POST /api/checkout` — Création session Stripe (lien paiement)
- `POST /api/webhooks/stripe` — Webhook Stripe (signature vérifiée)
- `GET /api/orders/[token]/receipt-pdf` — Infos pour génération reçu PDF (n8n)

### Admin (header `x-admin-pin` requis)

- `GET /api/admin/me` — Vérification auth admin
- `GET/PATCH /api/admin/orders`, `GET/PATCH /api/admin/orders/[id]` — Commandes
- `GET /api/admin/orders/export` — Export
- `POST /api/admin/validate` — Valider commande (→ lien Stripe, notification n8n)
- `GET/POST/PATCH/DELETE /api/admin/products`, `.../products/[id]`, `.../products/seed`
- `GET/POST/PATCH /api/admin/stocks`, `.../stocks/[item_id]`, `.../stocks/seed`
- `GET/POST/PATCH/DELETE /api/admin/reviews`, `.../reviews/[id]`
- `GET/POST/PATCH /api/admin/popups`, `.../popups/[id]`
- `GET/PATCH /api/admin/announcement` — Annonce (legacy)
- `GET/PATCH /api/admin/homepage-settings`
- `GET/PATCH /api/admin/queue-settings`
- `POST /api/admin/bot-notify` — Notification bot (n8n)
- `POST /api/admin/upload` — Upload (ex. images)

---

## 6. Base de données (Supabase)

- **orders** : id, token, client_name, client_phone, client_email, type_service, heure_souhaitee, items (JSONB), total, status, estimated_ready_time, actual_ready_time, preparation_started_at, completed_at, notes, delivery_address, refusal_reason, payment_link, receipt_pdf_url, receipt_category, etc.
- **stocks** : suivi stock par article (pizzas, friands, boissons).
- **products** : catalogue produit (aligné menu + BDD).
- **reviews** : avis clients (modération admin).
- **popups** : popups multi-types (chef, promo, event, alert) pour la homepage.
- **homepage_settings** : paramètres page d’accueil.
- **queue_settings** : paramètres file d’attente / estimation.
- **Storage** : images produits (bucket documenté dans `007_storage_product_images.sql`).

Migrations numérotées dans `database/supabase/` (001 à 018+). MySQL conservé en parallèle pour référence (`database/mysql/`).

---

## 7. Données métier (menu)

- **Source unique** : `src/data/menuData.ts`.
- **Contenu** : bases (Tomate, Crème, Verte), sauces (supplément), pizzas (Classique, Du Chef), friands, boissons, dessert.
- **Pizza du Chef** : éphémère, changement toutes les 2 semaines ; géré aussi dans l’admin (ChefPizzaEditor).
- **Récaps générés** : `docs/MENU_RECAP.md`, `docs/PIZZAS_PAR_CATEGORIE.md`, `docs/RECAP_FICHES_PRODUITS.md`.

---

## 8. Statuts de commande

`pending_validation` → `waiting_payment` → `paid` → `in_preparation` → `ready` → `in_delivery` / `completed`, ou `cancelled` / `refused`.

Après validation admin : envoi lien Stripe au client ; après paiement : webhook Stripe, mise à jour statut, option reçu PDF via n8n.

---

## 9. Intégrations externes

- **Stripe** : création lien paiement, webhook signé pour mise à jour statut. Docs : `docs/STRIPE_QUICKSTART.md`, `docs/STRIPE_TEST.md`.
- **n8n** :
  - CieloBot : webhook chat → `N8N_CHATBOT_WEBHOOK_URL`.
  - Commande validée : `N8N_ORDER_NOTIFY_WEBHOOK_URL` (notification client).
  - Reçu PDF : `N8N_RECEIPT_WEBHOOK_URL` + `RECEIPT_UPLOAD_SECRET` pour upload du PDF généré. Détails : `docs/RECEPTE_PDF_N8N.md`.
- **WhatsApp** : templates dans `src/lib/whatsappTemplates.ts` (lien paiement, en préparation, prêt, retard, refus, annulation, message personnalisé). Utilisés depuis l’admin (actions rapides).

---

## 10. Admin

- **Accès** : `/admin`, protégé par PIN (`ADMIN_PIN` ou `NEXT_PUBLIC_ADMIN_PIN`), header `x-admin-pin`, rate limit.
- **Fonctions** : tableau de bord (KPI, CA, commandes du jour), liste et détail des commandes, validation → Stripe + notification n8n, gestion stocks (seed depuis menu, ajustements), gestion produits/menu, avis (modération), reçus (catégorisation, PDF), mode cuisine, annonces/popups, paramètres homepage et file d’attente, actions WhatsApp.
- **Audits** : `docs/AUDIT_SECURITE_ADMIN.md`, `docs/AUDIT_MOBILE_IPAD.md`.

---

## 11. SEO, performance, sécurité

- **SEO** : metadata dans `layout.tsx` (title, description, canonical, Open Graph), `JsonLd` (Schema.org), `robots.ts`, sitemap, favicons (icon.png, apple-icon.png). BASE_URL : `https://pizzadalcielo.com`.
- **Performance** : Next.js (App Router), `next.config.js` (compiler removeConsole en prod, images avif/webp), headers sécurité (CSP, X-Frame-Options, HSTS en prod). Règles projet : lazy loading, Promise.all pour fetches, content-visibility listes longues.
- **Sécurité** : CSRF, validation Zod, webhook Stripe signé, auth admin par PIN, headers sécurité. Docs : `docs/AUDIT_SECURITE_PROJET.md`, `docs/VERIFICATION_SECURITE.md`, `docs/AUDIT_PRE_PROD.md`.

---

## 12. Documentation et scripts

- **Journal des actions** : `docs/ACTIONS_LOG.md` (global), `docs/logs/YYYY-MM-DD.md` (session). Scripts : `npm run logs:start`, `npm run logs:action`, `npm run logs:end`.
- **Revue projet** : `docs/PROJECT_GLOBAL_REVIEW.md`.
- **Autres docs** : audits (sécurité, mobile, tunnel vente WhatsApp, pré-prod), Stripe, n8n/reçu PDF, import articles, fiches produits, résumé reçu/panier.
- **Scripts npm** : `dev`, `build`, `start`, `lint`, `favicon`, `stripe:webhook`, `logs:*`.

---

## 13. Variables d’environnement (principales)

Voir `.env.example` pour la liste complète.

- **Stripe** : `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`.
- **Supabase** : `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- **n8n** : `N8N_ADMIN_API_KEY`, `N8N_CHATBOT_WEBHOOK_URL`, `N8N_ORDER_NOTIFY_WEBHOOK_URL`, `N8N_RECEIPT_WEBHOOK_URL`, `RECEIPT_UPLOAD_SECRET`.
- **App** : `NEXT_PUBLIC_APP_URL`.
- **Admin** : `ADMIN_PIN` (éviter `NEXT_PUBLIC_*` pour le PIN en prod).

---

## 14. État actuel (référence rapide)

- **Dépôt** : Git actif. Branche et historique à consulter avec `git status` / `git log`.
- **Fichiers non suivis récents** (à valider/committer si pertinent) : `src/app/v2/*` (layout, page, about, contact, menu), migration `database/supabase/012_create_reviews.sql` (modification).
- **Règles Cursor** : Karibloom Client Builder (workflow, architecture, SEO, perf, formulaires, sécurité, mobile, etc.) + documentation des actions dans `docs/ACTIONS_LOG.md` et `docs/logs/`.

---

*Ce document sert de point d’entrée pour tout le projet Dal Cielo. Pour le détail des APIs ou du schéma BDD, se référer aux fichiers source et aux autres documents dans `docs/`.*
