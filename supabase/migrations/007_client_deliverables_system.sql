-- =============================================================
-- AJ247 Studios - Client Deliverables & Review System (Migration 007)
-- =============================================================
-- Adds: Deliverables, deliverable_assets junction, comments, notifications
-- Enables: Client review & approval workflow with Frame.io-style features
-- =============================================================

-- -------------------------------------------------------------
-- 1. DELIVERABLES TABLE (Client-facing packages of work)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Deliverable info
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  
  -- Status workflow: pending -> delivered -> approved/revision_requested
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'approved', 'revision_requested', 'archived')),
  
  -- Approval tracking
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  revision_requested_at TIMESTAMPTZ,
  revision_requested_by UUID REFERENCES auth.users(id),
  revision_reason TEXT,
  
  -- Delivery tracking
  delivered_at TIMESTAMPTZ,
  delivered_by UUID REFERENCES auth.users(id),
  
  -- Display
  sort_order INTEGER DEFAULT 0,
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliverables_project ON deliverables(project_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_status ON deliverables(status);
CREATE INDEX IF NOT EXISTS idx_deliverables_due_date ON deliverables(due_date);

ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;

-- Team can manage all deliverables
CREATE POLICY "Team can manage deliverables"
  ON deliverables FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team'))
  );

-- Clients can view deliverables for their projects
CREATE POLICY "Clients can view own project deliverables"
  ON deliverables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM client_users cu
      JOIN projects p ON p.client_id = cu.client_id
      WHERE cu.user_id = auth.uid()
      AND p.id = deliverables.project_id
    )
  );

-- Clients can update deliverable status (approve/request revision)
CREATE POLICY "Clients can update own deliverable status"
  ON deliverables FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM client_users cu
      JOIN projects p ON p.client_id = cu.client_id
      WHERE cu.user_id = auth.uid()
      AND p.id = deliverables.project_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_users cu
      JOIN projects p ON p.client_id = cu.client_id
      WHERE cu.user_id = auth.uid()
      AND p.id = deliverables.project_id
    )
  );

-- -------------------------------------------------------------
-- 2. DELIVERABLE_ASSETS (Many-to-many: assets in deliverables)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deliverable_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id UUID NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
  media_asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  
  -- Display settings
  sort_order INTEGER DEFAULT 0,
  custom_title TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(deliverable_id, media_asset_id)
);

CREATE INDEX IF NOT EXISTS idx_deliverable_assets_deliverable ON deliverable_assets(deliverable_id);
CREATE INDEX IF NOT EXISTS idx_deliverable_assets_asset ON deliverable_assets(media_asset_id);

ALTER TABLE deliverable_assets ENABLE ROW LEVEL SECURITY;

-- Team can manage deliverable assets
CREATE POLICY "Team can manage deliverable assets"
  ON deliverable_assets FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team'))
  );

-- Clients can view deliverable assets for their projects
CREATE POLICY "Clients can view own deliverable assets"
  ON deliverable_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deliverables d
      JOIN projects p ON p.id = d.project_id
      JOIN client_users cu ON cu.client_id = p.client_id
      WHERE cu.user_id = auth.uid()
      AND d.id = deliverable_assets.deliverable_id
    )
  );

-- -------------------------------------------------------------
-- 3. COMMENTS TABLE (Client feedback with timecode support)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Can be attached to deliverable or media asset
  deliverable_id UUID REFERENCES deliverables(id) ON DELETE CASCADE,
  media_asset_id UUID REFERENCES media_assets(id) ON DELETE CASCADE,
  
  -- Comment content
  user_id UUID NOT NULL REFERENCES auth.users(id),
  body TEXT NOT NULL,
  
  -- Video timecode (seconds) - Frame.io style
  timecode FLOAT,
  
  -- Image annotation coordinates (percentage 0-100)
  x_position FLOAT,
  y_position FLOAT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Thread support
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  -- Resolution status
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure at least one target
  CONSTRAINT comment_has_target CHECK (
    deliverable_id IS NOT NULL OR media_asset_id IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_comments_deliverable ON comments(deliverable_id);
CREATE INDEX IF NOT EXISTS idx_comments_asset ON comments(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Users can view comments on deliverables/assets they have access to
CREATE POLICY "Team can view all comments"
  ON comments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team'))
  );

CREATE POLICY "Clients can view comments on their deliverables"
  ON comments FOR SELECT
  USING (
    (deliverable_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM deliverables d
      JOIN projects p ON p.id = d.project_id
      JOIN client_users cu ON cu.client_id = p.client_id
      WHERE cu.user_id = auth.uid()
      AND d.id = comments.deliverable_id
    ))
    OR
    (media_asset_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM media_assets ma
      JOIN storage_objects so ON so.id = ma.storage_object_id
      JOIN projects p ON p.id = so.project_id
      JOIN client_users cu ON cu.client_id = p.client_id
      WHERE cu.user_id = auth.uid()
      AND ma.id = comments.media_asset_id
    ))
  );

-- Users can insert their own comments
CREATE POLICY "Users can insert own comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Team can manage all comments
CREATE POLICY "Team can manage comments"
  ON comments FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'team'))
  );

-- -------------------------------------------------------------
-- 4. NOTIFICATIONS TABLE (Event queue for emails/push)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Target user
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification details
  type TEXT NOT NULL CHECK (type IN (
    'deliverable_ready',
    'deliverable_approved',
    'deliverable_revision_requested',
    'comment_added',
    'comment_reply',
    'due_date_reminder',
    'project_status_changed',
    'invoice_sent',
    'payment_received'
  )),
  title TEXT NOT NULL,
  body TEXT,
  
  -- Link to entity
  entity_type TEXT,  -- 'deliverable', 'comment', 'project', 'invoice'
  entity_id UUID,
  
  -- Payload for additional data
  payload JSONB DEFAULT '{}',
  
  -- Delivery status
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update (mark read) their own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- System/team can insert notifications (service role bypasses RLS)
-- No INSERT policy needed - use service role for inserting notifications

-- -------------------------------------------------------------
-- 5. CLIENT-FACING STATUS MAPPING VIEW
-- -------------------------------------------------------------
-- Maps internal statuses to client-friendly labels
CREATE OR REPLACE VIEW client_deliverable_status AS
SELECT 
  d.id,
  d.project_id,
  d.title,
  d.description,
  d.due_date,
  d.status AS internal_status,
  CASE d.status
    WHEN 'pending' THEN 'In Progress'
    WHEN 'delivered' THEN 'Needs Review'
    WHEN 'approved' THEN 'Approved'
    WHEN 'revision_requested' THEN 'Changes Requested'
    WHEN 'archived' THEN 'Archived'
  END AS client_status,
  d.created_at,
  d.updated_at
FROM deliverables d;

-- -------------------------------------------------------------
-- 6. HELPER FUNCTIONS
-- -------------------------------------------------------------

-- Function to notify users when deliverable status changes
CREATE OR REPLACE FUNCTION notify_deliverable_change()
RETURNS TRIGGER AS $$
DECLARE
  v_project_client_id UUID;
  v_client_user RECORD;
  v_notification_type TEXT;
  v_title TEXT;
BEGIN
  -- Get the client_id for this project
  SELECT client_id INTO v_project_client_id
  FROM projects WHERE id = NEW.project_id;
  
  -- Determine notification type based on status change
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    v_notification_type := 'deliverable_ready';
    v_title := 'New deliverable ready for review: ' || NEW.title;
  ELSIF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    v_notification_type := 'deliverable_approved';
    v_title := 'Deliverable approved: ' || NEW.title;
  ELSIF NEW.status = 'revision_requested' AND OLD.status != 'revision_requested' THEN
    v_notification_type := 'deliverable_revision_requested';
    v_title := 'Revision requested: ' || NEW.title;
  ELSE
    RETURN NEW;
  END IF;
  
  -- Create notifications for all client users
  FOR v_client_user IN 
    SELECT user_id FROM client_users WHERE client_id = v_project_client_id
  LOOP
    INSERT INTO notifications (user_id, type, title, entity_type, entity_id, payload)
    VALUES (
      v_client_user.user_id,
      v_notification_type,
      v_title,
      'deliverable',
      NEW.id,
      jsonb_build_object('project_id', NEW.project_id, 'deliverable_title', NEW.title)
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for deliverable notifications
DROP TRIGGER IF EXISTS on_deliverable_status_change ON deliverables;
CREATE TRIGGER on_deliverable_status_change
  AFTER INSERT OR UPDATE OF status ON deliverables
  FOR EACH ROW
  EXECUTE FUNCTION notify_deliverable_change();

-- Function to notify on new comments
CREATE OR REPLACE FUNCTION notify_new_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_deliverable RECORD;
  v_project_client_id UUID;
  v_user RECORD;
BEGIN
  -- Get deliverable and project info
  IF NEW.deliverable_id IS NOT NULL THEN
    SELECT d.*, p.client_id INTO v_deliverable
    FROM deliverables d
    JOIN projects p ON p.id = d.project_id
    WHERE d.id = NEW.deliverable_id;
    
    -- Notify all relevant users (except the comment author)
    FOR v_user IN 
      SELECT DISTINCT user_id 
      FROM (
        -- Client users for this project
        SELECT cu.user_id FROM client_users cu WHERE cu.client_id = v_deliverable.client_id
        UNION
        -- Team members
        SELECT pt.user_id FROM project_team pt WHERE pt.project_id = v_deliverable.project_id
      ) all_users
      WHERE user_id != NEW.user_id
    LOOP
      INSERT INTO notifications (user_id, type, title, entity_type, entity_id, payload)
      VALUES (
        v_user.user_id,
        CASE WHEN NEW.parent_id IS NOT NULL THEN 'comment_reply' ELSE 'comment_added' END,
        'New comment on: ' || v_deliverable.title,
        'comment',
        NEW.id,
        jsonb_build_object(
          'deliverable_id', NEW.deliverable_id,
          'comment_body', LEFT(NEW.body, 100)
        )
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for comment notifications
DROP TRIGGER IF EXISTS on_new_comment ON comments;
CREATE TRIGGER on_new_comment
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_comment();

-- Apply updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_deliverables_updated_at ON deliverables;
CREATE TRIGGER update_deliverables_updated_at
  BEFORE UPDATE ON deliverables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------------
-- 7. ADD project_id TO media_assets (if not present)
-- -------------------------------------------------------------
-- This helps link media directly to projects for client access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'media_assets' AND column_name = 'project_id'
  ) THEN
    ALTER TABLE media_assets ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_media_assets_project ON media_assets(project_id);
  END IF;
END;
$$;

-- RLS policy for clients to view their project's media assets
DROP POLICY IF EXISTS "Clients can view own project media" ON media_assets;
CREATE POLICY "Clients can view own project media"
  ON media_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN client_users cu ON cu.client_id = p.client_id
      WHERE cu.user_id = auth.uid()
      AND p.id = media_assets.project_id
    )
  );

-- -------------------------------------------------------------
-- MIGRATION NOTES:
-- -------------------------------------------------------------
-- This migration creates the client deliverables review system:
-- 1. deliverables - packages of work for client review
-- 2. deliverable_assets - links media assets to deliverables
-- 3. comments - client feedback with video timecode support
-- 4. notifications - event queue for emails/push notifications
--
-- Key features:
-- - Frame.io-style timecode comments for videos
-- - Automatic notifications on status changes
-- - RLS enforced client access to only their projects
-- - Approval workflow: delivered -> approved/revision_requested
-- -------------------------------------------------------------
