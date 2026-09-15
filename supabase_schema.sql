-- ====================================================================
-- Petalorah Complete Supabase Cloud Database Schema
-- Run this in your Supabase Dashboard -> SQL Editor
-- (https://supabase.com/dashboard/project/_/sql)
-- ====================================================================

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  numeric_price NUMERIC DEFAULT 50,
  original_price TEXT,
  category TEXT DEFAULT 'keychain',
  description TEXT,
  img TEXT,
  badge TEXT,
  is_best_seller BOOLEAN DEFAULT false,
  is_coming_soon BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & set public read/write policy
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access for products" ON public.products;
CREATE POLICY "Public access for products" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- 2. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT,
  customer_phone TEXT,
  items JSONB,
  total_items INTEGER DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  channel TEXT DEFAULT 'WhatsApp',
  status TEXT DEFAULT 'Order Placed',
  courier_partner TEXT,
  tracking_number TEXT,
  estimated_delivery TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- If orders table already existed with missing columns, add them safely:
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_name') THEN
    ALTER TABLE public.orders ADD COLUMN customer_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_phone') THEN
    ALTER TABLE public.orders ADD COLUMN customer_phone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'courier_partner') THEN
    ALTER TABLE public.orders ADD COLUMN courier_partner TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'tracking_number') THEN
    ALTER TABLE public.orders ADD COLUMN tracking_number TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'estimated_delivery') THEN
    ALTER TABLE public.orders ADD COLUMN estimated_delivery TEXT;
  END IF;
END $$;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access for orders" ON public.orders;
CREATE POLICY "Public access for orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- 3. SITE SETTINGS TABLE (Announcements, Contact info, Shipping fees)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary_settings',
  announcement_text TEXT,
  is_announcement_visible BOOLEAN DEFAULT true,
  whatsapp_number TEXT DEFAULT '916380437068',
  instagram_username TEXT DEFAULT 'petalorah',
  admin_pin TEXT DEFAULT '240812',
  google_sheet_webhook_url TEXT,
  creation_of_the_week_product_id TEXT DEFAULT 'four_tulips_pot',
  shipping_fee_coimbatore NUMERIC DEFAULT 60,
  shipping_fee_tamil_nadu NUMERIC DEFAULT 80,
  shipping_fee_other_states NUMERIC DEFAULT 100,
  free_shipping_threshold NUMERIC DEFAULT 799,
  is_free_shipping_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access for site_settings" ON public.site_settings;
CREATE POLICY "Public access for site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

-- 4. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT DEFAULT 'percentage',
  discount_value NUMERIC DEFAULT 10,
  min_order_value NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  description TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access for coupons" ON public.coupons;
CREATE POLICY "Public access for coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);

-- 5. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rating NUMERIC DEFAULT 5,
  date TEXT,
  comment TEXT,
  verified_buyer BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  product_id TEXT,
  product_name TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access for reviews" ON public.reviews;
CREATE POLICY "Public access for reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);

-- 6. REAL CREATIONS GALLERY TABLE
CREATE TABLE IF NOT EXISTS public.gallery (
  id TEXT PRIMARY KEY,
  img TEXT NOT NULL,
  title TEXT NOT NULL,
  caption TEXT,
  tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access for gallery" ON public.gallery;
CREATE POLICY "Public access for gallery" ON public.gallery FOR ALL USING (true) WITH CHECK (true);

-- 7. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  phone TEXT,
  address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access for customers" ON public.customers;
CREATE POLICY "Public access for customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);

-- Enable Supabase Realtime for instant multi-device sync
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
