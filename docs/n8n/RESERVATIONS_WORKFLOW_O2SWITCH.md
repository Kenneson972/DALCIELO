# n8n Workflow - Reservations vers API Admin

Ce guide configure un workflow n8n compatible avec:

- `GET /api/admin/reservations/health`
- `POST /api/admin/reservations`

## Variables n8n recommandees

- `APP_BASE_URL` (ex: `https://ton-domaine.com`)
- `N8N_ADMIN_API_KEY` (meme valeur que dans `.env` Next.js)
- `FALLBACK_ALERT_PHONE` (numero interne pour alertes)

## Sequence des noeuds

1. **Trigger**
   - Source au choix: WhatsApp, formulaire, webhook, chatbot.
2. **Normalize Reservation**
   - Nettoyer et mapper les champs:
     - `client_name`
     - `client_phone`
     - `reservation_date` (`YYYY-MM-DD`)
     - `reservation_time` (`HH:mm`)
     - `guests` (integer)
     - `notes` (optional)
     - `source` (ex: `n8n-whatsapp`)
3. **Health Check** (HTTP Request)
   - `GET {{APP_BASE_URL}}/api/admin/reservations/health`
   - Header: `x-api-key: {{N8N_ADMIN_API_KEY}}`
4. **Create Reservation** (HTTP Request)
   - `POST {{APP_BASE_URL}}/api/admin/reservations`
   - Headers:
     - `Content-Type: application/json`
     - `x-api-key: {{N8N_ADMIN_API_KEY}}`
   - Body JSON: payload normalise.
5. **IF statusCode == 201**
   - Branche succes:
     - envoyer confirmation interne/client selon besoin.
6. **IF statusCode == 409**
   - Branche doublon:
     - stop retry.
     - log event "duplicate".
7. **Error Branch (401/5xx/timeout)**
   - Retry avec backoff (max 3 tentatives).
   - Si echec final:
     - envoyer alerte interne WhatsApp/SMS.
     - ecrire en backup (Google Sheets ou Airtable).

## Regles de retry conseillees

- `409`: pas de retry.
- `401`: pas de retry (probleme de secret).
- `500/503/timeout`: retry 3 fois avec delai progressif (30s, 2min, 5min).

## Exemple de payload

```json
{
  "client_name": "Marie Joseph",
  "client_phone": "0696 12 34 56",
  "reservation_date": "2026-02-12",
  "reservation_time": "19:30",
  "guests": 4,
  "notes": "Anniversaire, table calme",
  "source": "n8n-whatsapp"
}
```

## Verification rapide

1. Execeruter health check: attendre `200`.
2. Envoyer une reservation test: attendre `201`.
3. Rejouer exactement le meme payload: attendre `409`.
4. Verifier apparition dans l'onglet Admin > Reservations.
