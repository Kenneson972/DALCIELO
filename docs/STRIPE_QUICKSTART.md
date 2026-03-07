# Lancer Stripe en local – démarrage rapide

Guide condensé pour ne pas oublier comment lancer Stripe et les webhooks.

---

## Prérequis (une seule fois)

1. **Installer la Stripe CLI** (macOS)  
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Se connecter**  
   ```bash
   stripe login
   ```

3. **Variables d’environnement** dans `.env.local`  
   - `STRIPE_SECRET_KEY` (sk_test_...)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_test_...)
   - `STRIPE_WEBHOOK_SECRET` → fourni par la CLI à la 1ère exécution de `stripe listen` (voir ci-dessous)

---

## Lancer Stripe (chaque session de dev)

### Terminal 1 – App Next.js
```bash
npm run dev
```

### Terminal 2 – Webhook Stripe
```bash
npm run stripe:webhook
```

**Important** : la première fois (ou si vous avez relancé la CLI), la commande affiche un **webhook signing secret** (`whsec_...`). Copiez-le dans `.env.local` sous `STRIPE_WEBHOOK_SECRET`, puis redémarrez `npm run dev`.

---

## Résumé

| Action          | Commande               |
|-----------------|------------------------|
| App Next.js     | `npm run dev`          |
| Webhook Stripe  | `npm run stripe:webhook` |

**Doc détaillée** : `docs/STRIPE_TEST.md` (cartes test, scénario complet, checklist).
