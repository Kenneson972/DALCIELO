# Plan Final - Integration n8n Reservations vers Dashboard Admin

Objectif: connecter le bot n8n au dashboard admin pour recevoir, stocker et traiter les reservations de maniere fiable (V1 robuste, rapide a ship).

---

## 1) Scope V1 (ce qu'on livre)

- Reception des reservations depuis n8n via API securisee.
- Stockage en base Supabase (`reservations`).
- Visualisation et gestion dans `/admin` (onglet Reservations).
- Actions admin: confirmer, refuser, annuler, marquer arrive.
- Gestion anti-doublons (app + DB).
- Endpoint health pour monitorer l'API depuis n8n.

---

## 2) Prerequis

- Variables d'environnement configurees:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `N8N_ADMIN_API_KEY` (secret fort, UUID recommande)
- Projet Supabase accessible.
- n8n accessible (workflow edit + run).
- Postman/Insomnia pour tests API.
- Code actuel sauvegarde sur git (rollback facile).

---

## 3) Schema SQL (MVP strict)

```sql
CREATE TABLE reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),

  client_name text NOT NULL,
  client_phone text NOT NULL,

  reservation_date date NOT NULL,
  reservation_time text NOT NULL, -- "19:30"
  guests int NOT NULL CHECK (guests BETWEEN 1 AND 20),
  notes text,

  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','confirmed','refused','arrived','cancelled')),
  refused_reason text,

  source text DEFAULT 'n8n',
  confirmed_at timestamptz,
  cancelled_at timestamptz
);

CREATE INDEX idx_reservations_date_time
  ON reservations(reservation_date, reservation_time);

CREATE INDEX idx_reservations_status
  ON reservations(status);

CREATE INDEX idx_reservations_phone
  ON reservations(client_phone);

-- Anti-doublon robuste (race condition-safe)
CREATE UNIQUE INDEX idx_reservations_unique_active
ON reservations(client_phone, reservation_date, reservation_time)
WHERE status NOT IN ('cancelled', 'refused');
```

---

## 4) API Reservations (App Router Next.js)

### Route 1: `POST /api/admin/reservations`

Responsabilites:
- verifier le secret `x-api-key`.
- valider le payload (Zod).
- normaliser le telephone.
- detecter doublon applicatif (`maybeSingle()`).
- inserer la reservation.
- mapper `23505` en `409`.

Regles de retour:
- `201` created
- `400` payload invalide
- `401` unauthorized
- `409` duplicate reservation
- `500` internal error

Bonnes pratiques:
- utiliser `NextResponse.json(..., { status })` (App Router).
- ne pas exposer de details sensibles en prod.

### Route 2: `GET /api/admin/reservations/health`

Responsabilites:
- verifier `x-api-key`.
- retourner statut API (`ok`) + timestamp.
- headers anti-cache:
  - `Cache-Control: no-store, no-cache, must-revalidate`
  - `Pragma: no-cache`
  - `Expires: 0`

Option:
- test connexion DB et retour `degraded`/`503` si indisponible.

---

## 5) Validation + normalisation (payload)

Payload attendu:

```json
{
  "client_name": "Jean Dupont",
  "client_phone": "0696 12 34 56",
  "reservation_date": "2026-02-10",
  "reservation_time": "19:30",
  "guests": 2,
  "notes": "Table exterieure si possible",
  "source": "n8n"
}
```

Normalisation telephone:
- si commence par `+` -> garder tel quel.
- si commence par `0` -> convertir en `+596...`.
- si commence par `596` -> prefixer `+`.
- si format local mobile `696xxxxxx` -> convertir en `+596...`.

---

## 6) n8n Workflow cible

1. Trigger (WhatsApp/chat/form).
2. Normalisation des champs.
3. Health check API (`GET /health`).
4. Envoi reservation (`POST /api/admin/reservations`).
5. Gestion erreurs:
   - si `409`: stop retry (doublon legitime).
   - si `401/500/timeout`: retry x3 + alerte interne.
6. Fallback:
   - log backup Google Sheets/Airtable en cas d'echec final.
   - notification WhatsApp interne ("reservation recue mais API down").

---

## 7) Dashboard Admin - UX a implementer

Ajouter un onglet `reservations` dans `/admin`:

- Composant `ReservationsList`.
- Filtres:
  - `today` (par defaut)
  - `new`
  - `confirmed`
  - `all`
- Actions:
  - confirmer (`status=confirmed`, `confirmed_at=now`)
  - refuser (`status=refused`, `refused_reason`)
  - annuler (`status=cancelled`, `cancelled_at=now`)
  - marquer arrive (`status=arrived`)

Important fuseau:
- pour "Aujourd'hui", calculer la date avec `America/Martinique` (pas `toISOString().split('T')`).

---

## 8) WhatsApp templates reservations

Templates recommandes:
- confirmation reservation (date, heure, couverts)
- refus (raison)
- rappel reservation
- lien Google Maps inclus dans le message de confirmation

---

## 9) Tests obligatoires

### API
- `401` sans secret ou secret invalide.
- `400` payload invalide.
- `201` reservation valide.
- `409` doublon direct.
- `409` doublon en race condition (erreur `23505` mappee).

### Admin
- affichage filtre `today`.
- changement de statut OK.
- timestamps `confirmed_at` / `cancelled_at` correctement remplis.
- tri et lisibilite mobile/tablette.

### n8n
- health check OK.
- create reservation OK.
- fallback actif si API indisponible.

---

## 10) Ordre d'execution recommande (demain)

### Matin
1. Creer table + index + contrainte unique.
2. Implementer route `POST /api/admin/reservations`.
3. Implementer route `GET /api/admin/reservations/health`.
4. Tester API via Postman (401/400/201/409).

### Apres-midi
5. Brancher workflow n8n (health + post + error branch).
6. Integrer onglet Reservations dans l'admin.
7. Ajouter templates WhatsApp reservation.
8. QA complete + corrections mineures.

### Fin de journee
9. Test E2E (n8n -> API -> DB -> admin).
10. Push + recap technique.

---

## 11) Definition of Done

- Une reservation envoyee par n8n apparait en moins de 5s dans l'admin.
- Aucun doublon possible (meme en envoi simultane).
- Les erreurs sont explicites (`401`, `400`, `409`, `500`).
- Le filtre "Aujourd'hui" est correct en Martinique.
- Un fallback n8n existe pour ne perdre aucune reservation.

---

## 12) Risques et mitigation

- Doublons concurrentiels -> contrainte unique partielle + mapping `23505`.
- Decalage date -> timezone `America/Martinique`.
- API down -> fallback n8n + retries.
- Leak secret -> jamais logger `x-api-key`, headers no-store sur health.

---

Plan V1 valide pour ship rapide + base propre pour V2 (analytics reservations, no-show, reminders auto, etc.).
