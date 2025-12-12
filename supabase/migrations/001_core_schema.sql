-- =============================================================
-- AJ247 Studios - Core Database Schema
-- =============================================================
-- Run this in Supabase SQL Editor or via migrations
-- This creates the foundational tables for auth, projects, and storage
-- =============================================================

-- -------------------------------------------------------------
-- 1. PROFILES TABLE (extends auth.users)
-- -------------------------------------------------------------
-- Note: You may already have a user_profiles table. If so, alter it
-- to add missing columns instead of creating a new one.

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'team', 'client')),
  phone TEXT,
  whatsapp TEXT,
  avatar_path TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Team can view client profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team')
    )
  );

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END;
$$;

-- -------------------------------------------------------------
-- 2. CLIENTS TABLE (for business/company clients)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  company_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Admins and team can view/manage clients
CREATE POLICY "Team can view clients"
  ON clients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team')
    )
  );

CREATE POLICY "Admins can manage clients"
  ON clients FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- -------------------------------------------------------------
-- 3. CLIENT_USERS JUNCTION (links auth users to clients)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS client_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_level TEXT DEFAULT 'viewer' CHECK (access_level IN ('owner', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, user_id)
);

ALTER TABLE client_users ENABLE ROW LEVEL SECURITY;

-- Users can see their own client associations
CREATE POLICY "Users can view own client associations"
  ON client_users FOR SELECT
  USING (auth.uid() = user_id);

-- Team can view all client associations
CREATE POLICY "Team can view all client associations"
  ON client_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team')
    )
  );

-- Admins can manage client associations
CREATE POLICY "Admins can manage client associations"
  ON client_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- -------------------------------------------------------------
-- 4. PROJECTS TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'quote' CHECK (status IN ('quote', 'approved', 'in_progress', 'review', 'delivered', 'paid', 'archived')),
  project_type TEXT CHECK (project_type IN ('wedding', 'event', 'corporate', 'sports', 'portrait', 'commercial', 'other')),
  shoot_date DATE,
  deadline DATE,
  budget_cents INTEGER,
  currency TEXT DEFAULT 'PLN',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Team can view all projects
CREATE POLICY "Team can view all projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team')
    )
  );

-- Clients can view their own projects
CREATE POLICY "Clients can view own projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM client_users cu
      WHERE cu.user_id = auth.uid()
      AND cu.client_id = projects.client_id
    )
  );

-- Admins can manage all projects
CREATE POLICY "Admins can manage projects"
  ON projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Team can update projects
CREATE POLICY "Team can update projects"
  ON projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'team'
    )
  );

-- -------------------------------------------------------------
-- 5. PROJECT_TEAM (assign team members to projects)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('lead', 'member', 'assistant')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE project_team ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team can view project assignments"
  ON project_team FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team')
    )
  );

CREATE POLICY "Admins can manage project assignments"
  ON project_team FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- -------------------------------------------------------------
-- 6. STORAGE_OBJECTS TABLE (R2 file metadata)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS storage_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- R2 storage info
  r2_path TEXT NOT NULL,           -- Full path/key in R2 bucket
  r2_bucket TEXT NOT NULL,         -- Bucket name
  
  -- File metadata
  filename TEXT NOT NULL,          -- Original filename
  mime_type TEXT,
  size_bytes BIGINT,
  checksum TEXT,                   -- MD5 or SHA256
  
  -- Access control
  is_public BOOLEAN DEFAULT FALSE,
  access_level TEXT DEFAULT 'private' CHECK (access_level IN ('public', 'client', 'team', 'private')),
  
  -- Categorization
  file_type TEXT CHECK (file_type IN ('raw', 'deliverable', 'transcode', 'avatar', 'asset', 'backup', 'other')),
  transcode_status TEXT CHECK (transcode_status IN ('pending', 'processing', 'completed', 'failed')),
  parent_id UUID REFERENCES storage_objects(id) ON DELETE SET NULL,  -- For transcodes linking to source
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_storage_objects_project ON storage_objects(project_id);
CREATE INDEX IF NOT EXISTS idx_storage_objects_client ON storage_objects(client_id);
CREATE INDEX IF NOT EXISTS idx_storage_objects_r2_path ON storage_objects(r2_path);
CREATE INDEX IF NOT EXISTS idx_storage_objects_uploaded_by ON storage_objects(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_storage_objects_is_public ON storage_objects(is_public) WHERE is_public = TRUE;

ALTER TABLE storage_objects ENABLE ROW LEVEL SECURITY;

-- Public files are viewable by anyone
CREATE POLICY "Public files are viewable"
  ON storage_objects FOR SELECT
  USING (is_public = TRUE);

-- Team can view all files
CREATE POLICY "Team can view all files"
  ON storage_objects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team')
    )
  );

-- Clients can view their project files (deliverables)
CREATE POLICY "Clients can view own project files"
  ON storage_objects FOR SELECT
  USING (
    access_level IN ('public', 'client')
    AND EXISTS (
      SELECT 1 FROM client_users cu
      JOIN projects p ON p.client_id = cu.client_id
      WHERE cu.user_id = auth.uid()
      AND p.id = storage_objects.project_id
    )
  );

-- Team can insert files
CREATE POLICY "Team can upload files"
  ON storage_objects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team')
    )
  );

-- Admins can do everything
CREATE POLICY "Admins can manage all files"
  ON storage_objects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- -------------------------------------------------------------
-- 7. UPLOAD_TOKENS (for secure presigned URL tracking)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS upload_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Token info
  token TEXT UNIQUE NOT NULL,
  r2_path TEXT NOT NULL,
  
  -- Constraints
  max_size_bytes BIGINT DEFAULT 104857600,  -- 100MB default
  allowed_mimes TEXT[],
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_upload_tokens_token ON upload_tokens(token);
CREATE INDEX IF NOT EXISTS idx_upload_tokens_expires ON upload_tokens(expires_at);

ALTER TABLE upload_tokens ENABLE ROW LEVEL SECURITY;

-- Only the token creator can view their tokens
CREATE POLICY "Users can view own upload tokens"
  ON upload_tokens FOR SELECT
  USING (auth.uid() = user_id);

-- Team can create upload tokens
CREATE POLICY "Team can create upload tokens"
  ON upload_tokens FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team')
    )
  );

-- -------------------------------------------------------------
-- 8. TRANSCODE_JOBS (for video processing queue)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transcode_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_object_id UUID REFERENCES storage_objects(id) ON DELETE CASCADE,
  
  -- Job config
  target_resolution TEXT,          -- '720p', '1080p', '4k'
  target_format TEXT,              -- 'mp4', 'webm'
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress INTEGER DEFAULT 0,       -- 0-100
  error_message TEXT,
  
  -- Output
  output_object_id UUID REFERENCES storage_objects(id) ON DELETE SET NULL,
  
  -- Worker info
  worker_id TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transcode_jobs_status ON transcode_jobs(status);
CREATE INDEX IF NOT EXISTS idx_transcode_jobs_source ON transcode_jobs(source_object_id);

ALTER TABLE transcode_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team can view transcode jobs"
  ON transcode_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team')
    )
  );

CREATE POLICY "Admins can manage transcode jobs"
  ON transcode_jobs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- -------------------------------------------------------------
-- 9. ACTIVITY_LOG (audit trail)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- What happened
  action TEXT NOT NULL,            -- 'upload', 'download', 'delete', 'view', 'login', etc.
  entity_type TEXT,                -- 'project', 'file', 'user', etc.
  entity_id UUID,
  
  -- Context
  metadata JSONB,                  -- Additional context data
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own activity
CREATE POLICY "Users can view own activity"
  ON activity_log FOR SELECT
  USING (auth.uid() = user_id);

-- Team can view all activity
CREATE POLICY "Team can view all activity"
  ON activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team')
    )
  );

-- System/service role can insert activity (no RLS bypass needed for service role)

-- -------------------------------------------------------------
-- 10. HELPER FUNCTIONS
-- -------------------------------------------------------------

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['profiles', 'clients', 'projects', 'storage_objects'])
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%s_updated_at ON %s;
      CREATE TRIGGER update_%s_updated_at
        BEFORE UPDATE ON %s
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    ', t, t, t, t);
  END LOOP;
END;
$$;

-- Function to log activity (call from API routes)
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_action TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO activity_log (user_id, action, entity_type, entity_id, metadata)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_metadata)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -------------------------------------------------------------
-- MIGRATION NOTES:
-- -------------------------------------------------------------
-- If you already have a user_profiles table, you'll need to either:
-- 1. Rename it to profiles and add missing columns
-- 2. Keep user_profiles and update the RLS policies accordingly
--
-- To check existing tables:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
--
-- To add missing columns to existing table:
-- ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
-- ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS whatsapp TEXT;
-- etc.
-- -------------------------------------------------------------
