# Tech-geo — Backend

Backend Supabase pour le projet Tech-geo : base de données, Edge Functions, webhooks.

## Structure

```
backend/
├── sql/
│   ├── schema.sql           # Tables principales, RLS, triggers (9 tables)
│   ├── storage.sql          # Bucket media + RLS policies
│   ├── webhooks.sql         # Webhooks DB (orders, contacts)
│   ├── extra-tables.sql     # Coupons, newsletter, analytics (3 tables)
│   └── seed.sql             # Données initiales
├── functions/               # 13 Edge Functions (Deno)
│   ├── process-payment/     # Initier paiement (6 méthodes)
│   ├── payment-callback/    # Webhook confirmation paiement
│   ├── notify-order/        # Emails confirmation/statut commande
│   ├── notify-contact/      # Notification admin messages contact
│   ├── manage-order/        # Admin: update status, cancel, refund
│   ├── manage-product/      # Admin: CRUD produits + bulk import
│   ├── admin-stats/         # Dashboard: ventes, revenus, stats
│   ├── search/              # Recherche full-text produits + tutos
│   ├── newsletter/          # Abonnés + envoi newsletter
│   ├── generate-receipt/    # Facture PDF
│   ├── coupons/             # Codes promo (créer, valider, gérer)
│   ├── analytics/           # Tracking page views, conversions
│   ├── check-stock/         # Vérification stock temps réel
│   ├── resize-image/        # Redimensionnement images
│   └── .env.example         # Variables d'environnement
├── scripts/
├── deploy.ps1               # Script déploiement PowerShell (13 fonctions)
├── deploy.bat               # Script déploiement Batch
└── README.md
```

## Setup

### 1. Projet Supabase

https://supabase.com → New Project

### 2. Scripts SQL (dans l'ordre)

Dashboard → SQL Editor :

1. `sql/schema.sql` → Run
2. `sql/storage.sql` → Run
3. `sql/extra-tables.sql` → Run
4. `sql/webhooks.sql` → Run
5. `sql/seed.sql` → Run (optionnel)

### 3. Frontend config

Mettre à jour `js/gol.js` :

```javascript
const SUPABASE_CONFIG = {
  url: 'https://<project-id>.supabase.co',
  anonKey: '<anon-public-key>',
};
```

### 4. Premier admin

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'ton-email@exemple.com';
```

### 5. Déployer les functions

```powershell
cd backend
.\deploy.ps1
```

## Paiements (Togo)

| Méthode | Type | T-Money | Moov | Cartes | Wave |
|---|---|---|---|---|---|
| **KKiaPay** | Agrégateur | Oui | Oui | Oui | Oui |
| **PayGate Global** | Agrégateur | Oui | Oui | Oui | Non |
| **FedaPay** | Agrégateur | Oui | Oui | Non | Oui |
| **T-Money** | Direct | Oui | Non | Non | Non |
| **Moov Money** | Direct | Non | Oui | Non | Non |
| **Cash** | — | — | — | — | — |

## Edge Functions — Référence

### 1. process-payment (POST)
Initier un paiement.

```bash
curl -X POST https://<project>.functions.supabase.co/process-payment \
  -H "Authorization: Bearer <key>" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"uuid","method":"kkiapay","phone":"+22890123456"}'
```

Réponse : `{ success, transactionId, authorizeUrl, promptSent, immediate }`

### 2. payment-callback (POST)
Recevoir les webhooks de paiement. URL à configurer chez KKiaPay/PayGate/FedaPay.

```
https://<project>.functions.supabase.co/payment-callback
```

### 3. notify-order (POST)
Envoyer emails de confirmation/statut.

```bash
curl -X POST https://<project>.functions.supabase.co/notify-order \
  -H "Content-Type: application/json" \
  -d '{"orderId":"uuid","type":"confirmation"}'
```

Types : `confirmation`, `status_update`, `admin_notification`

### 4. notify-contact (POST)
Notifier admin d'un nouveau message contact.

```bash
curl -X POST https://<project>.functions.supabase.co/notify-contact \
  -H "Content-Type: application/json" \
  -d '{"messageId":"uuid"}'
```

### 5. manage-order (POST)
Admin: gérer les commandes.

```bash
curl -X POST https://<project>.functions.supabase.co/manage-order \
  -H "Authorization: Bearer <key>" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"uuid","action":"update_status","status":"shipped"}'
```

Actions : `update_status`, `cancel`, `refund`, `add_notes`, `mark_shipped`, `mark_delivered`

### 6. manage-product (POST/PUT/DELETE)
Admin: CRUD produits.

```bash
# Créer
curl -X POST https://<project>.functions.supabase.co/manage-product \
  -H "Authorization: Bearer <key>" \
  -d '{"name":"Arduino","price":15000,"stock":50,"category":"microcontroleurs"}'

# Mettre à jour
curl -X PUT https://<project>.functions.supabase.co/manage-product \
  -H "Authorization: Bearer <key>" \
  -d '{"id":"uuid","price":12000,"stock":45}'

# Supprimer
curl -X DELETE https://<project>.functions.supabase.co/manage-product \
  -H "Authorization: Bearer <key>" \
  -d '{"id":"uuid"}'

# Import bulk
curl -X POST https://<project>.functions.supabase.co/manage-product \
  -H "Authorization: Bearer <key>" \
  -d '{"action":"bulk","products":[{...},{...}]}'
```

### 7. admin-stats (GET)
Statistiques dashboard.

```bash
curl -H "Authorization: Bearer <key>" \
  "https://<project>.functions.supabase.co/admin-stats?period=30d"
```

Retourne : revenus, commandes par statut, top produits, stock faible, clients, messages.

### 8. search (GET)
Recherche produits + tutoriels.

```bash
curl "https://<project>.functions.supabase.co/search?q=arduino&category=capteurs&type=product&limit=20"
```

### 9. newsletter (POST)
Gérer les abonnements et envoyer des newsletters.

```bash
# S'abonner
curl -X POST https://<project>.functions.supabase.co/newsletter \
  -d '{"action":"subscribe","email":"client@email.com","name":"Jean"}'

# Se désabonner
curl -X POST https://<project>.functions.supabase.co/newsletter \
  -d '{"action":"unsubscribe","email":"client@email.com"}'

# Envoyer (admin)
curl -X POST https://<project>.functions.supabase.co/newsletter \
  -H "Authorization: Bearer <key>" \
  -d '{"action":"send","subject":"Promo !","html":"<h1>Soldes</h1>..."}'
```

### 10. generate-receipt (GET/POST)
Générer une facture PDF.

```bash
curl "https://<project>.functions.supabase.co/generate-receipt?orderId=uuid"
# Retourne un PDF ou HTML
```

### 11. coupons (POST)
Créer, valider, gérer les codes promo.

```bash
# Valider (public)
curl -X POST https://<project>.functions.supabase.co/coupons \
  -d '{"action":"validate","code":"BIENVENUE10","cartTotal":30000}'

# Créer (admin)
curl -X POST https://<project>.functions.supabase.co/coupons \
  -H "Authorization: Bearer <key>" \
  -d '{"action":"create","code":"PROMO20","type":"percentage","value":20,"max_uses":100}'

# Lister (admin)
curl -X POST https://<project>.functions.supabase.co/coupons \
  -H "Authorization: Bearer <key>" \
  -d '{"action":"list"}'
```

### 12. analytics (POST/GET)
Tracker les événements et voir les stats.

```bash
# Tracker (public)
curl -X POST https://<project>.functions.supabase.co/analytics/track \
  -d '{"event":"page_view","page":"/boutique.html","sessionId":"xxx"}'

# Stats (admin)
curl -H "Authorization: Bearer <key>" \
  "https://<project>.functions.supabase.co/analytics?period=30d"
```

### 13. check-stock (GET/POST)
Vérifier le stock en temps réel.

```bash
# Produit unique
curl "https://<project>.functions.supabase.co/check-stock?productId=uuid"

# Bulk (POST)
curl -X POST https://<project>.functions.supabase.co/check-stock \
  -d '{"items":[{"id":"uuid","qty":2},{"id":"uuid2","qty":1}]}'
```

### 14. resize-image (POST)
Redimensionner des images.

```bash
curl -X POST https://<project>.functions.supabase.co/resize-image \
  -H "Authorization: Bearer <key>" \
  -d '{"imageUrl":"https://...","size":"medium"}'
```

Tailles : `thumb` (150px), `small` (400px), `medium` (800px), `large` (1200px)

## Tables

| Table | Lecture | Écriture |
|---|---|---|
| `profiles` | Propre profil | Admin/Editor |
| `products` | Produits dispo | Admin/Editor |
| `tutorials` | Published | Admin/Editor |
| `media` | Public | Admin/Editor |
| `contact_messages` | Admin seul | Tout le monde |
| `orders` | Propres commandes | Tous (create), Admin (update) |
| `site_settings` | Public | Admin seul |
| `wishlist` | Propre wishlist | Propre |
| `reviews` | Public | Auth users |
| `coupons` | Actifs (public) | Admin seul |
| `newsletter_subscribers` | Admin seul | Tout le monde (subscribe) |
| `analytics_events` | Admin seul | Tout le monde (track) |

## Variables d'environnement

| Variable | Description |
|---|---|
| `SUPABASE_URL` | URL du projet |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role |
| `KKIAPAY_PUBLIC_KEY` | Clé publique KKiaPay |
| `KKIAPAY_SECRET_KEY` | Clé secrète KKiaPay |
| `KKIAPAY_API_ID` | ID API KKiaPay |
| `KKIAPAY_SANDBOX` | true/false |
| `PAYGATE_API_URL` | URL API PayGate |
| `PAYGATE_API_KEY` | Clé API PayGate |
| `PAYGATE_API_SECRET` | Secret API PayGate |
| `PAYGATE_MERCHANT_ID` | ID marchand PayGate |
| `FEDAPAY_SECRET_KEY` | Clé secrète FedaPay |
| `TMONEY_API_KEY` | Clé API T-Money |
| `MOOV_API_KEY` | Clé API Moov Money |
| `PAYMENT_CALLBACK_URL` | URL callback paiement |
| `PAYMENT_WEBHOOK_SECRET` | Secret webhook |
| `RESEND_API_KEY` | Clé API Resend (emails) |
| `PDF_API_KEY` | Clé API HTML-to-PDF (optionnel) |
| `ADMIN_EMAIL` | Email admin notifications |
| `SITE_URL` | URL du site |
| `STORAGE_BUCKET` | Nom du bucket (media) |
