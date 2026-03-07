# Récap – Fiches produits (page détail)

## Route

- **URL** : `/menu/[slug]` (ex. `/menu/crispy`, `/menu/margherita`)
- **Fichier** : `src/app/menu/[slug]/page.tsx`
- **Données** : Supabase (table produits, `image_urls`) en priorité, puis fallback sur le menu statique (`menuData`)

---

## Layout actuel (version finale)

**Structure verticale : image en haut (bandeau) → contenu en dessous.**

```
┌─────────────────────────────────────────────────┐
│  Retour au menu                                  │
├─────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────┐  │
│  │  BANDEAU IMAGE (ratio 2/1, fond sombre)   │  │
│  │  • Une image à la fois, slide horizontal  │  │
│  │  • Flèches gauche/droite                  │  │
│  │  • Compteur "1 / 3" + dots                │  │
│  │  • Badges (Populaire, Végétarien, etc.)   │  │
│  ├───────────────────────────────────────────┤  │
│  │  Miniatures (sous l’image, cliquables)    │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │  CONTENU                                  │  │
│  │  • Bannière "Édition Limitée" (si Chef)   │  │
│  │  • Catégorie · Nom · Format · Prix        │  │
│  │  • Description (bordure gauche)           │  │
│  │  • Onglets Ingrédients / Allergènes       │  │
│  │  • Pills ingrédients (avec icônes)        │  │
│  │  • Astuce personnalisation                │  │
│  │  • [ Ajouter au panier ]                  │  │
│  │  • Envie d’autre chose ? (liens menu/Perso)│  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

- **Carte unique** : `max-w-[920px]`, coins arrondis, bordure blanche, ombre type “glass”.
- **Bandeau** : fond `#1a0f08`, ratio **2/1**, transition slide ~0,7 s.
- **Contenu** : fond blanc semi-transparent, `backdrop-blur`, padding généreux.

---

## Composants utilisés

### 1. `ProductImageGallery`  
**Fichier** : `src/components/menu/ProductImageGallery.tsx`

| Prop | Rôle |
|------|------|
| `images` | Liste d’URLs (une ou plusieurs) |
| `alt` | Texte alternatif pour l’image courante |
| `layout` | `'default'` ou `'banner'` — sur la fiche produit on utilise **`banner`** |
| `badges` | Badges affichés en haut à gauche (Populaire, Végétarien, etc.) |
| `priority` | Priorité de chargement de la première image |
| `fillHeight` | Pour layout colonne (non utilisé en banner) |
| `autoplayIntervalMs` | Optionnel, 0 = pas d’autoplay |

**Comportement selon le nombre d’images :**

- **1 image** : affichage simple, pas de flèches/dots/miniatures.
- **2+ images** :  
  - Flèches, compteur (ex. 1 / 3), dots (pill pour l’active).  
  - **En `banner`** : miniatures **sous** la grande image (bandeau horizontal).  
  - **En `default`** : miniatures à droite (desktop) ou en bas (mobile).

### 2. `ProductDetailTabs`  
**Fichier** : `src/components/menu/ProductDetailTabs.tsx`

- Onglets **Ingrédients** / **Allergènes**.
- Ingrédients en **pills** avec icône selon le nom (🫙 base, 🧀 fromage, 🍗 poulet, etc.).
- Allergènes : texte d’information (pas de données détaillées en base pour l’instant).

### 3. `AddToCartButton`  
**Fichier** : `src/components/menu/AddToCartButton.tsx`

- Pour les pizzas : ouvre le modal d’options (base, suppléments, etc.) puis ajoute au panier.
- Pour les autres produits : ajout direct au panier.

### 4. `ChefValidUntilTimer`  
**Fichier** : `src/components/ui/ChefValidUntilTimer.tsx`

- Affiché dans la bannière “Édition Limitée” quand `chef_valid_until` est renseigné.

---

## Données affichées

- **Nom**, **catégorie** (ou libellé dérivé du type), **format** (`size`), **prix**
- **Description** (optionnelle)
- **Ingrédients** (liste, affichée en pills avec onglet Ingrédients)
- **Badges** : Populaire, Végétarien, Premium, Du Chef (selon les champs produit)
- **Images** : `image_url` + `image_urls` (Supabase) ou `image` (fallback statique)

---

## Évolutions réalisées (résumé)

1. **Multi-images**  
   - Migration `008_add_image_urls.sql` (colonne `image_urls` JSONB).  
   - Admin : galerie par pizza (upload, ordre, image principale).  
   - Site : galerie/carousel sur la fiche produit.

2. **UX galerie**  
   - Slide horizontal avec transition.  
   - Flèches, compteur, dots.  
   - Miniatures (position selon layout).  
   - Fond sombre sur la zone image, dégradé en bas.

3. **Layout fiche produit**  
   - Passage à **image en haut (bandeau horizontal) + contenu en dessous**.  
   - `ProductImageGallery` avec **`layout="banner"`** : ratio 2/1, miniatures **sous** l’image.

4. **Contenu**  
   - Titre en **Playfair Display**, palette chaude (primary, #2d1a0e, #7a5540).  
   - Onglets Ingrédients / Allergènes et pills avec icônes.  
   - CTA “Ajouter au panier” en dégradé, section “Envie d’autre chose ?”.

5. **Technique**  
   - Utilisation de `cn()` pour les classes.  
   - Contournement du bug parser (SWC) sur la page : retour via variable `content` et racine en `<div>`.

---

## Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `src/app/menu/[slug]/page.tsx` | Page fiche produit (layout + contenu) |
| `src/components/menu/ProductImageGallery.tsx` | Galerie / bandeau image (default + banner) |
| `src/components/menu/ProductDetailTabs.tsx` | Onglets Ingrédients / Allergènes + pills |
| `src/components/menu/AddToCartButton.tsx` | Bouton panier + modal options pizza |
| `database/supabase/008_add_image_urls.sql` | Ajout de la colonne `image_urls` |

---

## Images slider (homepage)

Les pizzas peuvent avoir une **image dédiée au slider** de la page d’accueil (ex. photo détourée, fond transparent), sans modifier l’image utilisée sur la fiche produit.

- **Migration** : `database/supabase/009_add_slider_image_url.sql` (colonne `slider_image_url`).
- **Admin** : Menu → Modifier une pizza → section « Image slider (homepage) » → upload ou supprimer.
- **Homepage** : le bandeau utilise `slider_image_url` si présent, sinon `image_url`.

Après détourage des visuels, uploader les PNG dans l’admin pour chaque pizza concernée.

---

## Pour tester

1. Lancer le site : `npm run dev`.
2. Aller sur une fiche produit : ex. `/menu/crispy`, `/menu/margherita`.
3. Avec **une seule image** : bandeau fixe, pas de slide.
4. Avec **plusieurs images** (ajoutées en admin sur la pizza) : slide + miniatures sous le bandeau.
5. **Slider homepage** : après migration 009, définir une « Image slider » en admin pour les pizzas à mettre en avant.
