# Pizza Dal Cielo

Site vitrine + commande pour la pizzeria Pizza Dal Cielo (Fort-de-France, Martinique).

## ✅ Fonctionnalités clés
- Menu complet (pizzas, friands, boissons) + pages produits dynamiques.
- Panier → envoi pour validation → **commandes en MySQL** (ou fallback localStorage).
- **Suivi commande** : `/order/[token]` (données depuis API ou localStorage).
- **Dashboard Admin** `/admin` (iPad) : commandes (MySQL), **stocks** (MySQL : pizzas, boissons, friands, créés/modifiés en temps réel), stats, Cuisine, actions WhatsApp.
- CieloBot (chatbot) avec avatar personnalisé.
- SEO : metadata, JSON‑LD, sitemap, robots, favicons.

## 🚀 Démarrage
```bash
npm install
npm run dev
```
Ouvrir `http://localhost:3000`.

## 🧭 Pages principales
- `/` Accueil
- `/menu` Carte
- `/menu/[slug]` Fiche produit
- `/customize` Personnalisation
- `/contact` Contact
- `/order/[token]` Suivi de commande
- `/admin` Dashboard admin

## 🗄️ Base de données (MySQL)
- **Commandes** : table `orders` → script `database/mysql/003_create_orders.sql`.
- **Stocks** : table `stocks` → script `database/mysql/004_create_stocks.sql`.
- Connexion : `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` dans `.env.local`.
- Vérification : `GET /api/orders/health` (doit renvoyer `ok: true`).
- Dépannage (connexion refusée, Access denied) : voir **`database/mysql/README.md`**.

## 🔐 Admin
- PIN par défaut : `1234` (configurable via `NEXT_PUBLIC_ADMIN_PIN` ou `ADMIN_PIN`).
- Onglets : Vue d’ensemble, Commandes, Stocks, Analytics, Cuisine.
- Stocks : bouton « Initialiser depuis le menu » pour créer tous les articles (pizzas, friands, boissons), puis ajustement -5/-1/+1/+5 et création d’articles.

## 🧾 Pizza du Chef
La pizza du moment change toutes les 2 semaines.  
Gérée dans `src/data/menuData.ts`. Deux catégories pizzas : **Classique** (toutes les pizzas du menu) et **Du Chef** (ex. "L'Éphémère du Chef", éphémère).

## 🧰 Scripts utiles
```bash
npm run dev       # Dev
npm run build     # Build prod
npm run start     # Serveur prod
npm run lint      # Lint
npm run favicon   # Régénérer favicons (icon + apple)
```

## 🌐 Variables d’environnement
Voir `.env.example`. Principales :
- **Stripe** : clés et webhook.
- **MySQL** : `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (obligatoires pour commandes et stocks en base).
- **Admin** : `NEXT_PUBLIC_ADMIN_PIN`.
- **App** : `NEXT_PUBLIC_APP_URL`.
- Supabase optionnel.
