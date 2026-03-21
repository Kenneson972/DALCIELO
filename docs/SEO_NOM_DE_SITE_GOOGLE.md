# Afficher « Pizza Dal Cielo » au lieu de « pizzadalcielo.com » dans Google

Google affiche un **nom de site** à côté du favicon (comme « Tripadvisor »). Ce nom est **choisi automatiquement** ; on ne peut pas le forcer à 100 %, mais on peut **fortement orienter** Google.

Référence officielle : [Site names in Google Search](https://developers.google.com/search/docs/appearance/site-names)

## Ce qui a été mis en place dans le projet

| Signal | Fichier / emplacement |
|--------|------------------------|
| **JSON-LD `WebSite`** avec `name`, `url`, `alternateName`, `publisher` (Organization + logo) | `src/components/seo/JsonLd.tsx` |
| **`Organization`** dédiée (nom, URL, logo, `sameAs`) | idem |
| **`og:site_name`** | `src/app/layout.tsx` → `openGraph.siteName` |
| **`application-name`** (metadata Next) | `layout.tsx` → `applicationName` |
| **Apple Web App title** | `layout.tsx` → `appleWebApp.title` |
| **Web App Manifest** (`name` / `short_name`) | `src/app/manifest.ts` → `/manifest.webmanifest` |

Pensez à **garder le même nom** partout (logo, footer, titre visible sur la page d’accueil).

## Vérifications après déploiement

1. **Test des résultats enrichis** : [Rich Results Test](https://search.google.com/test/rich-results) sur `https://pizzadalcielo.com/` — doit voir `WebSite` + `Organization` + `Restaurant`.
2. **Google Search Console** → **Inspection d’URL** sur la page d’accueil → **Tester la page en direct** puis **Demander une indexation** pour accélérer la prise en compte.

## Délais

Même avec tout en place, Google peut mettre **plusieurs jours à plusieurs semaines** à mettre à jour l’affichage. Le domaine peut encore apparaître si l’algorithme estime que c’est plus « clair » pour l’utilisateur.

## Fiche Google Business Profile

Un profil **Google Maps / GBP** cohérent avec le nom **Pizza Dal Cielo** et le même site aide les signaux croisés (lien déjà présent dans le JSON-LD via `sameAs` si l’URL share est correcte).
