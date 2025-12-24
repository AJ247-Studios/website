-- =============================================================
-- AJ247 Studios - Hero & Portfolio Visual Editor Schema (Migration 008)
-- =============================================================
-- Adds tables for visual hero/portfolio editing with focal-point support
-- and responsive image management
-- =============================================================

-- -------------------------------------------------------------
-- 1. SITE_IMAGES (Master image registry with focal points)
-- -------------------------------------------------------------
-- Central image table for all site imagery with focal-point data
CREATE TABLE IF NOT EXISTS site_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Storage reference (R2/Supabase Storage path)
  storage_path TEXT NOT NULL,
  public_url TEXT,              -- Cached public URL
  
  -- File metadata
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER,            -- bytes
  width INTEGER,
  height INTEGER,
  
  -- Focal point (normalized 0..1 for responsive cropping)
  focal_x NUMERIC(4,3) DEFAULT 0.5 CHECK (focal_x >= 0 AND focal_x <= 1),
  focal_y NUMERIC(4,3) DEFAULT 0.5 CHECK (focal_y >= 0 AND focal_y <= 1),
  
  -- Accessibility & SEO
  alt_text TEXT,
  caption TEXT,
  
  -- Organization
  tags TEXT[] DEFAULT '{}',
  category TEXT,                -- 'hero', 'portfolio', 'team', 'general'
  
  -- Generated variants (stored as JSONB for flexibility)
  -- Format: { "mobile": { "path": "...", "width": 600 }, "tablet": {...}, "desktop": {...}, "retina": {...} }
  variants JSONB DEFAULT '{}',
  variants_status TEXT DEFAULT 'pending' CHECK (variants_status IN ('pending', 'processing', 'ready', 'failed')),
  
  -- Ownership & audit
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_images_category ON site_images(category);
CREATE INDEX IF NOT EXISTS idx_site_images_tags ON site_images USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_site_images_storage ON site_images(storage_path);

ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;

-- Everyone can read published images
CREATE POLICY "Public can view site images"
  ON site_images FOR SELECT
  USING (true);

-- Only admins can modify
CREATE POLICY "Admins can manage site images"
  ON site_images FOR ALL
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- -------------------------------------------------------------
-- 2. HERO_SLOTS (Page-specific hero image slots)
-- -------------------------------------------------------------
-- Maps hero areas on each page to their assigned images
CREATE TABLE IF NOT EXISTS hero_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Location
  page_key TEXT NOT NULL,       -- 'home', 'services', 'about', 'contact', etc.
  slot_key TEXT NOT NULL,       -- 'main-bg', 'left-image', 'right-figure', etc.
  
  -- Image assignment
  image_id UUID REFERENCES site_images(id) ON DELETE SET NULL,
  
  -- Slot-specific overrides
  alt_text_override TEXT,       -- Override image's alt text for this slot
  aspect_ratio TEXT DEFAULT '16:9',  -- '16:9', '4:3', '1:1', '21:9', 'auto'
  object_fit TEXT DEFAULT 'cover',   -- 'cover', 'contain', 'fill'
  
  -- Responsive behavior
  hide_on_mobile BOOLEAN DEFAULT FALSE,
  mobile_image_id UUID REFERENCES site_images(id) ON DELETE SET NULL,  -- Optional different image for mobile
  
  -- Display
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  
  -- Audit
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one slot per page/key combo
  UNIQUE(page_key, slot_key)
);

CREATE INDEX IF NOT EXISTS idx_hero_slots_page ON hero_slots(page_key);
CREATE INDEX IF NOT EXISTS idx_hero_slots_image ON hero_slots(image_id);

ALTER TABLE hero_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active hero slots"
  ON hero_slots FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage hero slots"
  ON hero_slots FOR ALL
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- -------------------------------------------------------------
-- 3. PORTFOLIO_ITEMS (Portfolio grid tiles with images)
-- -------------------------------------------------------------
-- Each portfolio card/tile in the grid
CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  full_description TEXT,
  
  -- Images
  cover_image_id UUID REFERENCES site_images(id) ON DELETE SET NULL,
  thumbnail_image_id UUID REFERENCES site_images(id) ON DELETE SET NULL,
  hover_image_id UUID REFERENCES site_images(id) ON DELETE SET NULL,  -- Optional hover state
  
  -- Categorization
  categories TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  client_name TEXT,
  project_date DATE,
  
  -- Display
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  
  -- Link behavior
  link_type TEXT DEFAULT 'detail' CHECK (link_type IN ('detail', 'external', 'lightbox', 'none')),
  external_url TEXT,
  
  -- Metrics (for social proof)
  view_count INTEGER DEFAULT 0,
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_published ON portfolio_items(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_portfolio_featured ON portfolio_items(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_portfolio_categories ON portfolio_items USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_portfolio_sort ON portfolio_items(sort_order);

ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published portfolio"
  ON portfolio_items FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can view all portfolio"
  ON portfolio_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage portfolio"
  ON portfolio_items FOR ALL
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- -------------------------------------------------------------
-- 4. PORTFOLIO_GALLERY (Additional images for portfolio detail pages)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS portfolio_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_item_id UUID NOT NULL REFERENCES portfolio_items(id) ON DELETE CASCADE,
  image_id UUID NOT NULL REFERENCES site_images(id) ON DELETE CASCADE,
  
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(portfolio_item_id, image_id)
);

CREATE INDEX IF NOT EXISTS idx_portfolio_gallery_item ON portfolio_gallery(portfolio_item_id);

ALTER TABLE portfolio_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view gallery of published items"
  ON portfolio_gallery FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolio_items 
      WHERE id = portfolio_gallery.portfolio_item_id 
      AND is_published = true
    )
  );

CREATE POLICY "Admins can manage gallery"
  ON portfolio_gallery FOR ALL
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- -------------------------------------------------------------
-- 5. IMAGE_EDIT_HISTORY (Audit trail for image changes)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS image_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What changed
  entity_type TEXT NOT NULL,    -- 'site_images', 'hero_slots', 'portfolio_items'
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,         -- 'create', 'update', 'delete', 'upload', 'assign'
  
  -- Change details
  field_changed TEXT,           -- Which field was modified
  old_value JSONB,
  new_value JSONB,
  
  -- Who & when
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Context
  user_agent TEXT,
  ip_address INET
);

CREATE INDEX IF NOT EXISTS idx_edit_history_entity ON image_edit_history(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_edit_history_time ON image_edit_history(changed_at DESC);

ALTER TABLE image_edit_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view edit history"
  ON image_edit_history FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System can insert edit history"
  ON image_edit_history FOR INSERT
  WITH CHECK (true);

-- -------------------------------------------------------------
-- 6. HELPER FUNCTIONS
-- -------------------------------------------------------------

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DO $$
BEGIN
  -- site_images
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_site_images_updated_at') THEN
    CREATE TRIGGER update_site_images_updated_at
      BEFORE UPDATE ON site_images
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- hero_slots
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_hero_slots_updated_at') THEN
    CREATE TRIGGER update_hero_slots_updated_at
      BEFORE UPDATE ON hero_slots
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- portfolio_items
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_portfolio_items_updated_at') THEN
    CREATE TRIGGER update_portfolio_items_updated_at
      BEFORE UPDATE ON portfolio_items
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;

-- Function to log image edits (call from application or trigger)
CREATE OR REPLACE FUNCTION log_image_edit(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_action TEXT,
  p_field_changed TEXT DEFAULT NULL,
  p_old_value JSONB DEFAULT NULL,
  p_new_value JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO image_edit_history (
    entity_type, entity_id, action, field_changed, old_value, new_value, changed_by
  ) VALUES (
    p_entity_type, p_entity_id, p_action, p_field_changed, p_old_value, p_new_value, auth.uid()
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -------------------------------------------------------------
-- 7. SEED DEFAULT HERO SLOTS
-- -------------------------------------------------------------
-- Create default slots for common pages (won't duplicate if already exist)
INSERT INTO hero_slots (page_key, slot_key, aspect_ratio, sort_order) VALUES
  ('home', 'main-background', '16:9', 0),
  ('home', 'hero-inline', '4:3', 1),
  ('services', 'main-background', '21:9', 0),
  ('about', 'main-background', '16:9', 0),
  ('about', 'team-banner', '3:1', 1),
  ('contact', 'main-background', '16:9', 0),
  ('portfolio', 'header-background', '21:9', 0)
ON CONFLICT (page_key, slot_key) DO NOTHING;

-- -------------------------------------------------------------
-- 8. VIEWS FOR EASY QUERYING
-- -------------------------------------------------------------

-- Hero slots with joined image data
CREATE OR REPLACE VIEW hero_slots_with_images AS
SELECT 
  hs.id,
  hs.page_key,
  hs.slot_key,
  hs.aspect_ratio,
  hs.object_fit,
  hs.hide_on_mobile,
  hs.is_active,
  hs.sort_order,
  hs.alt_text_override,
  hs.updated_at,
  -- Main image
  si.id AS image_id,
  si.storage_path,
  si.public_url,
  si.focal_x,
  si.focal_y,
  si.alt_text AS image_alt_text,
  si.width AS image_width,
  si.height AS image_height,
  si.variants,
  -- Mobile image
  mi.id AS mobile_image_id,
  mi.storage_path AS mobile_storage_path,
  mi.public_url AS mobile_public_url,
  mi.focal_x AS mobile_focal_x,
  mi.focal_y AS mobile_focal_y
FROM hero_slots hs
LEFT JOIN site_images si ON si.id = hs.image_id
LEFT JOIN site_images mi ON mi.id = hs.mobile_image_id;

-- Portfolio items with cover images
CREATE OR REPLACE VIEW portfolio_items_with_images AS
SELECT 
  pi.id,
  pi.title,
  pi.slug,
  pi.short_description,
  pi.categories,
  pi.client_name,
  pi.project_date,
  pi.is_published,
  pi.is_featured,
  pi.sort_order,
  pi.link_type,
  pi.external_url,
  pi.view_count,
  -- Cover image
  ci.id AS cover_image_id,
  ci.storage_path AS cover_storage_path,
  ci.public_url AS cover_public_url,
  ci.focal_x AS cover_focal_x,
  ci.focal_y AS cover_focal_y,
  ci.alt_text AS cover_alt_text,
  ci.variants AS cover_variants,
  -- Thumbnail image
  ti.id AS thumb_image_id,
  ti.storage_path AS thumb_storage_path,
  ti.public_url AS thumb_public_url,
  ti.focal_x AS thumb_focal_x,
  ti.focal_y AS thumb_focal_y,
  -- Hover image
  hi.id AS hover_image_id,
  hi.public_url AS hover_public_url
FROM portfolio_items pi
LEFT JOIN site_images ci ON ci.id = pi.cover_image_id
LEFT JOIN site_images ti ON ti.id = pi.thumbnail_image_id
LEFT JOIN site_images hi ON hi.id = pi.hover_image_id;
