# Dépannage — dashboard : nombre de commandes / « pending » incohérents

## Symptôme observé

- **Supabase** (requête SQL) : par ex. **11** commandes, **0** en `pending_validation`.
- **Dashboard** : affiche **plus** de commandes (ex. 16) avec des **pending** qui n’existent plus en base.

---

## Bug corrigé côté serveur — statut inconnu → « à valider »

Dans `ordersStore.rowToOrder`, **toute valeur de `status` non reconnue** (chaîne vide, typo, ancienne valeur avant migration CHECK) était mappée sur **`pending_validation`**.

Résultat : le dashboard affichait des commandes en **« À valider »** alors qu’en SQL `WHERE status = 'pending_validation'` ne les retournait pas (car en base le champ était autre chose ou vide).

**Correction** : statut vide ou inconnu → affichage comme **`completed`** (archivé), avec log en dev. À faire ensuite en base : corriger ou supprimer ces lignes si besoin.

Requête utile pour repérer les anomalies :

```sql
SELECT id, status, created_at, client_name
FROM orders
WHERE status IS NULL
   OR trim(status::text) = ''
   OR status::text NOT IN (
     'pending_validation','waiting_payment','paid','in_preparation',
     'ready','in_delivery','completed','cancelled','refused'
   );
```

---

## Cause la plus probable (confirmée par le code historique)

1. Chaque commande passée par le site peut être **copiée dans le navigateur** (`localStorage`, clé `pdc_orders`) au moment de l’envoi du panier.
2. L’admin recharge la liste via **`/api/admin/orders`**. Si cette requête **échoue** ou renvoie un format inattendu, **l’ancien code** affichait en secours **`localStorage`** sans message clair → **anciennes commandes + faux « à valider »** alors que Supabase est déjà à jour.

**Correctif appliqué (code)** :

- Plus d’utilisation de `getAllOrders()` pour remplir le dashboard en cas d’erreur.
- Message d’erreur explicite si l’API ne renvoie pas un tableau `orders`.
- Après un chargement **réussi**, le `localStorage` `pdc_orders` est **aligné** sur la liste serveur pour faire disparaître les fantômes sur cet appareil.

Après déploiement : **recharger le dashboard** (idéalement **vider le cache** ou onglet privé pour tester une fois).

---

## Autres hypothèses à vérifier si le problème continue

| # | Hypothèse | Comment vérifier |
|---|-----------|------------------|
| 1 | **Deux projets Supabase** : celui consulté en SQL ≠ celui configuré sur **Vercel** (`NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`). | Dans Vercel → Settings → Env, comparer l’URL du projet avec celui du tableau Supabase où vous faites le SQL. |
| 2 | **Ancien build** encore servi (CDN / onglet figé). | Hard refresh, autre navigateur, ou vérifier la date du dernier déploiement Vercel. |
| 3 | **Réponse API non JSON** (page d’erreur HTML, maintenance). | Onglet **Réseau** (F12) sur `GET /api/admin/orders?filter=all` → statut **200** et corps type JSON avec `"orders":[...]`. |
| 4 | **401 / 403 / 429 / 503** sur la même route : PIN faux, CSRF sur les PATCH seulement (GET normalement exempt), rate limit, `ADMIN_PIN` manquant en prod. | Regarder le **statut HTTP** de `admin/orders` dans l’onglet Réseau. |
| 5 | **Cache** agressif (rare avec `cache: 'no-store'`). | Tester en navigation privée. |
| 6 | **Plusieurs onglets** : un ancien onglet admin + un nouveau ; confusion visuelle (peu probable pour le total si une seule source de vérité). | Fermer tous les onglets `/admin`, n’en rouvrir qu’un. |
| 7 | **Lecture « active » vs « toutes »** dans l’UI : le badge compte des statuts différents du filtre affiché. | Comparer le nombre de lignes dans **Toutes** avec le total SQL `COUNT(*)`. |
| 8 | **Row Level Security (RLS)** Supabase : l’API service role voit tout, mais une autre clé pourrait filtrer (peu probable si `supabaseAdmin` utilise la **service role**). | Confirmer que les routes admin utilisent bien la clé **service role** côté serveur uniquement. |

---

## Check-list rapide

1. Déployer la dernière version du front (avec le correctif `loadData` + synchro `pdc_orders`).
2. Ouvrir `/admin`, se connecter, ouvrir **F12 → Réseau** → confirmer **`/api/admin/orders?filter=all`** en **200** et **`orders`** = longueur attendue.
3. Si besoin : **stockage** du site → supprimer `pdc_orders` pour ce domaine (ou tout le stockage local du site) puis recharger l’admin.

---

*Document lié à la session de debug « 11 vs 16 commandes » — mars 2026.*
