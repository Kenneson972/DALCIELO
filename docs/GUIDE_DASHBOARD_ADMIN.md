# Guide du dashboard admin — Pizza Dal Cielo

Comment utiliser l’admin au quotidien, sans jargon technique.

---

## Se connecter

- Ouvrez l’adresse du site en ajoutant **`/admin`** à la fin (exemple : `pizzadalcielo.com/admin`).
- Entrez le **code PIN** que vous a donné l’équipe (chiffres uniquement). En prod, prévoyez au moins **6 chiffres**.
- Une fois connecté, vous restez connecté tant que vous ne vous **déconnectez** pas (bouton en bas du menu).
- **Sécurité** : ne communiquez le PIN qu’aux personnes autorisées. Si vous le partagez trop largement, demandez à l’équipe technique d’en définir un nouveau.

**Si trop de codes faux d’affilée** : l’accès peut être bloqué quelques minutes — attendez puis réessayez.

---

## Le menu à gauche (sur tablette ou ordinateur)

Sur téléphone, touchez l’icône **menu** en haut pour voir la même liste.

| Section | À quoi ça sert |
|--------|----------------|
| **Vue d’ensemble** | Chiffres du jour + réglages du site (slider, desserts, four, délai client) |
| **Commandes** | Voir toutes les commandes, les valider, appeler le client, faire avancer le statut |
| **Reçus** | Billets / reçus des commandes déjà payées, classement compta |
| **Cuisine** | Grande vue pour la préparation (une commande à la fois) |
| **Menu & Produits** | **Modifier la carte** : prix, photos, disponibilité, nouveaux articles |
| **Annonce** | Petites fenêtres sur le site (promo, Pizza du Chef, fermeture…) |
| **Avis clients** | Accepter ou refuser les avis avant qu’ils s’affichent |
| **Stocks** | Quantités en stock par article |
| **Analytics** | Graphiques sur l’activité |

---

## Vue d’ensemble

- Les **cartes en haut** résument la journée : chiffre d’affaires, nombre de commandes, commandes en cours, temps moyen de préparation.
- La page se **met à jour toute seule** régulièrement ; vous voyez « Mis à jour il y a… » en haut.
- **Sons** : une **nouvelle commande à valider** ou un **paiement** peuvent faire un bip. Si vous n’entendez rien, **touchez une fois l’écran** puis réessayez (les navigateurs bloquent parfois le son au démarrage).

**Réglages utiles :**

- **Slider des pizzas** : allumer ou éteindre le défilé de pizzas sur la **page d’accueil** du site.
- **Desserts** : montrer ou cacher la **rubrique desserts** sur le menu en ligne. Les desserts eux-mêmes se gèrent dans **Menu & Produits**.
- **Four** : si le four est **indisponible**, les clients peuvent voir un message et ne plus pouvoir commander en ligne — à utiliser en vraie panne ou fermeture cuisson.
- **Temps d’attente** : ce que le client voit comme délai estimé. Soit le site **calcule tout seul**, soit vous indiquez un **nombre de minutes** à la main — puis enregistrez avec le bouton prévu.

**Exporter un tableau** : bouton **Exporter CSV** pour ouvrir les commandes dans Excel ou un tableur.

---

## Commandes

**Chercher** : tapez un **nom** ou un **numéro de téléphone**.

**Filtres** :

- **En cours** : tout ce qui n’est pas encore terminé ou annulé.
- **Toutes** : l’historique complet chargé.
- **Terminées** : terminées, annulées ou refusées.

**Étapes courantes (en clair) :**

1. **À valider** — la commande vient d’arriver. Vous vérifiez qu’elle est ok.
2. **Valider** — vous confirmez : le client reçoit un **lien pour payer** en ligne (carte bancaire).
3. **Attente paiement** — le client n’a pas encore payé ; vous pouvez le relancer (WhatsApp, téléphone).
4. **Payée** — l’argent est reçu ; vous pouvez passer en cuisine.
5. **En préparation** / **Prête** / **En livraison** — selon votre façon de travailler.
6. **Terminée** — la commande est bouclée.

Vous pouvez aussi **refuser** une commande (stock, horaire, zone…) en choisissant un **motif**.

**Boutons utiles** sur une commande :

- **WhatsApp** ou **téléphone** pour joindre le client.
- **Retard** pour prévenir avec une nouvelle heure.
- Faire avancer le statut **préparation → prête → livrée / terminée**.

---

## Reçus

- Affiche surtout les commandes **déjà payées** (et les étapes suivantes).
- Vous pouvez **filtrer par période** (aujourd’hui, semaine, mois…).
- Si un **PDF reçu** existe, vous pouvez le **télécharger** ou l’**ouvrir**.
- Vous pouvez **classer** une commande pour la compta (ex. « Comptabilité OK », « À archiver »).

---

## Mode cuisine

- Pensé pour **un écran en cuisine** (tablette).
- Une **commande à la fois** parmi celles **payées** ou **en préparation**.
- **Démarrer** quand vous commencez la pizza ; **Prête** quand elle sort du four.
- L’horloge et les gros textes aident à ne pas se tromper dans le rush.

---

## Menu & Produits

C’est ici que vous **gérez la carte** affichée sur le site.

**Vous pouvez :**

- **Modifier** un produit : **nom**, **prix**, **description**, **ingrédients**, **photo**.
- **Rendre indisponible** une pizza ou une boisson pour ce soir (sans tout effacer).
- Cocher **populaire**, **végétarien**, **sauce au choix**, etc. selon ce qui existe sur la fiche.
- **Ajouter** un nouvel article (type pizza, friand, boisson, dessert).
- **Changer les photos** : bouton d’envoi d’image (formats photo classiques ; évitez les fichiers énormes).
- Gérer la **Pizza du Chef** (écran dédié avec dates / mise en avant).

**Astuce** : si la section desserts est **masquée** sur le site, allez dans la **Vue d’ensemble** pour l’**activer** ; les desserts se modifient toujours ici.

---

## Annonce

- Crée les **petites fenêtres** (pop-up) sur le site : **Pizza du Chef**, **promo**, **événement**, **alerte** (ex. fermeture).
- Remplissez **titre**, **texte**, parfois **image** et **bouton** vers une page.
- Vous pouvez **activer / désactiver** une annonce ou lui mettre une **date de fin**.
- Un **aperçu** peut vous montrer à peu près le rendu.

---

## Avis clients

- Les avis arrivent souvent en **attente**.
- **Approuver** : l’avis peut s’afficher sur la fiche de la pizza concernée (selon le site).
- **Rejeter** : l’avis ne sera pas montré aux clients.
- Pensez à **regarder cette section** de temps en temps.

---

## Stocks

- Liste des articles avec une **quantité** (et parfois un **seuil** d’alerte).
- Utilisez **+** et **−** pour corriger le stock du jour.
- S’il y a un bouton du type **synchroniser avec le menu**, c’est surtout pour **remplir la liste au départ** — en cas de doute, demandez avant sur un site déjà en production.

---

## Analytics

- **Courbes et totaux** à partir des commandes déjà chargées.
- Utile pour voir l’**activité** sur une période.

---

## En cas de problème

| Ce qui se passe | Que faire |
|-----------------|-----------|
| Impossible de se connecter avec le PIN | Vérifier le code ; sinon contacter l’équipe (PIN ou configuration serveur). |
| « Trop de tentatives » | Attendre quelques minutes. |
| Erreur en validant une commande / paiement | Réessayer ; si ça persiste : équipe technique (paiement en ligne). |
| Liste de commandes vide ou message d’erreur base | Rafraîchir la page (F5) ; problème réseau ou serveur → équipe technique. |
| Commande introuvable après un clic | Rafraîchir la page ; sinon équipe technique. |

---

## Bonnes habitudes

1. **Déconnectez-vous** si quelqu’un d’autre utilise l’appareil après vous.
2. En cuisine, gardez **Mode cuisine** ou **Commandes** ouvert.
3. **Four en panne** → pensez à le passer en **indisponible** dans la vue d’ensemble.
4. **Menu à jour** : prix et dispo vérifiés au moins quand la carte change.

---

## Pour l’équipe technique

Détail serveur (variables d’environnement, API, Stripe, Supabase) : voir **`.env.example`** à la racine du projet et le code sous `src/app/admin` et `src/app/api/admin`.
