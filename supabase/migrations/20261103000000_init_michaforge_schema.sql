-- ============================================================================
-- MICHAFORGE ENTERPRISES — Complete Supabase PostgreSQL Schema & Initial Seed
-- Project Ref: trpyjeeazksjecdsfnld
-- ============================================================================

-- 1. Users Table (Auth Service)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Super Admin',
  is_active BOOLEAN NOT NULL DEFAULT true,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- 2. Refresh Tokens Table (Auth Service)
CREATE TABLE IF NOT EXISTS public.refresh_tokens (
  token TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Categories Table (Catalogue Service)
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon_name TEXT NOT NULL DEFAULT 'pipe',
  image_url TEXT DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 1,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Products Table (Catalogue Service)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  short_description TEXT DEFAULT '',
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  unit TEXT NOT NULL DEFAULT 'each',
  status TEXT NOT NULL DEFAULT 'published',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  featured_order INTEGER,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  specifications JSONB NOT NULL DEFAULT '[]'::jsonb,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

-- 5. Product Prices Table (Pricing Service)
CREATE TABLE IF NOT EXISTS public.product_prices (
  id TEXT PRIMARY KEY,
  product_id TEXT UNIQUE NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  price NUMERIC(12, 2),
  previous_price NUMERIC(12, 2),
  currency TEXT NOT NULL DEFAULT 'KES',
  unit TEXT NOT NULL DEFAULT 'each',
  effective_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT NOT NULL DEFAULT 'Administrator',
  reason TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Price History Table (Pricing Service)
CREATE TABLE IF NOT EXISTS public.price_history (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  previous_price NUMERIC(12, 2),
  new_price NUMERIC(12, 2),
  currency TEXT NOT NULL DEFAULT 'KES',
  changed_by TEXT NOT NULL DEFAULT 'Administrator',
  reason TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Media Assets Table (Media Service)
CREATE TABLE IF NOT EXISTS public.media_assets (
  id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL DEFAULT 0,
  url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  category TEXT DEFAULT 'general',
  uploaded_by TEXT NOT NULL DEFAULT 'Administrator',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Enquiries Table (Enquiry Service)
CREATE TABLE IF NOT EXISTS public.enquiries (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  enquiry_type TEXT NOT NULL DEFAULT 'general',
  product_id TEXT,
  product_name TEXT,
  product_sku TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New',
  assigned_to TEXT,
  source TEXT NOT NULL DEFAULT 'website_form',
  notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  follow_ups JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Site Content & Brand Settings Table (Content Service)
CREATE TABLE IF NOT EXISTS public.site_content (
  id TEXT PRIMARY KEY DEFAULT 'default',
  brand JSONB NOT NULL,
  about_content JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Audit Logs Table (Reporting Service)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL DEFAULT '',
  details JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Notifications Table (Notification Service)
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL,
  provider TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS and grant access so Supabase API keys (anon/authenticated/service_role) work seamlessly
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users', 'refresh_tokens', 'categories', 'products',
    'product_prices', 'price_history', 'media_assets',
    'enquiries', 'site_content', 'audit_logs', 'notifications'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "allow_all_%s" ON public.%I;', t, t);
    EXECUTE format('CREATE POLICY "allow_all_%s" ON public.%I FOR ALL USING (true) WITH CHECK (true);', t, t);
    EXECUTE format('GRANT ALL ON TABLE public.%I TO anon, authenticated, service_role;', t);
  END LOOP;
END $$;

