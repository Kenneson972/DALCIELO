# Import des articles (liste pizzas / menu) – Pizza dal Cielo

Ce document explique comment utiliser ta liste d’articles pour alimenter le site et garder une source unique pour le menu et Stripe.

Le menu affiché sur le site (`src/data/menuData.ts`) et utilisé pour le seed Supabase (produits, stocks) est synchronisé avec **`docs/import_articles_source.csv`** : toute modification des articles doit se refléter dans ce CSV, puis dans `menuData.ts` (ou via un script de sync futur).

## Fichier source intégré

Le CSV exporté depuis **Model Fichier import articles** (Numbers) est copié dans le projet :

- **`docs/import_articles_source.csv`** — source de référence (pizzas, friands, boissons, suppléments, pizza du chef).

### Colonnes du CSV source

| Colonne CSV | Rôle |
|-------------|------|
| **RUBRIQUE** | Catégorie : `PIZZA CLASSIQUE`, `FRIAND`, `Boisson`, `Pizza spéciale`, `Supplément fromage`, etc. |
| **ABREGE PRODUIT** | Nom court (ex. Margherita, Calzone). |
| **LIBELLE PRODUIT** | Libellé affiché (souvent identique à l’abréviation). |
| **PRIX** | Prix en euros (nombre). |
| **Variante 1** | Base : en général `Tomate Crème Verte` ( = bases au choix sur le site). |
| **Variante 2** | Sauces : ex. `Ketchup Barbecue Burger Miel Pesto`. |
| **Variante 3** | Options complémentaires (ex. choix de viandes pour Suprême / friands). |

Les lignes vides séparent les rubriques. Les lignes avec `?` en prix (Pizza du chef, Dessert) sont à renseigner côté caisse / admin.

### Correspondance RUBRIQUE → site

| RUBRIQUE (CSV) | Type / catégorie sur le site |
|----------------|------------------------------|
| PIZZA CLASSIQUE | Pizzas, catégorie **Classique** |
| Pizza spéciale (Pizza du chef) | Pizza **Du Chef** (éphémère) |
| FRIAND | **Friands** |
| Boisson | **Boissons** |
| Supplément fromage / salade / condiment / viande / produit de la mer | **Suppléments** (`menuData.supplements`) |

---

## Ré-exporter depuis Numbers (si tu modifies la liste)

1. Ouvre **Model Fichier import articles.numbers** dans Numbers.
2. **Fichier → Exporter vers → CSV…** (UTF-8).
3. Remplace **`docs/import_articles_source.csv`** dans le projet par le nouveau fichier exporté (ou copie-colle le contenu).

Quelques écarts de libellés entre le CSV et le site (à harmoniser si tu fais un sync) : *Saucisse* → *Saucisse fumée*, *4 fromage* → *4 Fromages*, *Basilic Veggiies* → *Veggie*, *VEGE* → *Végétarienne*, *Reine* prix 15 dans le CSV vs 16 dans `menuData`. Le site utilise aussi *Jambon Fromage*, *Calzone O/F*, *Didier Citron* — à vérifier dans le CSV si besoin.

---

## Supabase : champ « sauce au choix » (Variante 2)

Pour que les pizzas avec **sauce au choix** (Ketchup, Barbecue, etc.) soient bien gérées en base :

1. **Exécuter la migration**  
   Dans le SQL Editor Supabase (ou en local avec `supabase db push`), exécuter le fichier **`database/supabase/006_add_sauce_au_choix.sql`**.  
   Cela ajoute la colonne `sauce_au_choix` à la table `products` et met à jour les pizzas concernées (Crispy, Colombo, Burger, Thon, etc.).

2. **Optionnel — resynchroniser le menu**  
   Depuis l’admin (Menu), cliquer sur **« Réinitialiser le menu depuis les données du site »** pour que le seed renvoie les valeurs de `menuData.ts` (dont `sauce_au_choix`).

3. **Modifier une pizza**  
   Dans l’admin, en édition d’une pizza, le toggle **« Sauce au choix »** permet d’activer ou désactiver la proposition de sauce après cuisson pour cette pizza.

Sans cette migration, le site continue de fonctionner : il déduit les pizzas à sauce au choix à partir des `menu_id` (fallback dans le code).

---

## Admin : upload de photos (au lieu d’URL)

Dans l’admin (Menu, Pizza du Chef, Popup Annonce), les images se font désormais par **upload de fichier** (plus par collage d’URL).

### Côté base de données / Supabase

- **Table `products`** : rien à modifier. La colonne `image_url` (TEXT) continue de stocker une URL ; après upload, on y enregistre l’URL publique du fichier stocké dans Storage.
- **Supabase Storage** : il faut un bucket pour les images.
  1. Exécuter la migration **`database/supabase/007_storage_product_images.sql`** dans le SQL Editor Supabase (création du bucket `product-images` + politique de lecture publique).
  2. Si l’INSERT sur `storage.buckets` échoue (droits), créer le bucket à la main : **Storage → New bucket**, id = `product-images`, **Public** = oui, puis exécuter uniquement la partie **policy** du fichier (CREATE POLICY sur `storage.objects`).

Une fois le bucket en place, l’admin peut envoyer des images (JPEG, PNG, WebP, GIF, max 5 Mo) ; elles sont enregistrées dans Storage et l’URL est écrite dans `products.image_url`.

---

## Plusieurs images par pizza (galerie)

Pour afficher une **galerie** sur la fiche produit (détail pizza) :

1. Exécuter la migration **`database/supabase/008_add_image_urls.sql`** : ajout de la colonne `image_urls` (JSONB, tableau d’URLs).
2. Dans l’admin, pour une **pizza** : le bloc « Photos » permet d’ajouter plusieurs images, de supprimer, et de définir la première comme image principale (celle en liste). La première de la liste est toujours utilisée comme `image_url`.

Sur la page détail d’un produit (`/menu/[slug]`), s’il y a plusieurs images, un carousel (flèches + points) est affiché.

---

## Où la liste des articles est utilisée

| Usage | Source actuelle | Rôle |
|--------|------------------|------|
| **Menu site** (pages /menu, /menu/[slug]) | Supabase `products` + fallback `src/data/menuData.ts` | Afficher pizzas, friands, boissons, prix, ingrédients |
| **Panier & commande** | Même source | Calcul du total, lignes de commande (id, name, price, quantity) |
| **Stripe** | Pas de catalogue produits Stripe | Un **lien de paiement par commande** : montant = total de la commande, libellé = « Commande Pizza dal Cielo - [Nom client] ». Les articles ne sont pas envoyés à Stripe, seulement le total. |
| **Admin** (menu, stocks) | Supabase `products` + table `stocks` | Édition prix, dispo, Pizza du Chef, stocks par produit |
| **Chatbot n8n** | Peut s’appuyer sur le même CSV ou sur l’API menu | Pour proposer les bons noms et prix |

Donc : **une seule liste d’articles** (ta liste) peut servir de référence pour tout le site et pour être cohérent avec ce que Stripe affiche (le montant et le libellé de la commande).

---

## Format attendu pour l’import (CSV)

Pour que la liste soit utilisable partout (menu, admin, seed Supabase), le CSV doit suivre ce format.

### Colonnes recommandées

| Colonne | Obligatoire | Description | Exemple |
|--------|-------------|--------------|---------|
| `id` | Oui | Identifiant unique (nombre). Pizzas : 101–299, 900 (Chef). Friands : 301–399. Boissons : 401–499. | 101 |
| `type` | Oui | `pizza`, `friand` ou `drink` | pizza |
| `name` | Oui | Nom affiché | Margherita |
| `category` | Oui | Classique, Du Chef, Friands, Boissons | Classique |
| `price` | Oui | Prix en euros (nombre, point décimal) | 11 |
| `description` | Non | Courte description | L'élégance à l'état pur… |
| `ingredients` | Non | Liste séparée par des **pipes** `\|` | Base au choix \| Mozzarella \| Basilic |
| `size` | Pour boissons | Ex. 50cl | 50cl |
| `popular` | Non | 1 ou true = mis en avant | 0 |
| `vegetarian` | Non | 1 ou true = végétarienne | 0 |
| `premium` | Non | 1 ou true = premium | 0 |
| `is_chef_special` | Non | 1 ou true = Pizza du Chef (éphémère) | 0 |

### Règles importantes

- **IDs** : ne pas dupliquer. Pizzas classiques 101–299, Pizza du Chef 900, Friands 301–303, Boissons 401–406 (voir `src/data/menuData.ts` pour la numérotation actuelle).
- **Catégories pizzas** : uniquement `Classique` ou `Du Chef`.
- **Encodage CSV** : UTF-8 pour les accents.
- **Séparateur** : virgule. Si un champ contient des virgules, le mettre entre guillemets.

---

## Template CSV

Un fichier template est fourni : **`docs/templates/articles_import_template.csv`** (quelques lignes exemples : pizzas, friands, boissons).

- Tu peux le remplir à la main.
- Ou exporter ton Numbers en CSV puis **aligner les colonnes** sur ce template (renommer / réorganiser les colonnes pour qu’elles correspondent).

Après export depuis Numbers, ouvre le CSV dans un tableur et vérifie que les noms de colonnes correspondent à ceux du template.

---

## Utilisation de la liste pour Stripe

Stripe ne reçoit **pas** la liste des pizzas :

- À la **validation de la commande** (admin), l’API crée **un** Price Stripe avec le **total** de la commande (calculé côté site à partir des articles du panier).
- Le libellé du paiement est du type : « Commande Pizza dal Cielo - [Nom client] ».

Donc pour Stripe, ce qui compte c’est que **les prix sur le site** (issus de ta liste d’articles) soient corrects : le total envoyé à Stripe est la somme des `price × quantity` des lignes de la commande. En gardant ta liste d’articles à jour (menuData ou Supabase), les commandes et donc Stripe restent cohérents.

---

## Prochaines étapes possibles

1. **Source à jour** : le fichier **`docs/import_articles_source.csv`** est la copie du CSV Numbers ; tu peux le remplacer après chaque export.
2. **Site synchronisé** : `menuData.ts`, la doc Pizzas par catégorie et le chatbot n8n ont été alignés sur ce CSV. Après modification du CSV, mettre à jour `menuData.ts` (et éventuellement la section menu du CieloBot) pour garder la cohérence.
3. **Ré-exécuter le seed** : après une mise à jour de `menuData`, lancer le seed produits (admin) et le seed stocks si besoin pour que Supabase reflète les nouveaux articles (ex. boissons Sprite, Ordinaire, Royal soda).
4. **Script optionnel** : un script qui lit `docs/import_articles_source.csv` et met à jour `menuData.ts` peut être ajouté (ex. `scripts/import-articles-from-csv.ts`) pour les prochaines sync.
