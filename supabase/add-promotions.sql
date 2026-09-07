-- Popup advertisements: run this script in Supabase SQL Editor.
CREATE TABLE IF NOT EXISTS promotions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('image', 'video', 'youtube')),
  media_url text NOT NULL,
  link_url text DEFAULT '',
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read promotions" ON promotions FOR SELECT USING (true);
CREATE POLICY "Public write promotions" ON promotions FOR ALL USING (true) WITH CHECK (true);
