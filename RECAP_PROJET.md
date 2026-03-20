# 🍕 Récapitulatif complet – Pizza dal Cielo

**Client :** equipe de Dal Cielo  
**Projet :** Site web vitrine + e-commerce pour la pizzeria Pizza dal Cielo  
**Localisation :** Bellevue, Fort-de-France, Martinique  
**Repo GitHub :** [Kenneson972/DALCIELO](https://github.com/Kenneson972/DALCIELO)

---

## 1. Contexte

Pizza dal Cielo est une pizzeria artisanale ouverte en **juin 2024** par l'equipe de Dal Cielo. Le site vise à offrir une **expérience web premium**, reflétant l’authenticité et la qualité des pizzas dans un design moderne et tropical, tout en permettant la commande en ligne et la prise de contact simplifiée.

---

## 2. Stack technique

| Catégorie | Technologie |
|-----------|-------------|
| **Framework** | Next.js 14 (App Router) |
| **Langage** | TypeScript |
| **Styles** | Tailwind CSS + variables CSS custom |
| **Animations** | Framer Motion |
| **Icônes** | Lucide React |
| **État global (panier)** | Zustand + persistance `localStorage` |
| **Paiement** | Stripe (Payment Links générés à la validation) |
| **Base de données** | MySQL (o2switch) pour commandes + stocks ; LocalStorage en fallback si DB indisponible ; Supabase optionnel |
| **Charts** | Recharts |
| **Images** | Next/Image + Sharp (favicons) |
| **Utilitaires** | clsx, tailwind-merge, @supabase/supabase-js |

---

## 3. Structure du projet

```
DALCIELO/
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Layout global (Header, Footer, Chatbot)
│   │   ├── page.tsx              # Page d'accueil
│   │   ├── globals.css           # Styles globaux + design system
│   │   ├── menu/page.tsx         # Carte complète (pizzas, friands, boissons)
│   │   ├── menu/[slug]/page.tsx  # Fiche produit dynamique
│   │   ├── customize/page.tsx   # Configurateur de pizza personnalisée
│   │   ├── about/page.tsx        # À propos / histoire
│   │   ├── contact/page.tsx      # Contact, horaires, formulaire
│   │   ├── admin/page.tsx        # Interface iPad : validation commandes + stocks + stats
│   │   ├── success/page.tsx      # Page post-paiement Stripe
│   │   ├── sitemap.ts            # Sitemap SEO
│   │   ├── robots.ts             # Robots SEO
│   │   └── api/
│   │       ├── chat/route.ts             # API CieloBot (réponses rule-based)
│   │       ├── checkout/route.ts         # Session Stripe (legacy / optionnel)
│   │       ├── orders/route.ts           # POST création commande (panier + chatbot)
│   │       ├── orders/[token]/route.ts   # GET détail commande (suivi public)
│   │       ├── orders/health/route.ts    # GET santé MySQL commandes
│   │       ├── admin/me/route.ts       # GET vérification PIN (login admin)
│   │       ├── admin/orders/route.ts   # GET liste commandes (auth + rate limit)
│   │       ├── admin/orders/[id]/route.ts # PATCH statut commande
│   │       ├── admin/stocks/route.ts   # GET liste / POST création stock
│   │       ├── admin/stocks/seed/route.ts # POST initialisation stocks depuis menu
│   │       ├── admin/stocks/[item_id]/route.ts # PATCH mise à jour stock
│   │       ├── admin/validate/route.ts # Création Payment Link Stripe + MySQL waiting_payment
│   │       ├── admin/reservations/     # Réservations (auth + rate limit)
│   │       └── webhooks/stripe/route.ts # checkout.session.completed → MySQL paid + Supabase
│   ├── components/
│   │   ├── admin/                # Dashboard admin (KPIs, stocks, commandes)
│   │   ├── ui/                   # Button, Card, Badge, Modal, Chatbot
│   │   ├── layout/               # Header, Footer, CartDrawer
│   │   ├── sections/             # Hero, MenuHighlight, AboutSection, ContactSection, GallerySection
│   │   └── menu/                 # PizzaCard, CategoryFilter
│   ├── data/
│   │   └── menuData.ts           # Menu complet + contactInfo
│   ├── types/
│   │   └── order.ts             # Order, OrderStatus, OrderItem
│   ├── hooks/
│   │   └── useCart.ts            # Store panier (Zustand)
│   └── lib/
│       ├── utils.ts              # cn() (classes Tailwind)
│       ├── menuUtils.ts          # Helpers menu (slugs, lookup)
│       ├── whatsappTemplates.ts  # Templates WhatsApp admin
│       ├── supabaseClient.ts     # Client Supabase (côté client, optionnel)
│       ├── supabaseAdmin.ts      # Client Supabase service role (API, optionnel)
│       ├── localStore.ts         # Commandes + stocks en localStorage (fallback si MySQL indisponible)
│       ├── db.ts                 # Pool MySQL (commandes, stocks)
│       ├── adminAuth.ts          # Auth admin centralisée + rate limiting
│       ├── ordersStore.ts        # CRUD commandes en MySQL
│       ├── stocksStore.ts        # CRUD stocks en MySQL
│       └── reservationsStore.ts  # Réservations MySQL (API conservée)
├── database/mysql/               # Scripts SQL
│   ├── 001_create_reservations.sql
│   ├── 003_create_orders.sql     # Table commandes
│   ├── 004_create_stocks.sql     # Table stocks (pizzas, boissons, friands)
│   └── README.md                 # Connexion, erreurs courantes
├── public/
├── next.config.js
├── README.md
├── .env.example
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 4. Identité visuelle

- **Couleurs principales :** Corail `#E17B5F`, orange brûlé `#D4633F`, jaune soleil `#F4D06F`, crème `#FFF8F0`, texte `#3D2418`.
- **Typographie :** Poppins (titres), Inter (corps), Montserrat (prix / infos).
- **Style :** Bento grids, cartes type glassmorphism, border-radius généreux (16–24px), micro-animations (hover, scroll).
- **Logo :** Icône pizza (Lucide) + texte « DAL CIELO » dans le header.

---

## 5. Flux de commande (validation par equipe de Dal Cielo)

Le paiement n’est **pas immédiat** : la commande est d’abord envoyée pour **validation par equipe de Dal Cielo sur l’iPad**, puis le lien de paiement Stripe est envoyé au client par WhatsApp.

1. **Client** : Remplit le panier, ouvre le tiroir panier, remplit le formulaire (Nom, Téléphone WhatsApp, Click & Collect / Livraison, Heure souhaitée) et clique sur **« Envoyer pour validation »**.
2. **Système** : Appel **POST /api/orders** → enregistrement en **MySQL** (table `orders`). En cas d’échec (DB indisponible), fallback **localStorage** puis redirection. Vide le panier, redirige vers **/order/[token]** (suivi de commande).
3. **Suivi commande** : Page **/order/[token]** charge la commande via **GET /api/orders/[token]** ; si 404/500, fallback **localStorage** pour afficher les commandes créées en local.
4. **equipe de Dal Cielo (iPad)** : Sur `/admin`, onglet **Commandes** : liste chargée via **GET /api/admin/orders** (MySQL). Changement de statut via **PATCH /api/admin/orders/[id]**.
5. **Validation** : Clique **Valider** → API crée un Stripe Payment Link, statut `waiting_payment`. Bouton **« Envoyer WhatsApp »** pour le lien de paiement.
6. **Client** : Paie via le lien Stripe reçu.
7. **Webhook Stripe** : À `checkout.session.completed`, la commande passe en `paid`.

**Statuts commande :** `pending_validation` → `waiting_payment` → `paid` → `in_preparation` → `ready` → `in_delivery` → `completed` (ou `refused` / `cancelled`).

---

## 6. Pages et fonctionnalités

### 6.1 Page d'accueil (`/`)

- **Hero** : Titre accrocheur, CTA « Découvrir le menu » et « Personnaliser ma pizza », note 5.0 TripAdvisor, image pizza.
- **Menu en avant** : 3 pizzas populaires avec bouton « Ajouter » au panier.
- **À propos (court)** : Histoire de l'equipe de Dal Cielo, valeurs, localisation Bellevue.
- **Galerie** : Grille type masonry avec photos (placeholder Unsplash) + lien Instagram.
- **Contact / Horaires** : Cartes avec adresse, téléphone, email, horaires Mardi–Samedi 18h–22h.

### 6.2 Page Menu (`/menu`)

- **Filtres** : Tous, Classiques, Pizzas du Chef, Friands, Végétariennes, Boissons.
- **Recherche** : Par nom de pizza ou ingrédient.
- **Contenu** : Pizzas classiques, signatures, friands, boissons (voir `menuData.ts`).
- **Bloc bas de page** : CTA « Créer ma Pizza » + lien « Appeler pour commander ».

### 6.3 Page Personnalisation (`/customize`)

- **Étape 1 – Base** : Tomate, Crème, Verte.
- **Étape 2 – Sauce** : Ketchup, Barbecue, Burger, Miel, Pesto maison.
- **Étape 3 – Garnitures** : Fromages, salades, condiments, viandes, produits de la mer (tarifs 2€–4€).
- **Aperçu + total** : Prix en temps réel, bouton « Ajouter au panier ».

### 6.4 Page À propos (`/about`)

- Histoire de Pizza dal Cielo et de l'equipe de Dal Cielo, valeurs, Mission et Vision.

### 6.5 Page Contact (`/contact`)

- Adresse, téléphone, email, horaires, formulaire, lien vers Google Maps.

### 6.6 Page Admin iPad (`/admin`)

- **Protection** : Code PIN validé **côté serveur** via `GET /api/admin/me` ; plus de PIN en dur ni dans le bundle client. En prod : définir uniquement `ADMIN_PIN`. Rate limiting sur toutes les routes admin (15 échecs / 1 min → 429). En cas de 401, déconnexion automatique.
- **Onglets** : Vue d’ensemble, Commandes, Stocks, Analytics, Cuisine. *(Réservations retirées du dashboard ; API réservations conservée.)*
- **Dashboard** : KPIs (CA du jour, commandes payées, en cours, temps moyen), graphiques revenus, top pizzas, **alertes stocks** (chargées depuis **GET /api/admin/stocks**).
- **Commandes** : Liste depuis **MySQL** (GET /api/admin/orders), filtres, actions rapides (WhatsApp, Appeler), changement de statut (PATCH /api/admin/orders/[id]).
- **Stocks** : Liste depuis **MySQL** (GET /api/admin/stocks). **Initialiser depuis le menu** (POST /api/admin/stocks/seed) crée tous les articles (pizzas, friands, boissons). **Nouvel article** pour créer un stock. Ajustement en temps réel : -5 / -1 / +1 / +5 (PATCH avec `adjust`). Rafraîchissement auto toutes les 15 s.
- **Cuisine** : Commandes payées / en préparation, passage en « Prête ».
- **Interface iPad** : navigation par onglets, UI tactile.

### 6.7 Page Succès (`/success`)

- Affichée après paiement Stripe réussi ; message de remerciement, vidage du panier, lien « Retour à l’accueil ».

---

## 7. E-commerce et panier

- **Panier** : Zustand avec persistance `localStorage` (clé `pizza-cart-storage`).
- **Header** : Icône panier avec badge du nombre d’articles (affiché après hydratation pour éviter les erreurs React).
**CartDrawer** :
  - Liste des articles, quantités (+ / −), suppression, total.
  - **Formulaire** : Nom, Téléphone WhatsApp (obligatoire), Type de service (Click & Collect / Livraison), Heure souhaitée (créneaux 18h → 22h).
  - Bouton **« Envoyer pour validation »** (plus de paiement direct) → création commande, vidage panier, message de succès.
- **Stripe** : Payment Links créés côté API (`/api/admin/validate`) ; pas de checkout immédiat depuis le panier. Webhook `POST /api/webhooks/stripe` pour mettre à jour le statut à `paid`.

---

## 8. Base de données et persistance

- **MySQL (o2switch)** – source principale pour commandes et stocks :
  - **Table `orders`** (`database/mysql/003_create_orders.sql`) : `id`, `token`, `created_at`, client, `type_service`, `heure_souhaitee`, `items` (JSON), `total`, `status`, timestamps optionnels. Connexion via `src/lib/db.ts`, couche métier `ordersStore.ts`.
  - **Table `stocks`** (`database/mysql/004_create_stocks.sql`) : `id`, `item_id` (unique), `name`, `category`, `quantity`, `min_threshold`, `unit`, `created_at`, `updated_at`. Couche métier `stocksStore.ts`.
  - **Variables** : `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (voir `database/mysql/README.md` pour accès distant, ECONNREFUSED, Access denied).
  - **Santé** : `GET /api/orders/health` pour vérifier que la base commandes est prête.
- **Fallback** : Si MySQL indisponible, le panier enregistre en **localStorage** et redirige vers le suivi ; la page suivi tente d’abord l’API puis affiche la commande depuis localStorage si trouvée. L’admin en 401 ou erreur API recharge commandes/stocks depuis localStorage.
- **Supabase (optionnel)** : Toujours utilisable en parallèle (CartDrawer tente MySQL puis Supabase puis localStorage).

---

## 9. CieloBot (chatbot)

- **Composant** : `Chatbot.tsx` (bouton flottant avec avatar CieloBot, fenêtre de discussion).
- **Tooltip** : Message d’accroche après quelques secondes.
- **API** : `POST /api/chat` – réponses rule-based (menu, horaires, contact, réservation, perso, livraison, prix, etc.).
- **Évolution** : L’upgrade du chatbot (conseils, réservations, validation humaine) peut être géré via **n8n** (intégration externe) ; l’API actuelle reste en place en fallback.

---

## 10. Données centralisées (`src/data/menuData.ts`)

- **bases** : Tomate, Crème, Verte.
- **sauces** : Ketchup, Barbecue, Burger, Miel, Pesto (maison).
- **pizzas** : **Classiques** (toutes les pizzas du menu) + **Pizza du Chef** (éphémère).
- **friands** : Classique, Végétarienne, Super Carnivore.
- **drinks** : Liste des boissons avec prix.
- **supplements** : Fromages, Salades, Condiments, Viandes, Produits de la mer.
- **contactInfo** : name, owner, address, phone, whatsapp, email, socials, hours.

---

## 10.5 SEO & Référencement

- **Metadata** : titres/description + Open Graph + Twitter Card.
- **JSON‑LD** : schema Restaurant intégré.
- **Sitemap & Robots** : `src/app/sitemap.ts` + `src/app/robots.ts`.
- **Favicons** : `icon.png` + `apple-icon.png`.

## 11. Déploiement et environnement

- **Build** : `npm run build` (Next.js 14).
- **Déploiement** : Vercel (import depuis GitHub `Kenneson972/DALCIELO`) ou o2switch.
- **Variables d’environnement** (`.env.local` / serveur) :
  - **Stripe** : `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`.
  - **MySQL** : `DB_HOST` (127.0.0.1 sur serveur, ou hôte distant pour dev), `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`. Voir `database/mysql/README.md`.
  - **Admin** : `ADMIN_PIN` (obligatoire en prod ; ne pas utiliser `NEXT_PUBLIC_ADMIN_PIN` en production).
  - **App** : `NEXT_PUBLIC_APP_URL`.
  - **Supabase (optionnel)** : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

Fichier `.env.example` à la racine (documente `ADMIN_PIN` et déconseille `NEXT_PUBLIC_*` pour le PIN en prod).

---

## 12. Commandes utiles

```bash
npm install          # Installer les dépendances
npm run dev          # Démarrer en développement (localhost:3000)
npm run build        # Build de production
npm run start        # Démarrer le serveur de production (après build)
npm run lint         # Linter le code
```

---

## 13. Évolutions possibles

- Connexion du formulaire de contact (API email / Resend).
- Intégration Google Maps en iframe.
- Feed Instagram officiel.
- CieloBot avancé via n8n (conseils, prise de commande via chat → **POST /api/orders** avec le même payload que le panier).
- Compte client, historique de commandes, PWA, multilingue.
- Réactivation de l’onglet Réservations dans l’admin si besoin (API et composant `ReservationsList` existent).

---

## 14. Résumé livrable

- **Code** : Repo GitHub à jour, build OK.
- **Flux** : Panier → **POST /api/orders** (MySQL) → suivi /order/[token] → admin (commandes depuis MySQL, statuts PATCH) → Valider (MySQL `waiting_payment`) / Envoyer WhatsApp → paiement Stripe → **webhook** (MySQL `paid`) → statut à jour en admin.
- **Admin** : Auth par PIN validée via **GET /api/admin/me** (plus de PIN dans le bundle), rate limiting sur toutes les routes admin. Vue d’ensemble (KPIs, alertes stocks), **Commandes** (MySQL), **Stocks** (MySQL), Cuisine, Analytics. Réservations retirées du dashboard ; API réservations protégée.
- **Bases** : Tables MySQL `orders` et `stocks` (scripts dans `database/mysql/`), fallback localStorage si DB indisponible.
- **Design** : Mobile-first, responsive, identité Pizza dal Cielo (orange, tropical, pro).
- **Fonctionnel** : Carte complète, panier, configurateur, CieloBot, pages institutionnelles, Stripe Payment Links + webhook, suivi commande par token.

---

## 15. Changelog récent (mise à jour projet)

- **Commandes en MySQL** : Table `orders`, API POST/GET/PATCH, CartDrawer → POST /api/orders, admin commandes depuis API, page suivi GET /api/orders/[token]. Fallback localStorage + page suivi si API en erreur.
- **Santé** : GET /api/orders/health pour vérifier la connexion MySQL et la présence de la table.
- **Admin** : Correction 401 (envoi du PIN, déconnexion si 401) ; suppression de l’onglet Réservations du dashboard.
- **Stocks en MySQL** : Table `stocks`, API GET/POST/PATCH + seed. StocksManager refait : initialisation depuis le menu (pizzas, friands, boissons), création d’articles, ajustement en temps réel. StockAlerts alimenté par l’API.
- **Doc MySQL** : README `database/mysql/` avec erreurs ECONNREFUSED, Access denied, ETIMEDOUT et solutions (DB_HOST, accès distant, privilèges).

---

## 16. Session du 9 février 2025 (sécurité et cohérence)

- **Audit sécurité admin** : Document `docs/AUDIT_SECURITE_ADMIN.md` (déjà en place). Renforcements appliqués :
  - **Auth centralisée** : `lib/adminAuth.ts` avec `requireAdminWithRateLimit` sur toutes les routes admin (orders, stocks, validate, reservations GET/PATCH, **me**).
  - **Login côté serveur** : Nouvelle route **GET /api/admin/me** pour valider le PIN ; la page admin ne compare plus le PIN côté client (plus de `NEXT_PUBLIC_ADMIN_PIN` ni `1234` dans le bundle). PIN stocké en session/local uniquement après succès de `/api/admin/me`.
  - **Rate limiting** : 15 échecs 401 / 1 min par IP → 429 pendant 15 min.
  - **Reservations** : GET et PATCH réservations passés sur `requireAdminWithRateLimit` ; paramètres Next 15 gérés en Promise.
  - **.env.example** : `ADMIN_PIN` documenté ; déconseil d’utiliser `NEXT_PUBLIC_ADMIN_PIN` en production.
- **Audit sécurité projet entier** : Document `docs/AUDIT_SECURITE_PROJET.md` (API commandes, Stripe, webhook, chat, env, MySQL, contact).
- **Stripe / MySQL** : Webhook Stripe appelle désormais `ordersStore.updateOrderStatus(orderId, 'paid')` pour mettre à jour MySQL après paiement. Route **validate** appelle `ordersStore.updateOrderStatus(..., 'waiting_payment')` après création du Payment Link. Flux admin et suivi restent cohérents avec la BDD MySQL.

---

## 17. Avis global sur le projet

Le projet **Pizza dal Cielo** est **solide et prêt pour une mise en production** dans le cadre d’une petite structure (pizzeria, un gérant, iPad admin). Points forts :

- **Stack claire** : Next.js, TypeScript, Tailwind, MySQL, Stripe. Structure lisible (data, lib, components, API), conformément aux usages Karibloom.
- **Flux métier cohérent** : Commande → validation manuelle → lien Stripe → paiement → webhook → statut `paid` en MySQL. Fallback localStorage en cas d’indisponibilité DB.
- **Sécurité admin** : PIN validé côté serveur, rate limiting, montant Stripe basé sur la BDD, validation Zod sur les routes sensibles. Pas de secret en dur dans le bundle client.
- **Documentation** : RECAP, audits sécurité (admin + projet), README MySQL, .env.example à jour.

À surveiller en production : définir **uniquement `ADMIN_PIN`** (fort), ne pas exposer de secret côté client, et optionnellement ajouter un rate limit sur POST /api/orders et POST /api/chat pour limiter les abus. Une évolution possible est une session admin en cookie HttpOnly pour ne plus envoyer le PIN dans les headers.

*Document mis à jour pour le projet Pizza dal Cielo – récapitulatif technique et fonctionnel.*
