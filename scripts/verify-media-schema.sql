-- =============================================================
-- VERIFY & FIX MEDIA SCHEMA
-- Run this in Supabase SQL Editor to check and fix issues
-- =============================================================

-- 1. Check if site_images table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'site_images'
) AS site_images_exists;

-- 2. Check if hero_slots table exists  
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'hero_slots'
) AS hero_slots_exists;

-- 3. Check if portfolio_items table exists and has created_at
SELECT 
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'portfolio_items'
  ) AS portfolio_items_exists,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'portfolio_items' AND column_name = 'created_at'
  ) AS has_created_at,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'portfolio_items' AND column_name = 'updated_at'
  ) AS has_updated_at;

-- 4. Check hero_slots has primary key
SELECT 
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'hero_slots' 
  AND tc.constraint_type = 'PRIMARY KEY';

-- =============================================================
-- FIXES (only run if above checks fail)
-- =============================================================

-- Fix 1: Add missing columns to portfolio_items (safe to run multiple times)
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS updated_by UUID;

-- Fix 2: Create site_images table if missing
CREATE TABLE IF NOT EXISTS site_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL,
  public_url TEXT,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  focal_x NUMERIC(4,3) DEFAULT 0.5 CHECK (focal_x >= 0 AND focal_x <= 1),
  focal_y NUMERIC(4,3) DEFAULT 0.5 CHECK (focal_y >= 0 AND focal_y <= 1),
  alt_text TEXT,
  caption TEXT,
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  variants JSONB DEFAULT '{}',
  variants_status TEXT DEFAULT 'pending' CHECK (variants_status IN ('pending', 'processing', 'ready', 'failed')),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fix 3: Create hero_slots table if missing
CREATE TABLE IF NOT EXISTS hero_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL,
  slot_key TEXT NOT NULL,
  image_id UUID REFERENCES site_images(id) ON DELETE SET NULL,
  alt_text_override TEXT,
  aspect_ratio TEXT DEFAULT '16:9',
  object_fit TEXT DEFAULT 'cover',
  hide_on_mobile BOOLEAN DEFAULT FALSE,
  mobile_image_id UUID REFERENCES site_images(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_key, slot_key)
);

-- Fix 4: Enable RLS on new tables
ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slots ENABLE ROW LEVEL SECURITY;

-- Fix 5: Create RLS policies (if not exist)
DO $$
BEGIN
  -- site_images policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_images' AND policyname = 'Public can view site images') THEN
    CREATE POLICY "Public can view site images" ON site_images FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_images' AND policyname = 'Admins can manage site images') THEN
    CREATE POLICY "Admins can manage site images" ON site_images FOR ALL
    USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;
  
  -- hero_slots policies  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'hero_slots' AND policyname = 'Public can view active hero slots') THEN
    CREATE POLICY "Public can view active hero slots" ON hero_slots FOR SELECT USING (is_active = true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'hero_slots' AND policyname = 'Admins can manage hero slots') THEN
    CREATE POLICY "Admins can manage hero slots" ON hero_slots FOR ALL
    USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;
END$$;

-- Fix 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_site_images_category ON site_images(category);
CREATE INDEX IF NOT EXISTS idx_site_images_storage ON site_images(storage_path);
CREATE INDEX IF NOT EXISTS idx_hero_slots_page ON hero_slots(page_key);
CREATE INDEX IF NOT EXISTS idx_hero_slots_image ON hero_slots(image_id);

-- Fix 7: Seed default hero slots (won't duplicate due to unique constraint)
INSERT INTO hero_slots (page_key, slot_key, aspect_ratio, sort_order) VALUES
  ('home', 'main-background', '16:9', 0),
  ('home', 'hero-inline', '4:3', 1),
  ('services', 'main-background', '21:9', 0),
  ('about', 'main-background', '16:9', 0),
  ('about', 'team-banner', '3:1', 1),
  ('contact', 'main-background', '16:9', 0),
  ('portfolio', 'header-background', '21:9', 0)
ON CONFLICT (page_key, slot_key) DO NOTHING;

-- Final verification
SELECT 'Schema fix complete!' AS status;
SELECT COUNT(*) AS site_images_count FROM site_images;
SELECT COUNT(*) AS hero_slots_count FROM hero_slots;
