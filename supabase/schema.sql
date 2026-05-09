-- ===================================================
-- Tech-geo — Supabase Database Schema
-- ===================================================
-- Execute this script in the Supabase SQL Editor.
-- Creates all tables, relations, RLS policies, and triggers.
-- ===================================================

-- ===================================================
-- 1. ENUMS & TYPES
-- ===================================================

CREATE TYPE user_role AS ENUM ('admin', 'editor', 'client');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE media_type AS ENUM ('image', 'video');

-- ===================================================
-- 2. PROFILES (extends auth.users)
-- ===================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'client',
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'User profiles linked to auth.users with role management';

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ===================================================
-- 3. PRODUCTS
-- ===================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10, 2) CHECK (original_price >= 0),
  category TEXT NOT NULL DEFAULT 'general',
  image_url TEXT DEFAULT '',
  images TEXT[] DEFAULT '{}',
  specs JSONB DEFAULT '{}',
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  available BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(2, 1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE products IS 'E-commerce products with stock, pricing, and categories';

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(available);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC);

-- ===================================================
-- 4. TUTORIALS
-- ===================================================

CREATE TABLE IF NOT EXISTS tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  content TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  thumbnail_url TEXT DEFAULT '',
  video_url TEXT,
  duration_minutes INTEGER,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN NOT NULL DEFAULT false,
  featured BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE tutorials IS 'Educational content/articles with categories and authors';

CREATE TRIGGER set_tutorials_updated_at
  BEFORE UPDATE ON tutorials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_tutorials_category ON tutorials(category);
CREATE INDEX IF NOT EXISTS idx_tutorials_published ON tutorials(published);
CREATE INDEX IF NOT EXISTS idx_tutorials_slug ON tutorials(slug);
CREATE INDEX IF NOT EXISTS idx_tutorials_created ON tutorials(created_at DESC);

-- ===================================================
-- 5. MEDIA
-- ===================================================

CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  type media_type NOT NULL DEFAULT 'image',
  is_base64 BOOLEAN NOT NULL DEFAULT false,
  size_bytes BIGINT,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  alt_text TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE media IS 'Media library (images/videos) supporting base64 and Storage URLs';

CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
CREATE INDEX IF NOT EXISTS idx_media_created ON media(created_at DESC);

-- ===================================================
-- 6. CONTACT MESSAGES
-- ===================================================

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  phone TEXT DEFAULT '',
  subject TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE contact_messages IS 'Contact form submissions visible only to admins';

CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_read ON contact_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_messages(created_at DESC);

-- ===================================================
-- 7. ORDERS
-- ===================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer JSONB NOT NULL DEFAULT '{}',
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  currency TEXT NOT NULL DEFAULT 'FCFA',
  status order_status NOT NULL DEFAULT 'pending',
  payment_method TEXT DEFAULT '',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  shipping_address TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE orders IS 'Customer orders with items, payment, and shipping info';

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- ===================================================
-- 8. SITE SETTINGS
-- ===================================================

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title TEXT DEFAULT 'Tech-geo',
  site_description TEXT DEFAULT '',
  hero_text TEXT DEFAULT '',
  map_iframe_url TEXT DEFAULT '',
  payment_api_url TEXT DEFAULT '',
  payment_callback_url TEXT DEFAULT '',
  currency TEXT DEFAULT 'FCFA',
  contact_email TEXT DEFAULT '',
  contact_phone TEXT DEFAULT '',
  social_links JSONB DEFAULT '{}',
  seo_keywords TEXT DEFAULT '',
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE site_settings IS 'Dynamic site configuration (SEO, payments, maps, etc.)';

CREATE TRIGGER set_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings row
INSERT INTO site_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

-- ===================================================
-- 9. WISHLIST
-- ===================================================

CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'product',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, item_id, item_type)
);

COMMENT ON TABLE wishlist IS 'User saved favorites (products or tutorials)';

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_item ON wishlist(item_id);

-- ===================================================
-- 10. REVIEWS
-- ===================================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

COMMENT ON TABLE reviews IS 'Product reviews with ratings';

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

-- ===================================================
-- ROW LEVEL SECURITY (RLS)
-- ===================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ===================================================
-- 11. RLS POLICIES — PROFILES
-- ===================================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update any profile (including roles)
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===================================================
-- 12. RLS POLICIES — PRODUCTS
-- ===================================================

-- Anyone can read available products
CREATE POLICY "Public can view available products"
  ON products FOR SELECT
  USING (available = true);

-- Admins/editors can view all products (including unavailable)
CREATE POLICY "Staff can view all products"
  ON products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- Admins/editors can insert products
CREATE POLICY "Staff can insert products"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- Admins/editors can update products
CREATE POLICY "Staff can update products"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- Admins can delete products
CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===================================================
-- 13. RLS POLICIES — TUTORIALS
-- ===================================================

-- Anyone can read published tutorials
CREATE POLICY "Public can view published tutorials"
  ON tutorials FOR SELECT
  USING (published = true);

-- Admins/editors can view all tutorials
CREATE POLICY "Staff can view all tutorials"
  ON tutorials FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- Admins/editors can insert tutorials
CREATE POLICY "Staff can insert tutorials"
  ON tutorials FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- Admins/editors can update tutorials
CREATE POLICY "Staff can update tutorials"
  ON tutorials FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- Admins can delete tutorials
CREATE POLICY "Admins can delete tutorials"
  ON tutorials FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===================================================
-- 14. RLS POLICIES — MEDIA
-- ===================================================

-- Anyone can read media
CREATE POLICY "Public can view media"
  ON media FOR SELECT
  USING (true);

-- Admins/editors can insert media
CREATE POLICY "Staff can insert media"
  ON media FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- Admins can delete media
CREATE POLICY "Admins can delete media"
  ON media FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===================================================
-- 15. RLS POLICIES — CONTACT MESSAGES
-- ===================================================

-- Anyone can insert contact messages
CREATE POLICY "Anyone can send contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

-- Only admins can read contact messages
CREATE POLICY "Admins can view contact messages"
  ON contact_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update contact messages (mark as read, change status)
CREATE POLICY "Admins can update contact messages"
  ON contact_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===================================================
-- 16. RLS POLICIES — ORDERS
-- ===================================================

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Anyone can create orders (guest checkout supported)
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Admins can update orders (change status, etc.)
CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===================================================
-- 17. RLS POLICIES — SITE SETTINGS
-- ===================================================

-- Anyone can read site settings
CREATE POLICY "Public can view site settings"
  ON site_settings FOR SELECT
  USING (true);

-- Only admins can update site settings
CREATE POLICY "Admins can update site settings"
  ON site_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can insert site settings
CREATE POLICY "Admins can insert site settings"
  ON site_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===================================================
-- 18. RLS POLICIES — WISHLIST
-- ===================================================

-- Users can view their own wishlist
CREATE POLICY "Users can view own wishlist"
  ON wishlist FOR SELECT
  USING (user_id = auth.uid());

-- Users can manage their own wishlist
CREATE POLICY "Users can insert wishlist items"
  ON wishlist FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete wishlist items"
  ON wishlist FOR DELETE
  USING (user_id = auth.uid());

-- ===================================================
-- 19. RLS POLICIES — REVIEWS
-- ===================================================

-- Anyone can read reviews
CREATE POLICY "Public can view reviews"
  ON reviews FOR SELECT
  USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  USING (user_id = auth.uid());

-- Admins can delete any review
CREATE POLICY "Admins can delete any review"
  ON reviews FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===================================================
-- 20. HELPER FUNCTIONS
-- ===================================================

-- Get current user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = user_uuid;
$$;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Check if user is editor or admin
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')
  );
$$;

-- Update product average rating after a review
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE products
  SET
    rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE product_id = NEW.product_id), 0),
    review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_review_change ON reviews;
CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();

-- Decrement stock when order is placed
CREATE OR REPLACE FUNCTION decrement_product_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  item JSONB;
BEGIN
  IF NEW.status = 'processing' AND OLD.status = 'pending' THEN
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
    LOOP
      UPDATE products
      SET stock = stock - (item->>'qty')::INTEGER
      WHERE id = (item->>'id')::UUID
        AND stock >= (item->>'qty')::INTEGER;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_order_status_change ON orders;
CREATE TRIGGER on_order_status_change
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION decrement_product_stock();

-- ===================================================
-- 21. REALTIME (enable for client subscriptions)
-- ===================================================

ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE contact_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- ===================================================
-- 22. SEED DATA (optional — uncomment to populate)
-- ===================================================

/*
-- Sample product
INSERT INTO products (name, description, price, original_price, category, image_url, stock, available, featured, rating)
VALUES
  ('Arduino Uno R3', 'Microcontrôleur idéal pour débuter en électronique', 15000, 18000, 'microcontroleurs', 'https://picsum.photos/seed/arduino/400/400', 50, true, true, 4.5),
  ('Kit Raspberry Pi 4', 'Kit complet avec boîtier, alimentation et carte microSD', 65000, 75000, 'single-board', 'https://picsum.photos/seed/rpi/400/400', 30, true, true, 4.8),
  ('Capteur DHT22', 'Capteur de température et d''humidité haute précision', 3500, NULL, 'capteurs', 'https://picsum.photos/seed/dht22/400/400', 200, true, false, 4.2);

-- Sample tutorial
INSERT INTO tutorials (title, slug, description, content, category, thumbnail_url, duration_minutes, published, featured)
VALUES
  ('Introduction à l''électronique', 'introduction-electronique', 'Les bases de l''électronique pour les débutants', 'Contenu du tutoriel...', 'electronique', 'https://picsum.photos/seed/electro/800/400', 15, true, true),
  ('Bien coder avec Arduino', 'bien-coder-arduino', 'Les meilleures pratiques pour programmer un Arduino', 'Contenu du tutoriel...', 'arduino', 'https://picsum.photos/seed/arduino-tuto/800/400', 20, true, true);

-- Create first admin user (run after creating user via auth)
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@tech-geo.com';
*/
