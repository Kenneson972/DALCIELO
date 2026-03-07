# Audit Mobile & iPad – Pizza dal Cielo

**Date** : 9 février 2026  
**Référence** : Règle Karibloom `kb-mobile-responsive.mdc` (client-builder-rules).  
**Périmètre** : Site public (Header, Footer, Hero, Menu, Customize, Contact, Panier, Suivi commande) + Dashboard admin (usage prévu sur iPad).

---

## 1. Checklist rapide (kb-mobile-responsive)

| # | Point | État | Commentaire |
|---|--------|------|-------------|
| 1 | Balise viewport présente | ✅ | `layout.tsx` : `export const viewport = { width: 'device-width', initialScale: 1, maximumScale: 5, userScalable: true }` |
| 2 | Images width/height ou aspect-ratio (éviter CLS) | ✅ | Next/Image ou dimensions explicites ; CartDrawer images en w-20 h-20 |
| 3 | Boutons ≥ 44×44 px | ✅ | Corrigé : Header (mobile), CartDrawer (fermer, +/-), Footer (newsletter), Admin sidebar & QuickActions |
| 4 | Pas de scroll horizontal sur le contenu | ✅ | `globals.css` : `html { overflow-x: hidden }` ; `main` admin : `overflow-x-hidden` |
| 5 | Formulaires : type="tel" / type="email" | ✅ | CartDrawer : `type="tel"` téléphone, `autocomplete="tel"` ; Footer : `type="email"`, `autocomplete="email"` |
| 6 | Footer pas collé sous la barre système mobile | ✅ | `Footer` : `pb-[max(2.5rem,env(safe-area-inset-bottom))]` ; `body` : `padding-bottom: env(safe-area-inset-bottom)` |
| 7 | Tap / zoom | ✅ | `globals.css` : `-webkit-tap-highlight-color: transparent`, `touch-action: manipulation` sur buttons/links |
| 8 | Safe areas | ✅ | `body` : `padding-top/bottom: env(safe-area-inset-*)` ; Footer idem |

---

## 2. Site public – Par page / composant

### 2.1 Layout global

- **Viewport** : Défini en export dans `layout.tsx` (Next.js), équivalent meta viewport.
- **Overflow** : `html { overflow-x: hidden }` + `text-size-adjust: 100%` (Safari).
- **Touch** : Boutons/liens avec `touch-manipulation` et `tap-highlight-color: transparent` (globals.css).
- **Safe areas** : Body + Footer avec `env(safe-area-inset-*)`.

### 2.2 Header

- **Desktop** : Nav + panier + CTA ; masqué en `< md` (768px).
- **Mobile** : Hamburger (menu) + icône panier ; **corrigé** : `min-w-[44px] min-h-[44px]`, `touch-manipulation`, `aria-label` sur les deux boutons.
- **Menu mobile** : Overlay + panneau sous la barre ; liens en `py-3` (hauteur tactile correcte).

### 2.3 CartDrawer (panier)

- **Ouverture** : Slide depuis la droite ; `w-full max-w-md` (pleine largeur sur mobile).
- **Fermeture** : Bouton X **corrigé** en `min-w-[44px] min-h-[44px]` + `touch-manipulation`.
- **Quantités** : Boutons +/− **corrigés** en `min-w-[44px] min-h-[44px]` (au lieu de w-8 h-8).
- **Formulaire** : Prénom, nom, **téléphone** (`type="tel"`, `autocomplete="tel"`), type de service (Click & Collect / Livraison), adresse livraison. **Corrigé** : champs en `min-h-[48px]` + `touch-manipulation` ; boutons type service idem.
- **Upselling** : `overflow-x-auto` sur la bande de suggestions (scroll horizontal propre).

### 2.4 Footer

- **Newsletter** : **Corrigé** : input `min-h-[48px]`, bouton envoi `min-w-[48px] min-h-[48px]`, `type="email"` + `autocomplete="email"`, `aria-label` sur le bouton.
- **Bas de page** : `pb-[max(2.5rem,env(safe-area-inset-bottom))]` pour éviter le recouvrement par la barre système.

### 2.5 Hero, Menu, Customize, About, Contact

- **Hero** : Titres en `text-5xl md:text-8xl`, padding `pt-32 pb-20 px-6` ; pas de largeur fixe en px.
- **Menu / Customize** : Grilles responsives (grid), pas de débordement horizontal identifié.
- **Contact** : Grille `grid-cols-1 lg:grid-cols-3` ; cartes et liens tactiles.
- **Order tracking** (`/order/[token]`) : Client component ; à tester manuellement sur mobile pour lisibilité et boutons.

---

## 3. Dashboard admin – Compatibilité iPad

**Contexte** : Le dashboard est utilisé sur **iPad** pour la gestion des commandes (validation, cuisine, reçus, etc.).

### 3.1 Breakpoints et disposition

- **&lt; 768px (téléphone)** :  
  - Sidebar **cachée** (`hidden md:flex` sur `AdminSidebar`).  
  - **Barre mobile** : logo + titre « Dal Cielo Admin » + bouton hamburger (déjà `min-h-[44px]`).  
  - **Menu mobile** : overlay plein écran avec les mêmes entrées que la sidebar ; **corrigé** : titre de la vue affiché en haut du contenu principal (`md:hidden`), pour savoir dans quelle section on est sans rouvrir le menu.

- **≥ 768px (iPad et plus)** :  
  - **Sidebar visible** : largeur `w-64` (étendue) ou `w-20` (réduite).  
  - **Contenu principal** : `md:pl-80` (sidebar étendue) ou `md:pl-36` (réduite).  
  - Sur iPad 768px de large : zone de contenu ≈ 768 − 256 = 512px (sidebar étendue) ou 768 − 80 = 688px (réduite). **Conforme** pour listes et cartes.

### 3.2 Sidebar (iPad / desktop)

- **Nav** : Chaque entrée **corrigée** en `min-h-[44px]` + `touch-manipulation`.  
- **Déconnexion** et **bouton réduire/étendre** : **corrigés** en `min-h-[44px]` + `touch-manipulation` + `aria-label`.  
- Sidebar en `overflow-y-auto overflow-x-hidden` : pas de débordement horizontal.

### 3.3 Contenu principal admin

- **Main** : `overflow-x-hidden` pour éviter tout scroll horizontal global.
- **Titre de page** : Sur desktop/tablette, titre + date dans la zone « Page header » ; sur **mobile**, titre + date courts ajoutés en haut du contenu (`md:hidden`).

### 3.4 Listes et tableaux

- **OrdersList** : Cartes par commande (pas de table large) ; filtres en `flex flex-wrap` ; recherche en `min-h-[48px]` + `touch-manipulation`. **FilterButton** : déjà `min-h-[44px]`.
- **QuickActions** (dans chaque commande) : Liens/boutons **corrigés** en `min-h-[44px]` + `touch-manipulation` ; modales (retard, refus) : bouton fermer **corrigé** en 44×44.
- **ReceiptsManager** : Table desktop dans un `overflow-x-auto` ; sur petit écran, grille de cartes (pas de table) pour éviter overflow.
- **KitchenMode** : Boutons d’action déjà en `min-h-[52px]` / `min-h-[60px]` + `touch-manipulation` ; liste des commandes en colonne (md+) avec boutons en `py-3` (tactile).

### 3.5 Écran de connexion admin (PIN)

- **Formulaire** : `min-h-[56px]` sur l’input PIN, bouton « Se connecter » `min-h-[52px]`, `touch-manipulation`.  
- **Adapté** mobile et iPad.

---

## 4. Résumé des corrections appliquées

| Zone | Correction |
|------|------------|
| **Header** | Boutons mobile (panier, menu) : `min-w-[44px] min-h-[44px]`, `touch-manipulation`, `aria-label`. |
| **CartDrawer** | Bouton fermer et boutons +/− quantité : 44×44 ; champs formulaire et boutons type service : `min-h-[48px]` + `touch-manipulation` ; adresse livraison idem. |
| **Footer** | Input email `min-h-[48px]`, bouton envoi 48×48, `autocomplete="email"`, `aria-label`. |
| **Admin** | Titre de page visible sur mobile ; `main` en `overflow-x-hidden`. |
| **AdminSidebar** | Tous les boutons nav + déconnexion + toggle : `min-h-[44px]` + `touch-manipulation` ; `aria-label` sur le toggle. |
| **QuickActions** | Liens Appeler/Message et boutons (Valider, Refuser, etc.) : `min-h-[44px]` + `touch-manipulation` ; bouton fermer modale refus : 44×44. |

---

## 5. Tests recommandés

- **Mobile (téléphone)** :  
  - Navigation (menu, panier, pages), formulaire panier (tel, type service, adresse), footer (newsletter), suivi commande.  
  - Admin : connexion PIN, menu mobile, liste commandes, actions rapides, mode cuisine.
- **iPad (portrait / paysage)** :  
  - Admin : sidebar + contenu, liste commandes, validation, cuisine, reçus ; vérifier qu’aucun débordement horizontal et que tous les boutons sont confortables au doigt.
- **Orientations** : Tester portrait et paysage sur au moins une page type (accueil, panier, admin commandes).
- **Lighthouse** : Onglet « Mobile » (performance, accessibilité, bonnes pratiques).

---

*Audit réalisé selon les règles kb-mobile-responsive (client-builder-rules). À mettre à jour après changements majeurs sur le responsive ou l’admin.*
