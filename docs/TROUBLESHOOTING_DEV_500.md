# Erreurs 500 + MIME type text/html sur les chunks JS (dev)

Symptômes : `webpack.js`, `main.js`, `react-refresh.js` en 500, « Refused to execute script… MIME type text/html ».

**Cause habituelle** : le serveur `next dev` renvoie une page d’erreur HTML au lieu du JavaScript (crash au démarrage ou pendant la compilation, ou cache `.next` incohérent).

## À faire (dans l’ordre)

1. **Arrêter** tous les `npm run dev` / processus Node sur ce projet.
2. **Supprimer le cache** :
   ```bash
   rm -rf .next
   ```
3. **Relancer** :
   ```bash
   npm run dev
   ```
4. Regarder le **terminal** : la première erreur Node/React/Next s’y affiche (copier ce message si besoin).
5. **Hard refresh** du navigateur (ou fenêtre privée) pour éviter un vieux service worker / cache d’URL.

## Polices (référence projet)

- Corps : **Poppins** (`body` dans `src/app/layout.tsx`).
- Variables CSS : **Inter**, **Poppins**, **Indie Flower**, **Playfair Display** sur `<html>`.
- Titres : `font-display` → Poppins (Tailwind).
- Accents manuscrits : classe `.font-indie` → Indie Flower.

Si après `rm -rf .next` le 500 continue, ouvrir l’URL affichée par Next dans le terminal et vérifier qu’il n’y a **pas un autre serveur** (autre app, autre port) qui répond sur la même adresse.
