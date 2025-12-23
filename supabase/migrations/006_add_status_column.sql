-- Migration: Add status column to media_assets
-- This column tracks the workflow state of each asset
-- Date: 2024-12-23

-- Add a status column with allowed values used across UI and code.
-- Union of studio workflow (raw/in_progress/deliverable) and 
-- ingest pipeline (uploaded/processing/ready/failed/skipped)
ALTER TABLE public.media_assets
  ADD COLUMN IF NOT EXISTS status text
    DEFAULT 'uploaded'
    CHECK (status IN (
      'raw', 'in_progress', 'deliverable',
      'uploaded', 'processing', 'ready', 'failed', 'skipped'
    ));

-- Index for fast filtering by status
CREATE INDEX IF NOT EXISTS idx_media_assets_status
  ON public.media_assets(status);

-- Backfill existing rows:
-- Assets with thumbnails are ready
UPDATE public.media_assets
SET status = 'ready'
WHERE thumbnail_path IS NOT NULL
  AND (status IS NULL OR status = 'uploaded');

-- Assets without thumbnails stay as uploaded
UPDATE public.media_assets
SET status = 'uploaded'
WHERE thumbnail_path IS NULL
  AND status IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.media_assets.status IS 
  'Workflow status: raw, in_progress, deliverable (studio), uploaded, processing, ready, failed, skipped (pipeline)';
