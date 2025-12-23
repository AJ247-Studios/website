-- =============================================================
-- AJ247 Studios - Add Thumbnail Path (Migration 005)
-- =============================================================
-- Adds thumbnail_path column to media_assets for storing
-- pre-generated thumbnail paths
-- =============================================================

-- Add thumbnail_path column
ALTER TABLE public.media_assets
  ADD COLUMN IF NOT EXISTS thumbnail_path TEXT;

-- Add index for faster lookups when querying with thumbnails
CREATE INDEX IF NOT EXISTS idx_media_assets_thumbnail 
  ON media_assets(thumbnail_path) 
  WHERE thumbnail_path IS NOT NULL;

-- Optional: Add thumbnail_status for tracking generation
ALTER TABLE public.media_assets
  ADD COLUMN IF NOT EXISTS thumbnail_status TEXT 
  DEFAULT 'pending' 
  CHECK (thumbnail_status IN ('pending', 'processing', 'ready', 'failed', 'skipped'));

COMMENT ON COLUMN media_assets.thumbnail_path IS 'Path to generated thumbnail in storage bucket';
COMMENT ON COLUMN media_assets.thumbnail_status IS 'Status of thumbnail generation: pending, processing, ready, failed, skipped';
