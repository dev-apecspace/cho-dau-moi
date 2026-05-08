-- ============================================
-- CHỢ ĐẦU MỚI - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  icon text DEFAULT '',
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 2. Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  avatar_url text DEFAULT '',
  rating numeric DEFAULT 0,
  product_count int DEFAULT 0,
  response_rate int DEFAULT 0,
  response_time text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 3. Products
CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE,
  description text DEFAULT '',
  price numeric DEFAULT 0,
  original_price numeric DEFAULT 0,
  unit text DEFAULT 'kg',
  min_order text DEFAULT '',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  origin text DEFAULT '',
  rating numeric DEFAULT 0,
  review_count int DEFAULT 0,
  sold_count int DEFAULT 0,
  tags text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  is_best_seller boolean DEFAULT false,
  is_daily boolean DEFAULT false,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 4. Product Images
CREATE TABLE IF NOT EXISTS product_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order int DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 5. Product Specs
CREATE TABLE IF NOT EXISTS product_specs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label text NOT NULL,
  value text NOT NULL,
  sort_order int DEFAULT 0
);

-- 6. Price Tiers
CREATE TABLE IF NOT EXISTS price_tiers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  min_qty int NOT NULL,
  max_qty int,
  price numeric NOT NULL
);

-- 7. Banners
CREATE TABLE IF NOT EXISTS banners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  subtitle text DEFAULT '',
  image_url text DEFAULT '',
  link_url text DEFAULT '',
  position text DEFAULT 'hero',
  bg_gradient text DEFAULT '',
  emoji text DEFAULT '',
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 8. Vouchers
CREATE TABLE IF NOT EXISTS vouchers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  description text DEFAULT '',
  min_order numeric DEFAULT 0,
  discount_value numeric DEFAULT 0,
  discount_type text DEFAULT 'fixed',
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 9. Deals
CREATE TABLE IF NOT EXISTS deals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tag text DEFAULT '',
  title text NOT NULL,
  description text DEFAULT '',
  emoji text DEFAULT '',
  bg_gradient text DEFAULT '',
  btn_text text DEFAULT 'XEM NGAY',
  link_url text DEFAULT '',
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 10. Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- Enable RLS (Row Level Security)
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read policies (for the frontend)
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read suppliers" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Public read product_specs" ON product_specs FOR SELECT USING (true);
CREATE POLICY "Public read price_tiers" ON price_tiers FOR SELECT USING (true);
CREATE POLICY "Public read banners" ON banners FOR SELECT USING (true);
CREATE POLICY "Public read vouchers" ON vouchers FOR SELECT USING (true);
CREATE POLICY "Public read deals" ON deals FOR SELECT USING (true);
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);

-- Public write policies (for admin - using anon key for now)
CREATE POLICY "Public write categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public write suppliers" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public write products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public write product_images" ON product_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public write product_specs" ON product_specs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public write price_tiers" ON price_tiers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public write banners" ON banners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public write vouchers" ON vouchers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public write deals" ON deals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public write site_settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Create Storage Bucket for images
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('suppliers', 'suppliers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public read product images" ON storage.objects FOR SELECT USING (bucket_id IN ('product-images', 'banners', 'suppliers'));
CREATE POLICY "Public upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('product-images', 'banners', 'suppliers'));
CREATE POLICY "Public update product images" ON storage.objects FOR UPDATE USING (bucket_id IN ('product-images', 'banners', 'suppliers'));
CREATE POLICY "Public delete product images" ON storage.objects FOR DELETE USING (bucket_id IN ('product-images', 'banners', 'suppliers'));

-- 11. Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text DEFAULT '',
  role text DEFAULT 'admin',
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read admin_users" ON admin_users FOR SELECT USING (true);
CREATE POLICY "Public write admin_users" ON admin_users FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Seed Data (from existing mock data)
-- ============================================

-- Default admin account (password: admin123)
INSERT INTO admin_users (email, password_hash, name, role) VALUES
('admin@chodaumoi.vn', 'admin123', 'Quản trị viên', 'super_admin');

-- Categories
INSERT INTO categories (name, icon, sort_order) VALUES
('Rau lá xanh', '🥬', 1),
('Củ quả tươi', '🥕', 2),
('Trái cây tươi', '🍓', 3),
('Nấm các loại', '🍄', 4),
('Gia vị tươi', '🌶️', 5),
('Khoai, sắn, môn', '🥔', 6),
('Ngô, đậu, hạt', '🌽', 7),
('Rau gia vị', '🌿', 8),
('Trái cây nhập', '🍊', 9);

-- Suppliers
INSERT INTO suppliers (name, rating, product_count, response_rate, response_time) VALUES
('Nông Sản Bắc Lý', 4.2, 128, 96, 'Trong 1h'),
('Rau Sạch An Thịnh', 4.8, 85, 98, 'Trong 30p'),
('Trái Cây Việt Phát', 4.2, 64, 90, 'Trong 2h'),
('Nông Trại Đà Lạt', 4.1, 156, 95, 'Trong 1h'),
('Rau Hữu Cơ Xanh', 4.6, 42, 99, 'Trong 15p'),
('Vườn Trái Cây MK', 4.5, 73, 92, 'Trong 1h');

