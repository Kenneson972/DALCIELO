# CieloBot – Workflow n8n

Workflow n8n pour le chatbot intelligent de Pizza dal Cielo.

## Architecture

```
Client (Chatbot.tsx)
     │
     │  POST /webhook/chatbot
     │  { message, sessionId, history }
     ▼
┌─────────────────┐
│ Webhook Trigger  │
└────────┬────────┘
         ▼
┌─────────────────┐
│  OpenAI Chat     │  ← System prompt avec menu complet + règles
│  (gpt-4)         │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Parse Response   │  ← Détecte JSON create_order ou réponse texte
└────────┬────────┘
         ▼
┌─────────────────┐
│ IF - Order?      │
├────────┬────────┤
│  TRUE  │  FALSE │
▼        ▼        ▼
┌──────┐ ┌─────────┐
│POST  │ │ Format  │
│/api/ │ │ Reply   │
│orders│ └────┬────┘
└──┬───┘      ▼
   ▼     ┌─────────┐
┌──────┐ │ Respond │
│Format│ │ Webhook │
│Order │ └─────────┘
└──┬───┘
   ▼
┌──────┐
│Respond│
│Webhook│
└──────┘
```

## Installation

### 1. Importer le workflow dans n8n

1. Ouvrir n8n (cloud ou self-hosted)
2. **Import workflow** → sélectionner `CieloBot_Workflow.json`
3. Configurer les credentials OpenAI (clé API)
4. Activer le workflow

### 2. Configuration

| Variable        | Où la définir     | Valeur                                          |
|-----------------|-------------------|-------------------------------------------------|
| OpenAI API Key  | n8n Credentials   | `sk-...` (OpenAI dashboard)                     |
| APP_URL         | n8n Environment   | `https://pizzadalcielo.vercel.app` (ou votre URL)|

### 3. URL du webhook

Après activation, n8n fournit une URL du type :
```
https://ton-n8n.app.n8n.cloud/webhook/chatbot
```
ou si self-hosted :
```
https://n8n.ton-serveur.com/webhook/chatbot
```

### 4. Tester avec curl

```bash
curl -X POST https://ton-n8n.app.n8n.cloud/webhook/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Bonjour !",
    "sessionId": "test-123",
    "history": [
      { "role": "assistant", "content": "Bonjour ! Bienvenue chez Pizza dal Cielo 🍕" }
    ]
  }'
```

Réponse attendue :
```json
{
  "action": "reply",
  "message": "Bonjour ! Bienvenue chez Pizza dal Cielo 🍕 Comment puis-je vous aider ?"
}
```

## Format des échanges

### Requête (Frontend → n8n)
```json
{
  "message": "Je veux 2 Crispy",
  "sessionId": "uuid-session",
  "history": [
    { "role": "assistant", "content": "Bonjour ! ..." },
    { "role": "user", "content": "Bonjour" },
    { "role": "assistant", "content": "Comment puis-je..." }
  ]
}
```

### Réponse simple (n8n → Frontend)
```json
{
  "action": "reply",
  "message": "Super choix ! La Crispy c'est 15€..."
}
```

### Réponse avec commande créée (n8n → Frontend)
```json
{
  "action": "create_order",
  "message": "🎉 Votre commande a été envoyée...",
  "token": "abc-123-def",
  "orderId": "uuid-order",
  "success": true
}
```

## Flux de commande complet

1. Client discute avec CieloBot
2. CieloBot collecte : nom, téléphone, items, heure, type service
3. CieloBot récapitule et demande confirmation
4. Client confirme → OpenAI retourne un JSON `create_order`
5. n8n parse le JSON → POST `/api/orders` (MySQL)
6. Commande créée → token retourné au frontend
7. Frontend redirige vers `/order/{token}` (suivi)
8. Guylian valide sur l'iPad → lien Stripe → client paie

## Modèle OpenAI

- **Recommandé** : `gpt-4` (meilleure compréhension du menu, des quantités, du créole/français)
- **Budget limité** : `gpt-3.5-turbo` (fonctionne mais peut faire des erreurs de calcul)
- **Temperature** : 0.7 (bon équilibre entre créativité et précision)

## Sécurité

- Le webhook est public (pas d'auth) : le chatbot est destiné aux clients
- Le rate limiting est géré côté frontend (Chatbot.tsx : 5 msg/min, 20 msg/session)
- L'API `/api/orders` valide tous les champs (nom, téléphone, items, total)
- Le total est recalculé dans le node "Parse Response" pour éviter les totaux fantaisistes d'OpenAI
- Aucune donnée sensible (clé API, PIN admin) n'est exposée dans le webhook

## Personnalisation

### Changer de modèle
Dans le node "OpenAI Chat", changer `model` de `gpt-4` à `gpt-3.5-turbo`.

### Modifier le menu
Mettre à jour le system prompt dans le node "OpenAI Chat" (section MENU COMPLET).
Penser à synchroniser avec `src/data/menuData.ts`.

### Ajouter des fonctionnalités
- **Réservation** : Ajouter une action `create_reservation` dans le prompt et un second IF + HTTP Request vers `/api/admin/reservations`
- **Suivi commande** : Ajouter une action `track_order` qui appelle GET `/api/orders/{token}`
