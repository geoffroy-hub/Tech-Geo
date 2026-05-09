-- ===================================================
-- Tech-geo — Safe Schema (handles existing objects)
-- ===================================================

-- Safe enum creation
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'editor', 'client');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE media_type AS ENUM ('image', 'video');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Drop trigger functions first to avoid conflicts
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS decrement_product_stock() CASCADE;
DROP FUNCTION IF EXISTS update_product_rating() CASCADE;

-- Profiles table
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

-- Products table
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

-- Tutorials table
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

-- Media table
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

-- Contact messages table
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

-- Orders table
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

-- Site settings table
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

-- Insert default settings
INSERT INTO site_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'product',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, item_id, item_type)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- Triggers
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, ''),
    (COALESCE(NEW.raw_user_meta_data->>'role', 'client'))::user_role
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS set_products_updated_at ON products;
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_tutorials_updated_at ON tutorials;
CREATE TRIGGER set_tutorials_updated_at BEFORE UPDATE ON tutorials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_orders_updated_at ON orders;
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_site_settings_updated_at ON site_settings;
CREATE TRIGGER set_site_settings_updated_at BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Stock decrement trigger
CREATE OR REPLACE FUNCTION decrement_product_stock()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$
DECLARE item JSONB;
BEGIN
  IF NEW.status = 'processing' AND OLD.status = 'pending' THEN
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.items) LOOP
      UPDATE products
      SET stock = stock - (item->>'qty')::INTEGER
      WHERE id = (item->>'id')::UUID AND stock >= (item->>'qty')::INTEGER;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_order_status_change ON orders;
CREATE TRIGGER on_order_status_change
  AFTER UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION decrement_product_stock();

-- Product rating trigger
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN
  UPDATE products
  SET
    rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)), 0),
    review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id))
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_review_change ON reviews;
CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(available);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tutorials_category ON tutorials(category);
CREATE INDEX IF NOT EXISTS idx_tutorials_published ON tutorials(published);
CREATE INDEX IF NOT EXISTS idx_tutorials_slug ON tutorials(slug);
CREATE INDEX IF NOT EXISTS idx_tutorials_created ON tutorials(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
CREATE INDEX IF NOT EXISTS idx_media_created ON media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_read ON contact_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_item ON wishlist(item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Product policies
DROP POLICY IF EXISTS "Public can view available products" ON products;
DROP POLICY IF EXISTS "Staff can view all products" ON products;
DROP POLICY IF EXISTS "Staff can insert products" ON products;
DROP POLICY IF EXISTS "Staff can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

CREATE POLICY "Public can view available products" ON products
  FOR SELECT USING (available = true);
CREATE POLICY "Staff can view all products" ON products
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')));
CREATE POLICY "Staff can insert products" ON products
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')));
CREATE POLICY "Staff can update products" ON products
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')));
CREATE POLICY "Admins can delete products" ON products
  FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Tutorial policies
DROP POLICY IF EXISTS "Public can view published tutorials" ON tutorials;
DROP POLICY IF EXISTS "Staff can view all tutorials" ON tutorials;
DROP POLICY IF EXISTS "Staff can insert tutorials" ON tutorials;
DROP POLICY IF EXISTS "Staff can update tutorials" ON tutorials;
DROP POLICY IF EXISTS "Admins can delete tutorials" ON tutorials;

CREATE POLICY "Public can view published tutorials" ON tutorials
  FOR SELECT USING (published = true);
CREATE POLICY "Staff can view all tutorials" ON tutorials
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')));
CREATE POLICY "Staff can insert tutorials" ON tutorials
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')));
CREATE POLICY "Staff can update tutorials" ON tutorials
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')));
CREATE POLICY "Admins can delete tutorials" ON tutorials
  FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Media policies
DROP POLICY IF EXISTS "Public can view media" ON media;
DROP POLICY IF EXISTS "Staff can insert media" ON media;
DROP POLICY IF EXISTS "Admins can delete media" ON media;

CREATE POLICY "Public can view media" ON media FOR SELECT USING (true);
CREATE POLICY "Staff can insert media" ON media
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor')));
CREATE POLICY "Admins can delete media" ON media
  FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Contact messages policies
DROP POLICY IF EXISTS "Anyone can send contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can view contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can update contact messages" ON contact_messages;

CREATE POLICY "Anyone can send contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view contact messages" ON contact_messages
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update contact messages" ON contact_messages
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Orders policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Site settings policies
DROP POLICY IF EXISTS "Public can view site settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can update site settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can insert site settings" ON site_settings;

CREATE POLICY "Public can view site settings" ON site_settings
  FOR SELECT USING (true);
CREATE POLICY "Admins can update site settings" ON site_settings
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can insert site settings" ON site_settings
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Wishlist policies
DROP POLICY IF EXISTS "Users can view own wishlist" ON wishlist;
DROP POLICY IF EXISTS "Users can insert wishlist items" ON wishlist;
DROP POLICY IF EXISTS "Users can delete wishlist items" ON wishlist;

CREATE POLICY "Users can view own wishlist" ON wishlist
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert wishlist items" ON wishlist
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete wishlist items" ON wishlist
  FOR DELETE USING (user_id = auth.uid());

-- Reviews policies
DROP POLICY IF EXISTS "Public can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can delete any review" ON reviews;

CREATE POLICY "Public can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "Admins can delete any review" ON reviews
  FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Realtime
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE products;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE contact_messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE orders;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
-- ===================================================
-- Help & Maintenance
-- ===================================================

-- To promote a user to admin, run this in the Supabase SQL Editor:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL@GMAIL.COM';

-- To see all users and their roles:
-- SELECT email, role FROM public.profiles;
