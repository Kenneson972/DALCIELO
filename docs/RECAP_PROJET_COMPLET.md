# Récapitulatif complet du projet — Pizza Dal Cielo

Document **non technique** : à quoi sert le site, pour qui, et comment tout s’enchaîne au quotidien.  
**Dernière mise à jour** : mars 2026.

---

## 1. En deux phrases

**Pizza Dal Cielo** est une pizzeria artisanale à **Bellevue, Fort-de-France (Martinique)**.  
Le site sert de **vitrine** (carte, histoire, contact) et permet aux clients de **commander en ligne**, d’être **validés par l’équipe**, de **payer par carte** puis de **suivre leur commande** jusqu’à la récupération ou la livraison.

---

## 2. Pour qui, et quel objectif

| Public | Objectif |
|--------|----------|
| **Clients** | Découvrir la carte, composer un panier, envoyer une commande, payer en sécurité, suivre l’avancement (retrait ou livraison). |
| **Équipe en salle / cuisine** | Recevoir les commandes, valider ou refuser, envoyer le lien de paiement, faire avancer les statuts (préparation, prête, livrée…). |
| **Gestion** | Tableau de bord sur tablette ou ordinateur : chiffres du jour, stocks, menu, annonces sur le site, avis clients, reçus. |

L’agence **Karibloom** accompagne le projet (conception, développement, évolutions).

---

## 3. Ce que voit le client sur le site

### Pages principales

- **Accueil** : ambiance de la pizzeria, **Pizza du Chef** (offre du moment), défilement des pizzas, lien vers **Instagram**, accès au menu et au contact.
- **Menu** : toutes les pizzas, friands, boissons (et desserts si activés), avec **fiches détaillées** (ingrédients, prix, avis clients modérés).
- **Commander** : rappel des moyens de commande (site, téléphone, WhatsApp, CieloBot).
- **À propos** : histoire, valeurs, démarche artisanale.
- **Contact** : adresse, horaires, carte, formulaire, réseaux sociaux.

### Panier et commande

- Le client **ajoute des produits au panier**, renseigne **nom, téléphone**, choisit **retrait ou livraison**, une **créneau horaire**, et **envoie la demande**.
- La commande **attend d’abord la validation** de l’équipe : ce n’est **pas** un paiement immédiat au moment du panier.
- Après validation, le client reçoit (selon le cas) un **lien pour payer en ligne** par carte, puis une **page de suivi** avec l’état de la commande.

### CieloBot (chat sur le site)

- Assistant **conversationnel** pour poser des questions, être guidé, ou **passer commande** selon la configuration.
- Complète le téléphone et WhatsApp pour les clients qui préfèrent le chat.

### Fermetures et messages

- Le **lundi**, la pizzeria peut apparaître comme **fermée** en ligne (prise de commande bloquée ce jour-là, selon réglages).
- L’équipe peut aussi signaler un **four indisponible** ou un **délai plus long** : les clients le voient sur la page d’accueil (temps d’attente).

---

## 4. Parcours type d’une commande (étapes métier)

1. **Client** : remplit le panier et envoie la commande.  
2. **Équipe** : reçoit une alerte, **lit la commande** sur le dashboard admin.  
3. **Équipe** : **valide** → un **paiement en ligne** est proposé au client ; ou **refuse** avec un motif.  
4. **Client** : **paie** si la commande est acceptée.  
5. **Équipe** : fait avancer les étapes (**en préparation**, **prête**, **en livraison** le cas échéant, **terminée**).  
6. **Client** : suit tout ça sur **sa page de suivi** (lien avec un code unique).

Les **notifications** (WhatsApp, automatisations) peuvent compléter le flux selon ce qui est branché côté équipe technique.

---

## 5. Le dashboard admin (résumé)

Interface protégée par **code PIN** (`/admin`), pensée pour **tablette** en cuisine ou au comptoir.

À titre de rappel **sans détail technique** :

- **Vue d’ensemble** : indicateurs du jour, export des commandes en tableau, options **accueil** (slider pizzas, desserts visibles ou non), réglage **four / délai** pour les clients.
- **Commandes** : liste, recherche, validation, refus, lien paiement, messages au client, avancement des statuts.
- **Cuisine** : affichage **grand format** pour enchaîner les commandes en préparation.
- **Menu et produits** : **modifier la carte** (prix, textes, photos, disponibilité, Pizza du Chef, nouveaux articles).
- **Annonce** : pop-ups sur le site (promo, chef, événement, alerte).
- **Avis** : **accepter ou refuser** les avis avant affichage sur les fiches produits.
- **Stocks** : ajuster les quantités pour le suivi interne.
- **Reçus** : retrouver les commandes payées et pièces comptables si le flux PDF est utilisé.
- **Analytics** : graphiques d’activité.

*Guide pas à pas (langage simple) :* **`docs/GUIDE_DASHBOARD_ADMIN.md`**.

---

## 6. Image et contenu

- Identité **tropicale / chaleureuse** : couleurs corail, crème, touches soleil ; typo lisible sur mobile.
- Ton du site et des textes alignés sur la marque **Pizza Dal Cielo** (orthographe officielle avec **Dal** en majuscule pour le SEO et la cohérence).
- Données de contact, horaires et réseaux sont **centralisés** pour rester cohérents partout (header, pied de page, chatbot, données structurées pour Google).

---

## 7. Conformité et informations légales

- Page **Mentions légales** accessible depuis le site.
- Respect des règles habituelles : **cookies / consentement** si outils d’analyse ou publicité sont ajoutés ; hébergement et société indiqués dans les mentions.

---

## 8. Maintenance et documentation

| Élément | Rôle |
|--------|------|
| `docs/GUIDE_DASHBOARD_ADMIN.md` | Mode d’emploi du back-office pour l’équipe. |
| `docs/ACTIONS_LOG.md` | Journal des changements importants sur le projet. |
| `docs/logs/` | Détail des sessions de travail par date. |
| `README.md` | Informations pour les développeurs (installation, variables d’environnement). |

Pour toute **évolution fonctionnelle** ou **problème technique**, l’intervention passe par l’**équipe Karibloom** ou le mainteneur désigné.

---

## 9. En résumé

Le projet livre une **expérience client complète** : découvrir, commander avec validation humaine, payer en ligne, suivre la préparation — et un **outil de pilotage** pour l’équipe (commandes, cuisine, carte, communication sur le site).  
La complexité technique (hébergement, base de données, paiement, automatisations) reste **invisible** pour l’utilisateur final et peut être détaillée dans les documents techniques ou par l’équipe projet si besoin.

---

*Pizzeria **Pizza Dal Cielo** — Fort-de-France, Martinique. Projet réalisé dans le cadre du **Client Builder Karibloom**.*
