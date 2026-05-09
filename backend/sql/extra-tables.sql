-- ===================================================
-- Tech-geo — Additional Tables (coupons, newsletter, analytics)
-- ===================================================
-- Run after schema.sql to add extra functionality.
-- ===================================================

-- ===================================================
-- 1. COUPONS
-- ===================================================

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC(10, 2) NOT NULL CHECK (value >= 0),
  description TEXT DEFAULT '',
  max_uses INTEGER,
  max_discount NUMERIC(10, 2),
  min_total NUMERIC(10, 2),
  uses INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE coupons IS 'Promo codes and discount coupons';

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(active);

-- RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active coupons"
  ON coupons FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage coupons"
  ON coupons FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ===================================================
-- 2. NEWSLETTER SUBSCRIBERS
-- ===================================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  unsubscribe_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

COMMENT ON TABLE newsletter_subscribers IS 'Newsletter subscription list';

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(active);

-- RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe"
  ON newsletter_subscribers FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can unsubscribe themselves"
  ON newsletter_subscribers FOR UPDATE
  USING (true);

CREATE POLICY "Admins can view subscribers"
  ON newsletter_subscribers FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ===================================================
-- 3. ANALYTICS EVENTS
-- ===================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  page TEXT DEFAULT '',
  product_id UUID,
  session_id TEXT NOT NULL,
  user_agent TEXT DEFAULT '',
  referrer TEXT DEFAULT '',
  ip_hash TEXT DEFAULT '',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE analytics_events IS 'Page views, product views, conversions tracking';

CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics_events(event);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_product ON analytics_events(product_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at DESC);

-- RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can track events"
  ON analytics_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view analytics"
  ON analytics_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ===================================================
-- 4. HELPER FUNCTIONS
-- ===================================================

-- Increment product view count
CREATE OR REPLACE FUNCTION increment_product_views(product_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = product_id;
END;
$$;

-- Increment coupon uses
CREATE OR REPLACE FUNCTION increment_coupon_use(coupon_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE coupons SET uses = uses + 1 WHERE id = coupon_id;
END;
$$;

-- ===================================================
-- 5. SEED DATA
-- ===================================================

-- Sample coupons
INSERT INTO coupons (code, type, value, description, max_uses, min_total, expires_at) VALUES
  ('BIENVENUE10', 'percentage', 10, '10% de réduction pour les nouveaux clients', 100, 10000, NOW() + INTERVAL '90 days'),
  ('TECHGEO5000', 'fixed', 5000, '5000 FCFA de réduction', 50, 25000, NOW() + INTERVAL '60 days'),
  ('PROMO20', 'percentage', 20, '20% sur les capteurs', NULL, 5000, NOW() + INTERVAL '30 days');
