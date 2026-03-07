# Test de paiement Stripe (mode test)

Ce document décrit comment tester le flux de paiement Stripe en local.

## Contexte

- **Validation admin** : `POST /api/admin/validate` crée un Price + Payment Link Stripe (metadata `orderId`), enregistre l’URL en base, renvoie `paymentLink`.
- **Client** : reçoit le lien sur `/order/[token]` (polling), clique « Payer maintenant » → Stripe Checkout.
- **Webhook** : `POST /api/webhooks/stripe` écoute `checkout.session.completed`, récupère `orderId`, appelle `updateOrderStatus(orderId, 'paid')`.

En local, Stripe ne peut pas appeler votre machine : il faut utiliser la **Stripe CLI** pour faire suivre les événements vers votre serveur.

---

## 1. Variables d’environnement (mode test)

Dans `.env.local` :

- `STRIPE_SECRET_KEY` : clé secrète **test** (sk_test_...)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` : clé publiable **test** (pk_test_...)
- `STRIPE_WEBHOOK_SECRET` : fourni par la Stripe CLI (voir étape 2), pas par le Dashboard

**Où trouver les clés test :** [Stripe Dashboard → Clés API](https://dashboard.stripe.com/test/apikeys) (mode **Test** activé).

---

## 2. Recevoir les webhooks en local (Stripe CLI)

1. **Installer Stripe CLI**  
   [Documentation](https://stripe.com/docs/stripe-cli) — macOS : `brew install stripe/stripe-cli/stripe`

2. **Se connecter**  
   ```bash
   stripe login
   ```

3. **Lancer le forwarding** (garder ce terminal ouvert pendant les tests)  
   ```bash
   npm run stripe:webhook
   ```  
   Ou directement :  
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```  
   La CLI affiche un **webhook signing secret** (whsec_...). **Copier ce secret** dans `.env.local` comme `STRIPE_WEBHOOK_SECRET`, puis **redémarrer le serveur Next.js**.

4. **Vérifier** : après un paiement test, le terminal CLI doit afficher l’événement `checkout.session.completed` et une réponse 200.

---

## 3. Scénario de test bout en bout

1. Démarrer l’app : `npm run dev`
2. Démarrer le webhook : `npm run stripe:webhook` (ou `stripe listen ...`), mettre à jour `STRIPE_WEBHOOK_SECRET` dans `.env.local`, redémarrer `npm run dev`
3. **Créer une commande** : site → panier → formulaire → envoyer → redirection `/order/[token]` (« En attente de validation »)
4. **Valider** : admin → Commandes → « Valider la commande » sur la commande
5. **Côté client** : sur `/order/[token]`, le bouton « Payer maintenant » apparaît (polling). Cliquer.
6. **Stripe Checkout** : utiliser une carte de test (section 4), valider le paiement
7. **Vérifier** :
   - CLI : événement `checkout.session.completed`, réponse 200
   - Base de données : commande en statut `paid`
   - Page `/order/[token]` : « Paiement confirmé » (après refresh ou polling)

Si le statut ne passe pas à `paid`, vérifier les logs du serveur Next et que `STRIPE_WEBHOOK_SECRET` est bien celui affiché par `stripe listen`.

---

## 4. Cartes de test Stripe

Utiliser **uniquement** des numéros de carte **test**.

| Cas        | Numéro              | Résultat                    |
| ---------- | ------------------- | --------------------------- |
| Succès     | 4242 4242 4242 4242 | Paiement accepté            |
| Refus      | 4000 0000 0000 0002 | Carte refusée               |
| 3D Secure  | 4000 0025 0000 3155 | Authentification 3D demandée |

- **Date** : toute date future (ex. 12/34)
- **CVC** : 3 chiffres (ex. 123)
- **Code postal** : au choix (ex. 97200)

Référence : [Stripe – Cartes de test](https://docs.stripe.com/testing#cards).

---

## 5. Checklist

- [ ] Clés **test** Stripe dans `.env.local` (sk_test_..., pk_test_...)
- [ ] Stripe CLI installée et `stripe login` effectué
- [ ] `npm run stripe:webhook` lancé et `STRIPE_WEBHOOK_SECRET` copié dans `.env.local`, serveur redémarré
- [ ] Test complet : commande → validation admin → Payer maintenant → carte 4242... → statut `paid` en base et sur la page suivi

---

## 6. Production

- Remplacer par les **clés live** (sk_live_..., pk_live_...) dans les variables d’environnement de l’hébergeur.
- **Dashboard Stripe → Developers → Webhooks** : ajouter l’endpoint `https://votre-domaine.com/api/webhooks/stripe`, événement `checkout.session.completed`, et utiliser le **Signing secret** (whsec_...) fourni par Stripe comme `STRIPE_WEBHOOK_SECRET` en production.
