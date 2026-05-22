# Supabase Configuration for Tech-geo

## Setup

### 1. Create a Supabase Project

1. Go to https://supabase.com and create a new project
2. Wait for the database to be provisioned

### 2. Run the SQL Schema

1. Open your project dashboard
2. Go to **SQL Editor**
3. Copy the entire contents of `schema.sql`
4. Paste and click **Run**

This creates:
- All tables (profiles, products, tutorials, media, contact_messages, orders, site_settings, wishlist, reviews)
- Row Level Security (RLS) policies
- Triggers (auto-profile creation, updated_at, rating updates, stock decrement)
- Helper functions (get_user_role, is_admin, is_staff)
- Realtime subscriptions on products, contact_messages, and orders

### 3. Configure Credentials

1. Go to **Project Settings → API**
2. Copy your **Project URL** and **anon/public key**
3. Update these in `js/gol.js`:

```javascript
const SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT_ID.supabase.co',
  anonKey: 'YOUR_SUPABASE_ANON_KEY',
};
```

### 4. Create Storage Bucket (optional)

If you want to use Supabase Storage instead of base64 for images:

1. Go to **Storage** in your dashboard
2. Create a bucket named `media`
3. Set it to **public**
4. Add RLS policy:

```sql
CREATE POLICY "Public can view media bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

CREATE POLICY "Staff can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );
```

### 5. Create First Admin

1. Go to **Authentication → Users**
2. Add a user manually or register via the site
3. Run this in the SQL Editor:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
```

### 6. Enable Email Auth (optional)

1. Go to **Authentication → Providers**
2. Enable **Email** provider
3. Configure email templates under **Authentication → Email Templates**
4. Set your site URL for redirect confirmations

## Tables Overview

| Table | Purpose | Public Read | Write Access |
|---|---|---|---|
| `profiles` | User roles & info | Own only | Own update, admin full |
| `products` | Store products | Available only | Admin/editor |
| `tutorials` | Educational content | Published only | Admin/editor |
| `media` | Image/video library | Yes | Admin/editor |
| `contact_messages` | Contact form | No (admin only) | Anyone |
| `orders` | Customer orders | Own only | Anyone (create), admin (update) |
| `site_settings` | Site config | Yes | Admin only |
| `wishlist` | User favorites | Own only | Own |
| `reviews` | Product reviews | Yes | Auth users |

## Edge Functions

See `supabase/functions/` for Edge Functions (payment processing, email notifications, image resizing).

## Webhooks

Webhooks can be configured in Supabase Dashboard → Database → Webhooks to trigger external services on database events (new orders, contact messages, etc.).
