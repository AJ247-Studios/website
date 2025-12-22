-- =============================================================
-- AJ247 Studios - Media Assets Fix (Migration 004)
-- =============================================================
-- Fixes:
-- 1. UUID auto-generation for id column
-- 2. Complete RLS policies for uploads to work
-- =============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------
-- 1. FIX id COLUMN - Add UUID default
-- -------------------------------------------------------------

ALTER TABLE media_assets
ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- -------------------------------------------------------------
-- 2. DROP ALL EXISTING POLICIES (clean slate)
-- -------------------------------------------------------------

DROP POLICY IF EXISTS "Team can view all media assets" ON media_assets;
DROP POLICY IF EXISTS "Team can manage media assets" ON media_assets;
DROP POLICY IF EXISTS "Users can view own uploads" ON media_assets;
DROP POLICY IF EXISTS "Users can insert own uploads" ON media_assets;
DROP POLICY IF EXISTS "Project members can view project media" ON media_assets;
DROP POLICY IF EXISTS "Authenticated users can insert" ON media_assets;
DROP POLICY IF EXISTS "Service role bypass" ON media_assets;

-- -------------------------------------------------------------
-- 3. ENABLE RLS (if not already)
-- -------------------------------------------------------------

ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------
-- 4. CREATE COMPREHENSIVE RLS POLICIES
-- -------------------------------------------------------------

-- Policy 1: Admins and team can do everything
CREATE POLICY "Admin and team full access"
  ON media_assets
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'team')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'team')
    )
  );

-- Policy 2: Any authenticated user can INSERT their own uploads
CREATE POLICY "Authenticated users can insert own uploads"
  ON media_assets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid() OR uploaded_by IS NULL
  );

-- Policy 3: Users can view their own uploads
CREATE POLICY "Users can view own uploads"
  ON media_assets
  FOR SELECT
  TO authenticated
  USING (uploaded_by = auth.uid());

-- Policy 4: Users can update their own uploads
CREATE POLICY "Users can update own uploads"
  ON media_assets
  FOR UPDATE
  TO authenticated
  USING (uploaded_by = auth.uid())
  WITH CHECK (uploaded_by = auth.uid());

-- Policy 5: Users can delete their own uploads
CREATE POLICY "Users can delete own uploads"
  ON media_assets
  FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- Policy 6: Project members can view project media
CREATE POLICY "Project members can view project media"
  ON media_assets
  FOR SELECT
  TO authenticated
  USING (
    project_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_members.project_id = media_assets.project_id 
        AND project_members.user_id = auth.uid()
    )
  );

-- Policy 7: Project members can insert media to their projects
CREATE POLICY "Project members can insert project media"
  ON media_assets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IS NULL OR
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_members.project_id = media_assets.project_id 
        AND project_members.user_id = auth.uid()
    )
  );

-- Policy 8: Public assets are viewable by everyone
CREATE POLICY "Public assets are viewable"
  ON media_assets
  FOR SELECT
  USING (visibility = 'public');

-- -------------------------------------------------------------
-- 5. GRANT PERMISSIONS
-- -------------------------------------------------------------

GRANT SELECT, INSERT, UPDATE, DELETE ON media_assets TO authenticated;
GRANT SELECT ON media_assets TO anon;

-- -------------------------------------------------------------
-- VERIFICATION QUERY (run after applying migration)
-- -------------------------------------------------------------
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies WHERE tablename = 'media_assets';
