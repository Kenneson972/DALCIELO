# MySQL – Réservations, Commandes et Stocks

Ce dossier contient les scripts SQL pour la base MySQL (o2switch ou local). Les tables utilisées par l’application sont **orders** (commandes) et **stocks** (stocks pizzas/boissons/friands). Les réservations sont optionnelles (API conservée, onglet retiré du dashboard).

## Fichiers

| Fichier | Rôle |
|--------|------|
| **001_create_reservations.sql** | Table réservations (MySQL 8+). |
| **001_create_reservations_mysql57.sql** | Version compatible MySQL 5.7 (o2switch). |
| **002_insert_reservation_test.sql** | Données de test réservations. |
| **003_create_orders.sql** | Table **orders** : commandes (panier → API → suivi, admin). À exécuter en priorité. |
| **004_create_stocks.sql** | Table **stocks** : articles (pizzas, boissons, friands) avec quantité et seuil. L’admin initialise depuis le menu puis met à jour en temps réel. |

## Variables d’environnement

À mettre dans **`.env.local`** (pas seulement dans `.env.example`) :

- `DB_HOST` : souvent `localhost` si l’app et MySQL sont sur le même serveur ; sinon l’hôte MySQL fourni par o2switch.
- `DB_PORT` : en général `3306`.
- `DB_NAME`, `DB_USER`, `DB_PASSWORD` : ceux fournis par o2switch.

Après modification de `.env.local`, redémarrer le serveur : `npm run dev`.

---

## Erreur « Access denied … @'localhost' »

Cette erreur apparaît souvent quand **tu lances l’app en local** (`npm run dev` sur ton PC) et que la base MySQL est **sur o2switch**. Pour MySQL, la connexion vient alors d’une adresse distante, pas de `localhost`, donc l’utilisateur `'user'@'localhost'` refuse l’accès.

**Deux solutions :**

### 1. Faire tourner l’app sur le même serveur que MySQL (recommandé)

- Déploie le site Next.js sur o2switch (FTP + Node ou hébergement Node proposé par o2switch).
- Sur le serveur, l’app et MySQL sont sur la même machine : utilise `DB_HOST=127.0.0.1` (ou `localhost`) dans les variables d’environnement du serveur.
- L’utilisateur MySQL `'fawo6188_Guylian'@'localhost'` acceptera la connexion.

### 2. Accès MySQL à distance (depuis ton PC)

- Dans le **panel o2switch / Infomaniak** : section MySQL / bases de données.
- Vérifier s’il existe une option du type **« Accès distant »** ou **« Remote MySQL »** et l’activer si besoin.
- Noter l’**hôte MySQL pour accès distant** (souvent différent de `localhost`, ex. `fawo6188.myd.infomaniak.com` ou l’adresse indiquée dans le panel).
- Créer ou modifier un utilisateur MySQL pour autoriser la connexion **depuis n’importe quel hôte** (`%`) ou depuis ton IP si le panel le demande.
- En local, dans `.env.local`, utiliser cet hôte :
  - `DB_HOST=fawo6188.myd.infomaniak.com` (à remplacer par la valeur indiquée dans le panel).
  - Garder `DB_USER`, `DB_PASSWORD`, `DB_NAME` tels quels.

Si après ça tu as encore « Access denied », vérifier dans le panel : utilisateur, mot de passe, base associée, et hôte autorisé pour cet utilisateur.

---

## Erreur « connect ECONNREFUSED » (ex. 109.62.104.45:3306)

La connexion TCP est **refusée** : soit rien n’écoute sur ce port, soit un firewall bloque.

**Si tu développes en local (app sur ton PC) :**

- Si `DB_HOST` est l’**IP de ton serveur o2switch** (ex. 109.62.104.45) : en général l’hébergeur **ne laisse pas** le port 3306 ouvert depuis Internet. Donc ECONNREFUSED depuis ton PC est normal.
  - **Option A** : utiliser une **base MySQL en local** sur ton PC. Installe MySQL (ou MariaDB), crée une base et un utilisateur, exécute `003_create_orders.sql`, puis dans `.env.local` mets **`DB_HOST=127.0.0.1`** (ou `localhost`) avec ton `DB_NAME` / `DB_USER` / `DB_PASSWORD` locaux. Les commandes seront bien stockées en base pendant le dev.
  - **Option B** : déployer l’app sur o2switch et mettre **`DB_HOST=127.0.0.1`** sur le serveur. L’app et MySQL sont sur la même machine, la connexion fonctionne.

- Si `DB_HOST` est ton **propre IP** (ex. 109.62.104.45) : MySQL sur ta machine écoute en général uniquement sur `127.0.0.1`. Il faut mettre **`DB_HOST=127.0.0.1`** (ou `localhost`) dans `.env.local` pour que l’app, qui tourne sur la même machine, se connecte correctement.

**En résumé pour le dev en local avec une vraie base :** utilise **`DB_HOST=127.0.0.1`** et une base MySQL installée sur ton PC.

---

## Erreur « connect ETIMEDOUT »

La connexion TCP vers MySQL ne répond pas (timeout). Souvent le **port 3306 est bloqué** depuis l’extérieur (firewall hébergeur ou box).

**À faire :**

1. **Autoriser ton IP dans le panel**  
   Dans o2switch/Infomaniak, section MySQL / accès distant : s’il existe une **liste d’IP autorisées**, ajoute ton IP publique (sur Google : « quelle est mon ip »). Sans ça, beaucoup d’hébergeurs refusent toute connexion MySQL venue d’internet.

2. **Vérifier le port**  
   Certains hébergeurs exposent MySQL sur un **autre port** (ex. 3307) pour l’accès distant. Vérifier dans le panel et mettre ce port dans `DB_PORT` dans `.env.local`.

3. **Si rien ne change**  
   Sur de l’hébergement mutualisé, MySQL est souvent **uniquement accessible depuis le serveur** (pas depuis ton PC). Dans ce cas, la seule solution fiable est de **déployer le site sur o2switch** : l’app et la base sont sur la même machine, avec `DB_HOST=127.0.0.1`, et la connexion fonctionne.
