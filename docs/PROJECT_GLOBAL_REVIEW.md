# Revue Globale du Projet

Date: 2026-02-09  
Projet: Pizza dal Cielo (Next.js + Supabase + Stripe + n8n)

## 1) Vue d'ensemble
- Application web client pour prise de commande pizza.
- Back-office admin pour produits, commandes, stocks, avis et annonces.
- Integrations externes: Supabase (donnees), Stripe (paiement), n8n (chatbot et workflows).

## 2) Architecture
- Frontend: Next.js App Router, React, Tailwind, Framer Motion.
- Backend applicatif: routes API Next.js (`src/app/api/**/route.ts`).
- Donnees: tables Supabase (`database/supabase/*.sql`) + stores serveur dans `src/lib/*Store.ts`.
- Etat client: Zustand (`useCart`) et hooks metier (`useQueueEstimate`).

## 3) Modules fonctionnels
- Commande client:
  - Panier, validation commande, suivi tokenise (`/order/[token]`).
  - Estimation de file d'attente four (`/api/orders/queue-estimate`).
- Paiement:
  - Validation admin -> lien Stripe.
  - Webhook Stripe signe pour mise a jour des statuts.
- Admin:
  - Dashboard, gestion des commandes/stocks/menu/annonces/avis.
  - Auth PIN via header `x-admin-pin` + rate limit.
- Avis:
  - API publique de lecture + API admin de moderation.

## 4) Endpoints API principaux
- Public:
  - `/api/orders`, `/api/orders/[token]`, `/api/orders/[token]/cancel`
  - `/api/orders/queue-estimate`, `/api/reviews`, `/api/chat`, `/api/delivery-fee`
- Paiement:
  - `/api/webhooks/stripe`, `/api/orders/[token]/receipt-pdf`
- Admin:
  - `/api/admin/me`, `/api/admin/orders*`, `/api/admin/products*`, `/api/admin/stocks*`
  - `/api/admin/reviews*`, `/api/admin/announcement`, `/api/admin/queue-settings`

## 5) Etat qualite (global)
- Points solides:
  - Validation serveur sur flux commande/paiement.
  - Webhook Stripe verifie.
  - Headers securite presentes dans `next.config.js`.
  - Separation claire UI/layout/sections/admin.
- Points de vigilance:
  - Lint non initialise (`next lint` interactif).
  - Peu/pas de tests automatises.
  - Documentation technique existante dispersee (plusieurs recap/audits).

## 6) Gouvernance documentaire (mise en place)
- Regle always-on de documentation des actions:
  - `.cursor/rules/kb-action-documentation.mdc`
  - mirror: `client-builder-rules/kb-action-documentation.mdc`
- Journal global:
  - `docs/ACTIONS_LOG.md`
- Journal par session:
  - `docs/logs/YYYY-MM-DD.md`
- Scripts:
  - `npm run logs:start`
  - `npm run logs:action -- --type=... --summary="..." --files="..." --why="..." --impact="..." --verify="..."`
  - `npm run logs:end -- --summary="..." --next="..."`

## 7) Prochaines actions recommandees
- Initialiser ESLint non-interactif et ajouter verification CI.
- Ajouter tests minimaux sur routes critiques (orders, admin auth, webhook).
- Centraliser les docs fonctionnelles en un index unique dans `docs/`.
