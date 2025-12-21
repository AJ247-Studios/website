-- =============================================================
-- AJ247 Studios - Supabase Storage Migration (Migration 003)
-- =============================================================
-- Migrates from CloudFlare R2 to Supabase Storage
-- Adds direct storage_path support to media_assets
-- =============================================================

-- -------------------------------------------------------------
-- 1. ADD SUPABASE STORAGE COLUMNS TO media_assets
-- -------------------------------------------------------------

-- Add storage_path column for direct Supabase Storage references
ALTER TABLE media_assets 
  ADD COLUMN IF NOT EXISTS storage_path TEXT,
  ADD COLUMN IF NOT EXISTS filename TEXT,
  ADD COLUMN IF NOT EXISTS file_size BIGINT,
  ADD COLUMN IF NOT EXISTS mime_type TEXT,
  ADD COLUMN IF NOT EXISTS asset_type TEXT DEFAULT 'deliverable' 
    CHECK (asset_type IN ('raw', 'deliverable', 'avatar', 'portfolio', 'wip')),
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

-- Create index on storage_path for faster lookups
CREATE INDEX IF NOT EXISTS idx_media_assets_storage_path ON media_assets(storage_path);
CREATE INDEX IF NOT EXISTS idx_media_assets_project ON media_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_asset_type ON media_assets(asset_type);

-- Make storage_object_id optional (for backward compatibility with R2 data)
-- New uploads will use storage_path instead
ALTER TABLE media_assets 
  ALTER COLUMN storage_object_id DROP NOT NULL;

-- -------------------------------------------------------------
-- 2. ADD storage_path TO project_media (for portal uploads)
-- -------------------------------------------------------------

ALTER TABLE project_media
  ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- -------------------------------------------------------------
-- 3. UPDATE RLS POLICIES FOR media_assets
-- -------------------------------------------------------------

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Team can view all media assets" ON media_assets;
DROP POLICY IF EXISTS "Team can manage media assets" ON media_assets;
DROP POLICY IF EXISTS "Users can view own uploads" ON media_assets;
DROP POLICY IF EXISTS "Project members can view project media" ON media_assets;

-- Team/Admin can view all media assets
CREATE POLICY "Team can view all media assets"
  ON media_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'team')
    )
  );

-- Team/Admin can manage all media assets
CREATE POLICY "Team can manage media assets"
  ON media_assets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'team')
    )
  );

-- Users can view their own uploads
CREATE POLICY "Users can view own uploads"
  ON media_assets FOR SELECT
  USING (uploaded_by = auth.uid());

-- Users can insert their own uploads
CREATE POLICY "Users can insert own uploads"
  ON media_assets FOR INSERT
  WITH CHECK (uploaded_by = auth.uid());

-- Project members can view project media
CREATE POLICY "Project members can view project media"
  ON media_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_id = media_assets.project_id 
        AND user_id = auth.uid()
    )
  );

-- -------------------------------------------------------------
-- 4. STORAGE BUCKET RLS (run in Supabase Dashboard SQL Editor)
-- -------------------------------------------------------------
-- Note: These policies need to be applied to the 'media' storage bucket
-- via the Supabase Dashboard or using supabase.storage RLS

/*
-- For reference, here are the storage policies to set up:

-- Allow authenticated users to upload to their designated paths
CREATE POLICY "Users can upload to project paths"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND (
    -- Users can upload to projects they're members of
    (storage.foldername(name))[1] = 'projects' AND
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_id = (storage.foldername(name))[2]::uuid 
        AND user_id = auth.uid()
    )
  ) OR (
    -- Users can upload their own avatars
    (storage.foldername(name))[1] = 'avatars' AND
    (storage.foldername(name))[2] = auth.uid()::text
  )
);

-- Team/Admin can upload anywhere
CREATE POLICY "Team can upload anywhere"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'team')
  )
);

-- Allow authenticated users to read files they have access to
CREATE POLICY "Users can read accessible files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'media' AND (
    -- Team can read all
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'team')
    ) OR
    -- Project members can read project files
    (
      (storage.foldername(name))[1] = 'projects' AND
      EXISTS (
        SELECT 1 FROM project_members 
        WHERE project_id = (storage.foldername(name))[2]::uuid 
          AND user_id = auth.uid()
      )
    ) OR
    -- Users can read their own avatars
    (
      (storage.foldername(name))[1] = 'avatars' AND
      (storage.foldername(name))[2] = auth.uid()::text
    )
  )
);

-- Team/Admin can delete files
CREATE POLICY "Team can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'team')
  )
);
*/

-- -------------------------------------------------------------
-- 5. HELPER FUNCTION: Get signed URL for storage path
-- -------------------------------------------------------------

-- Note: Signed URL generation should be done via Supabase client SDK
-- supabase.storage.from('media').createSignedUrl(path, expiresIn)

-- -------------------------------------------------------------
-- 6. UPDATE FUNCTION: Auto-update updated_at timestamp
-- -------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to media_assets if not exists
DROP TRIGGER IF EXISTS update_media_assets_updated_at ON media_assets;
CREATE TRIGGER update_media_assets_updated_at
  BEFORE UPDATE ON media_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
