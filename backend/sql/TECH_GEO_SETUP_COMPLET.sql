-- =====================================================================
-- TECH-GEO — Script SQL Complet & Idempotent v3
-- =====================================================================
-- Exécuter dans le SQL Editor de Supabase.
-- Les triggers tombent automatiquement avec CASCADE sur les tables.
-- =====================================================================

-- =====================================================================
-- 0. NETTOYAGE PROPRE (CASCADE supprime triggers + policies)
-- =====================================================================

DROP TABLE IF EXISTS analytics_events       CASCADE;
DROP TABLE IF EXISTS newsletter_subscribers  CASCADE;
DROP TABLE IF EXISTS coupons                CASCADE;
DROP TABLE IF EXISTS reviews                CASCADE;
DROP TABLE IF EXISTS wishlist               CASCADE;
DROP TABLE IF EXISTS orders                 CASCADE;
DROP TABLE IF EXISTS contact_messages       CASCADE;
DROP TABLE IF EXISTS media                  CASCADE;
DROP TABLE IF EXISTS tutorials              CASCADE;
DROP TABLE IF EXISTS products               CASCADE;
DROP TABLE IF EXISTS site_settings          CASCADE;
DROP TABLE IF EXISTS profiles               CASCADE;

DROP TYPE IF EXISTS user_role    CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS media_type   CASCADE;

-- =====================================================================
-- 1. TYPES ENUM
-- =====================================================================

CREATE TYPE user_role    AS ENUM ('admin', 'editor', 'client');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE media_type   AS ENUM ('image', 'video');

-- =====================================================================
-- 2. FONCTION UTILITAIRE : updated_at
-- =====================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =====================================================================
-- 3. TABLE : PROFILES
-- =====================================================================

CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL DEFAULT '',
  email      TEXT NOT NULL DEFAULT '',
  role       user_role NOT NULL DEFAULT 'client',
  avatar_url TEXT,
  phone      TEXT,
  address    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Profils utilisateurs. Seul 1 admin autorisé.';

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Création auto du profil à l'inscription — toujours 'client'
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.email, ''),
    'client'
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Helpers RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'));
$$;

CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM profiles WHERE id = user_uuid;
$$;

-- =====================================================================
-- 4. TABLE : PRODUCTS
-- =====================================================================

CREATE TABLE products (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  description    TEXT DEFAULT '',
  price          NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10,2) CHECK (original_price >= 0),
  category       TEXT NOT NULL DEFAULT 'general',
  image_url      TEXT DEFAULT '',
  images         TEXT[] DEFAULT '{}',
  specs          JSONB DEFAULT '{}',
  stock          INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  view_count     INTEGER NOT NULL DEFAULT 0,
  available      BOOLEAN NOT NULL DEFAULT true,
  featured       BOOLEAN NOT NULL DEFAULT false,
  rating         NUMERIC(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count   INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_products_category  ON products(category);
CREATE INDEX idx_products_available ON products(available);
CREATE INDEX idx_products_featured  ON products(featured);
CREATE INDEX idx_products_created   ON products(created_at DESC);

-- =====================================================================
-- 5. TABLE : TUTORIALS
-- =====================================================================

CREATE TABLE tutorials (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  description      TEXT DEFAULT '',
  content          TEXT DEFAULT '',
  category         TEXT NOT NULL DEFAULT 'general',
  thumbnail_url    TEXT DEFAULT '',
  video_url        TEXT,
  duration_minutes INTEGER,
  author_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name      TEXT DEFAULT '',
  tags             TEXT[] DEFAULT '{}',
  published        BOOLEAN NOT NULL DEFAULT false,
  featured         BOOLEAN NOT NULL DEFAULT false,
  view_count       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_tutorials_updated_at
  BEFORE UPDATE ON tutorials FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_tutorials_category  ON tutorials(category);
CREATE INDEX idx_tutorials_published ON tutorials(published);
CREATE INDEX idx_tutorials_slug      ON tutorials(slug);
CREATE INDEX idx_tutorials_created   ON tutorials(created_at DESC);

-- =====================================================================
-- 6. TABLE : MEDIA
-- =====================================================================

CREATE TABLE media (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL DEFAULT '',
  url        TEXT NOT NULL,
  type       media_type NOT NULL DEFAULT 'image',
  is_base64  BOOLEAN NOT NULL DEFAULT false,
  size_bytes BIGINT,
  mime_type  TEXT,
  width      INTEGER,
  height     INTEGER,
  alt_text   TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_type    ON media(type);
CREATE INDEX idx_media_created ON media(created_at DESC);

-- =====================================================================
-- 7. TABLE : CONTACT MESSAGES
-- =====================================================================

CREATE TABLE contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  phone      TEXT DEFAULT '',
  subject    TEXT DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'new',
  is_read    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_status  ON contact_messages(status);
CREATE INDEX idx_contact_read    ON contact_messages(is_read);
CREATE INDEX idx_contact_created ON contact_messages(created_at DESC);

-- =====================================================================
-- 8. TABLE : ORDERS
-- =====================================================================

CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer         JSONB NOT NULL DEFAULT '{}',
  items            JSONB NOT NULL DEFAULT '[]',
  total            NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  currency         TEXT NOT NULL DEFAULT 'FCFA',
  status           order_status NOT NULL DEFAULT 'pending',
  payment_method   TEXT DEFAULT '',
  payment_status   TEXT NOT NULL DEFAULT 'unpaid',
  shipping_address TEXT DEFAULT '',
  notes            TEXT DEFAULT '',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_orders_user    ON orders(user_id);
CREATE INDEX idx_orders_status  ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- =====================================================================
-- 9. TABLE : SITE SETTINGS
-- =====================================================================

CREATE TABLE site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_settings (key, value) VALUES
  ('site_title',        'Tech-geo'),
  ('site_description',  'Votre boutique tech et tutoriels électronique, Arduino, PCB et plus.'),
  ('hero_text',         'Explorez la technologie. Apprenez. Créez.'),
  ('currency',          'FCFA'),
  ('contact_email',     'contact@tech-geo.com'),
  ('contact_phone',     ''),
  ('map_iframe_url',    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31846!2d1.22!3d6.17'),
  ('hiveqash_link',     'https://www.hiveqash.com/'),
  ('api_pdf_guide',     '#'),
  ('opencode_pdf_guide','#'),
  ('groq_api_admin',    ''),
  ('groq_api_user',     ''),
  ('groq_model_admin',  'llama-3.3-70b-versatile'),
  ('groq_model_user',   'llama-3.3-70b-versatile'),
  ('soft_proteus',      '#'),
  ('soft_office',       '#'),
  ('soft_pmas',         '#'),
  ('maintenance_mode',  'false');

-- =====================================================================
-- 10. TABLE : WISHLIST
-- =====================================================================

CREATE TABLE wishlist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id    TEXT NOT NULL,
  item_type  TEXT NOT NULL DEFAULT 'product',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, item_id, item_type)
);

CREATE INDEX idx_wishlist_user ON wishlist(user_id);
CREATE INDEX idx_wishlist_item ON wishlist(item_id);

-- =====================================================================
-- 11. TABLE : REVIEWS
-- =====================================================================

CREATE TABLE reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating     INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment    TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user    ON reviews(user_id);

-- =====================================================================
-- 12. TABLE : COUPONS
-- =====================================================================

CREATE TABLE coupons (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         TEXT NOT NULL UNIQUE,
  type         TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value        NUMERIC(10,2) NOT NULL CHECK (value >= 0),
  description  TEXT DEFAULT '',
  max_uses     INTEGER,
  max_discount NUMERIC(10,2),
  min_total    NUMERIC(10,2),
  uses         INTEGER NOT NULL DEFAULT 0,
  active       BOOLEAN NOT NULL DEFAULT true,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupons_code   ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(active);

-- =====================================================================
-- 13. TABLE : NEWSLETTER
-- =====================================================================

CREATE TABLE newsletter_subscribers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT NOT NULL UNIQUE,
  name              TEXT DEFAULT '',
  active            BOOLEAN NOT NULL DEFAULT true,
  unsubscribe_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  subscribed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at   TIMESTAMPTZ
);

CREATE INDEX idx_newsletter_email  ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_active ON newsletter_subscribers(active);

-- =====================================================================
-- 14. TABLE : ANALYTICS
-- =====================================================================

CREATE TABLE analytics_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event      TEXT NOT NULL,
  page       TEXT DEFAULT '',
  product_id UUID,
  session_id TEXT NOT NULL,
  user_agent TEXT DEFAULT '',
  referrer   TEXT DEFAULT '',
  ip_hash    TEXT DEFAULT '',
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_event   ON analytics_events(event);
CREATE INDEX idx_analytics_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_product ON analytics_events(product_id);
CREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);

-- =====================================================================
-- 15. ACTIVATION RLS
-- =====================================================================

ALTER TABLE profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE products               ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorials              ENABLE ROW LEVEL SECURITY;
ALTER TABLE media                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist               ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews                ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons                ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events       ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 16-27. RLS POLICIES
-- =====================================================================

-- PROFILES
CREATE POLICY "profiles_select_own"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_select_admin" ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "profiles_update_own"   ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));
CREATE POLICY "profiles_update_admin" ON profiles FOR UPDATE USING (is_admin());

-- PRODUCTS
CREATE POLICY "products_select_public" ON products FOR SELECT USING (available = true);
CREATE POLICY "products_select_staff"  ON products FOR SELECT USING (is_staff());
CREATE POLICY "products_insert_staff"  ON products FOR INSERT WITH CHECK (is_staff());
CREATE POLICY "products_update_staff"  ON products FOR UPDATE USING (is_staff());
CREATE POLICY "products_delete_admin"  ON products FOR DELETE USING (is_admin());

-- TUTORIALS
CREATE POLICY "tutorials_select_public" ON tutorials FOR SELECT USING (published = true);
CREATE POLICY "tutorials_select_staff"  ON tutorials FOR SELECT USING (is_staff());
CREATE POLICY "tutorials_insert_staff"  ON tutorials FOR INSERT WITH CHECK (is_staff());
CREATE POLICY "tutorials_update_staff"  ON tutorials FOR UPDATE USING (is_staff());
CREATE POLICY "tutorials_delete_admin"  ON tutorials FOR DELETE USING (is_admin());

-- MEDIA
CREATE POLICY "media_select_public" ON media FOR SELECT USING (true);
CREATE POLICY "media_insert_staff"  ON media FOR INSERT WITH CHECK (is_staff());
CREATE POLICY "media_update_staff"  ON media FOR UPDATE USING (is_staff());
CREATE POLICY "media_delete_admin"  ON media FOR DELETE USING (is_admin());

-- CONTACT
CREATE POLICY "contact_insert_public" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_select_admin"  ON contact_messages FOR SELECT USING (is_admin());
CREATE POLICY "contact_update_admin"  ON contact_messages FOR UPDATE USING (is_admin());
CREATE POLICY "contact_delete_admin"  ON contact_messages FOR DELETE USING (is_admin());

-- ORDERS
CREATE POLICY "orders_select_own"    ON orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "orders_select_admin"  ON orders FOR SELECT USING (is_admin());
CREATE POLICY "orders_insert_public" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update_admin"  ON orders FOR UPDATE USING (is_admin());

-- SITE SETTINGS
CREATE POLICY "settings_select_public" ON site_settings FOR SELECT USING (true);
CREATE POLICY "settings_modify_admin"  ON site_settings FOR ALL   USING (is_admin());

-- WISHLIST
CREATE POLICY "wishlist_select_own" ON wishlist FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "wishlist_insert_own" ON wishlist FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "wishlist_delete_own" ON wishlist FOR DELETE USING (user_id = auth.uid());

-- REVIEWS
CREATE POLICY "reviews_select_public" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_auth"   ON reviews FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "reviews_update_own"    ON reviews FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "reviews_delete_own"    ON reviews FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "reviews_delete_admin"  ON reviews FOR DELETE USING (is_admin());

-- COUPONS
CREATE POLICY "coupons_select_public" ON coupons FOR SELECT USING (active = true);
CREATE POLICY "coupons_select_admin"  ON coupons FOR SELECT USING (is_admin());
CREATE POLICY "coupons_manage_admin"  ON coupons FOR ALL   USING (is_admin());

-- NEWSLETTER
CREATE POLICY "newsletter_insert_public" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "newsletter_update_public" ON newsletter_subscribers FOR UPDATE USING (true);
CREATE POLICY "newsletter_select_admin"  ON newsletter_subscribers FOR SELECT USING (is_admin());
CREATE POLICY "newsletter_delete_admin"  ON newsletter_subscribers FOR DELETE USING (is_admin());

-- ANALYTICS
CREATE POLICY "analytics_insert_public" ON analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "analytics_select_admin"  ON analytics_events FOR SELECT USING (is_admin());

-- =====================================================================
-- 28. TRIGGERS MÉTIER
-- =====================================================================

CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  UPDATE products SET
    rating       = COALESCE((SELECT ROUND(AVG(rating)::numeric,1) FROM reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)), 0),
    review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id))
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

CREATE OR REPLACE FUNCTION decrement_product_stock()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE item JSONB;
BEGIN
  IF NEW.status = 'processing' AND OLD.status = 'pending' THEN
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.items) LOOP
      UPDATE products SET stock = stock - (item->>'qty')::INTEGER
      WHERE id = (item->>'id')::UUID AND stock >= (item->>'qty')::INTEGER;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_status_change
  AFTER UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION decrement_product_stock();

CREATE OR REPLACE FUNCTION increment_product_views(product_id UUID)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE products SET view_count = COALESCE(view_count, 0) + 1 WHERE id = product_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_coupon_use(coupon_id UUID)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE coupons SET uses = uses + 1 WHERE id = coupon_id;
END;
$$;

-- =====================================================================
-- 29. STORAGE — Bucket media
-- =====================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media', 'media', true, 52428800,
  ARRAY['image/jpeg','image/png','image/gif','image/webp','image/svg+xml',
        'video/mp4','video/webm','video/quicktime','application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- RLS sur storage.objects est déjà activé par Supabase — pas besoin de ALTER TABLE

DROP POLICY IF EXISTS "storage_select_public" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert_staff"  ON storage.objects;
DROP POLICY IF EXISTS "storage_update_staff"  ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_admin"  ON storage.objects;

CREATE POLICY "storage_select_public"
  ON storage.objects FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "storage_insert_staff"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media' AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')
  ));

CREATE POLICY "storage_update_staff"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'media' AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')
  ));

CREATE POLICY "storage_delete_admin"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'media' AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- =====================================================================
-- 30. REALTIME
-- =====================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE contact_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- =====================================================================
-- 31. DONNÉES D'EXEMPLE
-- =====================================================================

INSERT INTO products (name, description, price, original_price, category, image_url, stock, available, featured, rating, review_count) VALUES
  ('Arduino Uno R3',       'Microcontrôleur idéal pour débuter en électronique.',      15000, 18000, 'microcontroleurs', 'https://picsum.photos/seed/arduino/400/400',     50, true, true,  4.5, 12),
  ('Raspberry Pi 4 Kit',   'Kit complet boîtier, alimentation, microSD 32Go.',         65000, 75000, 'single-board',     'https://picsum.photos/seed/rpi/400/400',         30, true, true,  4.8, 24),
  ('Capteur DHT22',        'Capteur température/humidité haute précision (±0.5°C).',    3500,  NULL, 'capteurs',         'https://picsum.photos/seed/dht22/400/400',      200, true, false, 4.2,  8),
  ('Module Relais 4ch',    'Module 4 canaux 5V pour appareils haute puissance.',        4500,  5500, 'modules',          'https://picsum.photos/seed/relais/400/400',     150, true, false, 4.0,  5),
  ('Écran OLED 0.96"',     'Écran I2C 128x64 pixels pour projets embarqués.',          7500,  NULL, 'ecrans',           'https://picsum.photos/seed/oled/400/400',        80, true, true,  4.6, 15),
  ('Kit Résistances 500p', 'Assortiment 500 résistances (22 valeurs) avec boîtier.',   5000,  NULL, 'composants',       'https://picsum.photos/seed/resistors/400/400',  300, true, false, 4.3,  6);

INSERT INTO tutorials (title, slug, description, content, category, thumbnail_url, duration_minutes, published, featured, view_count) VALUES
  ('Introduction à l''électronique', 'introduction-electronique',
   'Les bases : tension, courant, résistance.', 'Contenu tutoriel électronique...',
   'electronique', 'https://picsum.photos/seed/electro-tuto/800/400', 15, true, true, 342),
  ('Bien coder avec Arduino', 'bien-coder-arduino',
   'Meilleures pratiques de programmation Arduino.', 'Contenu Arduino...',
   'arduino', 'https://picsum.photos/seed/arduino-tuto/800/400', 20, true, true, 521),
  ('Créer un PCB avec KiCad', 'kicad-pcb',
   'Concevoir et fabriquer vos propres circuits imprimés.', 'Tutoriel KiCad...',
   'pcb', 'https://picsum.photos/seed/kicad/800/400', 30, true, true, 189);

INSERT INTO coupons (code, type, value, description, max_uses, min_total, expires_at) VALUES
  ('BIENVENUE10', 'percentage', 10,   '10% pour les nouveaux clients', 100, 10000, NOW() + INTERVAL '90 days'),
  ('TECHGEO5000', 'fixed',      5000, '5000 FCFA de réduction',         50, 25000, NOW() + INTERVAL '60 days'),
  ('PROMO20',     'percentage', 20,   '20% sur les capteurs',          NULL,  5000, NOW() + INTERVAL '30 days');

-- =====================================================================
-- ⚠️  DERNIÈRE ÉTAPE — PROMOUVOIR VOTRE COMPTE EN ADMIN
-- =====================================================================
-- Après avoir créé votre compte sur le site, exécutez UNIQUEMENT ceci
-- (remplace ton@email.com par ton vrai email) :
--
--   UPDATE profiles SET role = 'admin' WHERE email = 'ton@email.com';
--
-- Un seul compte admin. Tous les autres restent 'client'.
-- =====================================================================
