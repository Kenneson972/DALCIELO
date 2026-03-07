# Supabase – Pizza dal Cielo

Scripts SQL pour créer les tables dans Supabase (PostgreSQL).

## Configuration

1. Crée un projet Supabase : [supabase.com](https://supabase.com)
2. Récupère dans **Project Settings > API** :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (secret, jamais côté client)

## Exécution des scripts

Dans **Supabase Dashboard > SQL Editor**, exécute les fichiers dans cet ordre :

1. `001_create_orders.sql`
2. `002_create_stocks.sql`
3. `003_create_reservations.sql`

## Variables d'environnement

Dans `.env.local` :

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Supprimer les variables MySQL : `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
