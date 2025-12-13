-- =============================================================
-- AJ247 Studios - Enhanced Media & Vault Schema (Migration 002)
-- =============================================================
-- Adds: Client Vaults, Media Assets with rich metadata, Publish Presets,
-- Enhanced Audit Logging, and Chunked Upload Support
-- =============================================================

-- -------------------------------------------------------------
-- 1. MEDIA_ASSETS (Enhanced version of storage_objects for admin workflow)
-- -------------------------------------------------------------
-- This extends storage_objects with rich metadata for admin UI
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_object_id UUID REFERENCES storage_objects(id) ON DELETE CASCADE,
  
  -- Core metadata
  title TEXT,
  caption TEXT,
  tags TEXT[] DEFAULT '{}',
  credits TEXT[] DEFAULT '{}',  -- ["Photo: John", "Edit: Jane"]
  
  -- Technical metadata (extracted from file)
  duration_seconds FLOAT,        -- For video/audio
  width INTEGER,
  height INTEGER,
  resolution TEXT,               -- "4K", "1080p", etc.
  camera_model TEXT,
  focal_length TEXT,
  iso INTEGER,
  aperture TEXT,
  shutter_speed TEXT,
  
  -- Thumbnails (generated)
  thumbnails JSONB DEFAULT '{}', -- {"small": "path", "medium": "path", "large": "path"}
  thumbnail_status TEXT DEFAULT 'pending' CHECK (thumbnail_status IN ('pending', 'processing', 'ready', 'failed')),
  
  -- Processing status
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'ready', 'failed')),
  processing_error TEXT,
  
  -- Visibility & Publishing
  public_portfolio BOOLEAN DEFAULT FALSE,
  publish_at TIMESTAMPTZ,        -- Scheduled publish time
  expires_at TIMESTAMPTZ,        -- Auto-unpublish time
  featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  
  -- QA workflow
  qa_status TEXT DEFAULT 'pending' CHECK (qa_status IN ('pending', 'passed', 'rejected')),
  qa_notes TEXT,
  qa_by UUID REFERENCES auth.users(id),
  qa_at TIMESTAMPTZ,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  parent_version_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
  is_latest_version BOOLEAN DEFAULT TRUE,
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  
  -- Audit
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_storage ON media_assets(storage_object_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_status ON media_assets(status);
CREATE INDEX IF NOT EXISTS idx_media_assets_public ON media_assets(public_portfolio) WHERE public_portfolio = TRUE;
CREATE INDEX IF NOT EXISTS idx_media_assets_tags ON media_assets USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_assets_qa ON media_assets(qa_status);

ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team can view all media assets"
  ON media_assets FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team'))
  );

CREATE POLICY "Team can manage media assets"
  ON media_assets FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team'))
  );

-- -------------------------------------------------------------
-- 2. CLIENT_VAULTS (Secure client delivery collections)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS client_vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  -- Vault info
  title TEXT NOT NULL,
  description TEXT,
  cover_image_path TEXT,
  
  -- Access controls
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'link', 'password')),
  password_hash TEXT,            -- For password-protected vaults
  allowed_download_resolutions TEXT[] DEFAULT ARRAY['preview', 'high'],  -- preview, low, high, original
  
  -- Settings
  watermark_enabled BOOLEAN DEFAULT FALSE,
  watermark_path TEXT,
  download_limit INTEGER,        -- NULL = unlimited
  expires_at TIMESTAMPTZ,
  expires_default_days INTEGER DEFAULT 30,
  
  -- Sharing
  share_token TEXT UNIQUE,       -- For link sharing
  share_link_created_at TIMESTAMPTZ,
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vaults_client ON client_vaults(client_id);
CREATE INDEX IF NOT EXISTS idx_vaults_project ON client_vaults(project_id);
CREATE INDEX IF NOT EXISTS idx_vaults_share_token ON client_vaults(share_token);

ALTER TABLE client_vaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team can manage vaults"
  ON client_vaults FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team'))
  );

CREATE POLICY "Clients can view own vaults"
  ON client_vaults FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM client_users cu
      WHERE cu.user_id = auth.uid()
      AND cu.client_id = client_vaults.client_id
    )
  );

-- -------------------------------------------------------------
-- 3. VAULT_ASSETS (Many-to-many: assets in vaults)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vault_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID REFERENCES client_vaults(id) ON DELETE CASCADE,
  media_asset_id UUID REFERENCES media_assets(id) ON DELETE CASCADE,
  
  -- Vault-specific settings for this asset
  sort_order INTEGER DEFAULT 0,
  custom_title TEXT,             -- Override asset title for this vault
  custom_caption TEXT,
  allow_download BOOLEAN DEFAULT TRUE,
  max_resolution TEXT DEFAULT 'high',  -- preview, low, high, original
  
  -- Delivery tracking
  delivered_at TIMESTAMPTZ,
  delivered_by UUID REFERENCES auth.users(id),
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMPTZ,
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(vault_id, media_asset_id)
);

CREATE INDEX IF NOT EXISTS idx_vault_assets_vault ON vault_assets(vault_id);
CREATE INDEX IF NOT EXISTS idx_vault_assets_asset ON vault_assets(media_asset_id);

ALTER TABLE vault_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team can manage vault assets"
  ON vault_assets FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team'))
  );

CREATE POLICY "Clients can view vault assets"
  ON vault_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM client_vaults cv
      JOIN client_users cu ON cu.client_id = cv.client_id
      WHERE cv.id = vault_assets.vault_id
      AND cu.user_id = auth.uid()
    )
  );

-- -------------------------------------------------------------
-- 4. PORTFOLIO_COLLECTIONS (Public portfolio organization)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS portfolio_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Collection info
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_path TEXT,
  
  -- Display settings
  is_visible BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  layout TEXT DEFAULT 'grid' CHECK (layout IN ('grid', 'masonry', 'carousel', 'fullscreen')),
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_collections_slug ON portfolio_collections(slug);
CREATE INDEX IF NOT EXISTS idx_portfolio_collections_visible ON portfolio_collections(is_visible) WHERE is_visible = TRUE;

ALTER TABLE portfolio_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible collections"
  ON portfolio_collections FOR SELECT
  USING (is_visible = TRUE);

CREATE POLICY "Admins can manage collections"
  ON portfolio_collections FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- -------------------------------------------------------------
-- 5. PORTFOLIO_ITEMS (Assets in collections)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES portfolio_collections(id) ON DELETE CASCADE,
  media_asset_id UUID REFERENCES media_assets(id) ON DELETE CASCADE,
  
  -- Display overrides
  custom_title TEXT,
  custom_caption TEXT,
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(collection_id, media_asset_id)
);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_collection ON portfolio_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_asset ON portfolio_items(media_asset_id);

ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view portfolio items"
  ON portfolio_items FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage portfolio items"
  ON portfolio_items FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- -------------------------------------------------------------
-- 6. PUBLISH_PRESETS (Saved publishing configurations)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS publish_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Preset info
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  
  -- Default visibility settings
  default_public_portfolio BOOLEAN DEFAULT FALSE,
  default_vault_ids UUID[] DEFAULT '{}',
  default_collection_ids UUID[] DEFAULT '{}',
  
  -- Watermark settings
  watermark_enabled BOOLEAN DEFAULT FALSE,
  watermark_path TEXT,
  watermark_position TEXT DEFAULT 'bottom-right',
  watermark_opacity FLOAT DEFAULT 0.5,
  
  -- Default tags/metadata to apply
  apply_tags TEXT[] DEFAULT '{}',
  apply_credits TEXT[] DEFAULT '{}',
  
  -- Delivery notification template
  notification_template JSONB DEFAULT '{}',  -- {"email_subject": "...", "email_body": "...", "whatsapp_message": "..."}
  
  -- Expiry defaults
  default_expires_days INTEGER,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE publish_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team can view presets"
  ON publish_presets FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team'))
  );

CREATE POLICY "Admins can manage presets"
  ON publish_presets FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- -------------------------------------------------------------
-- 7. CHUNKED_UPLOADS (Track multi-part uploads)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chunked_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Upload info
  upload_id TEXT UNIQUE NOT NULL,  -- R2/S3 multipart upload ID
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  -- File info
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  total_size BIGINT NOT NULL,
  total_chunks INTEGER NOT NULL,
  chunk_size INTEGER NOT NULL,
  
  -- Target path
  r2_path TEXT NOT NULL,
  file_type TEXT,
  
  -- Progress
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completing', 'completed', 'failed', 'cancelled')),
  chunks_uploaded INTEGER DEFAULT 0,
  bytes_uploaded BIGINT DEFAULT 0,
  
  -- Resume support
  uploaded_parts JSONB DEFAULT '[]',  -- [{"partNumber": 1, "etag": "..."}, ...]
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Error tracking
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Cleanup
  expires_at TIMESTAMPTZ NOT NULL,  -- Auto-cleanup incomplete uploads
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chunked_uploads_user ON chunked_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_chunked_uploads_status ON chunked_uploads(status);
CREATE INDEX IF NOT EXISTS idx_chunked_uploads_expires ON chunked_uploads(expires_at);

ALTER TABLE chunked_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chunked uploads"
  ON chunked_uploads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Team can manage chunked uploads"
  ON chunked_uploads FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team'))
  );

-- -------------------------------------------------------------
-- 8. PROCESSING_JOBS (Unified job queue for all async tasks)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Job type
  job_type TEXT NOT NULL CHECK (job_type IN (
    'thumbnail_generate',
    'transcode_video',
    'extract_metadata',
    'watermark_apply',
    'archive_create',
    'notification_send'
  )),
  
  -- Target
  media_asset_id UUID REFERENCES media_assets(id) ON DELETE CASCADE,
  
  -- Job config
  config JSONB DEFAULT '{}',  -- Job-specific settings
  priority INTEGER DEFAULT 0,  -- Higher = more urgent
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  progress INTEGER DEFAULT 0,  -- 0-100
  estimated_seconds INTEGER,   -- ETA
  
  -- Results
  result JSONB,               -- Job output
  error_message TEXT,
  
  -- Worker info
  worker_id TEXT,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  
  -- Timing
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_processing_jobs_status ON processing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_type ON processing_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_asset ON processing_jobs(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_scheduled ON processing_jobs(scheduled_at) WHERE status = 'pending';

ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team can view processing jobs"
  ON processing_jobs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team'))
  );

CREATE POLICY "Admins can manage processing jobs"
  ON processing_jobs FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- -------------------------------------------------------------
-- 9. DELIVERY_NOTIFICATIONS (Track sent notifications)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS delivery_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What was delivered
  vault_id UUID REFERENCES client_vaults(id) ON DELETE SET NULL,
  asset_ids UUID[] DEFAULT '{}',
  
  -- Recipient
  recipient_type TEXT CHECK (recipient_type IN ('email', 'whatsapp', 'in_app')),
  recipient_address TEXT,  -- email or phone
  recipient_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Content
  subject TEXT,
  body TEXT,
  template_used TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Tracking
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_vault ON delivery_notifications(vault_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON delivery_notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON delivery_notifications(recipient_user_id);

ALTER TABLE delivery_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team can manage notifications"
  ON delivery_notifications FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team'))
  );

-- -------------------------------------------------------------
-- 10. AUDIT_LOG (Enhanced with more event types)
-- -------------------------------------------------------------
-- Extending the existing activity_log or creating enhanced version
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Actor
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_role TEXT,
  
  -- Action
  action TEXT NOT NULL,  -- upload, publish, deliver, delete, edit, view, download, share, etc.
  action_category TEXT,  -- media, vault, portfolio, user, system
  
  -- Target
  target_type TEXT,      -- media_asset, vault, collection, project, client
  target_id UUID,
  target_name TEXT,      -- Human-readable name for display
  
  -- Changes
  old_values JSONB,      -- Previous state
  new_values JSONB,      -- New state
  
  -- Context
  metadata JSONB,        -- Additional context
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_target ON audit_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_category ON audit_log(action_category);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team can view audit logs"
  ON audit_log FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team'))
  );

CREATE POLICY "System can insert audit logs"
  ON audit_log FOR INSERT
  WITH CHECK (TRUE);

-- -------------------------------------------------------------
-- 11. STORAGE_QUOTAS (Usage tracking per client/team)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS storage_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Target
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Limits (in bytes)
  quota_bytes BIGINT DEFAULT 10737418240,  -- 10GB default
  used_bytes BIGINT DEFAULT 0,
  
  -- Alerts
  warning_threshold_percent INTEGER DEFAULT 80,
  warning_sent_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(client_id)
);

ALTER TABLE storage_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team can manage quotas"
  ON storage_quotas FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team'))
  );

-- -------------------------------------------------------------
-- HELPER FUNCTIONS
-- -------------------------------------------------------------

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_action TEXT,
  p_action_category TEXT DEFAULT NULL,
  p_target_type TEXT DEFAULT NULL,
  p_target_id UUID DEFAULT NULL,
  p_target_name TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
  v_role TEXT;
BEGIN
  -- Get user role
  SELECT role INTO v_role FROM profiles WHERE id = p_user_id;
  
  INSERT INTO audit_log (
    user_id, user_role, action, action_category,
    target_type, target_id, target_name,
    old_values, new_values, metadata
  )
  VALUES (
    p_user_id, v_role, p_action, p_action_category,
    p_target_type, p_target_id, p_target_name,
    p_old_values, p_new_values, p_metadata
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update storage quota usage
CREATE OR REPLACE FUNCTION update_storage_usage(p_client_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE storage_quotas
  SET used_bytes = (
    SELECT COALESCE(SUM(so.size_bytes), 0)
    FROM storage_objects so
    WHERE so.client_id = p_client_id
  ),
  updated_at = NOW()
  WHERE client_id = p_client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update media_assets.updated_at
CREATE OR REPLACE FUNCTION update_media_asset_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_media_assets_updated_at
  BEFORE UPDATE ON media_assets
  FOR EACH ROW EXECUTE FUNCTION update_media_asset_timestamp();

-- Trigger to update client_vaults.updated_at
CREATE TRIGGER update_client_vaults_updated_at
  BEFORE UPDATE ON client_vaults
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update portfolio_collections.updated_at
CREATE TRIGGER update_portfolio_collections_updated_at
  BEFORE UPDATE ON portfolio_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update publish_presets.updated_at
CREATE TRIGGER update_publish_presets_updated_at
  BEFORE UPDATE ON publish_presets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
