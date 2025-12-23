# Client Portal - Deliverables & Review System

This document describes the client-facing deliverables review system implemented for AJ247 Studios.

## Overview

The client portal allows clients to:
- View all their projects and deliverables
- Preview images and videos with signed URLs
- Approve deliverables or request changes
- Leave timestamped comments on videos (Frame.io style)
- Receive notifications when deliverables are ready

## Architecture

### Database Tables (Migration 007)

| Table | Purpose |
|-------|---------|
| `deliverables` | Packages of work for client review |
| `deliverable_assets` | Junction linking media assets to deliverables |
| `comments` | Client/team feedback with video timecode support |
| `notifications` | Event queue for in-app/email notifications |

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/client/projects/[projectId]` | GET | Get project with deliverables, comments, activity |
| `/api/client/deliverables/[id]/approve` | POST | Approve a deliverable |
| `/api/client/deliverables/[id]/request-change` | POST | Request changes with reason |
| `/api/client/deliverables/[id]/comments` | GET/POST | Get or add comments |
| `/api/client/notifications` | GET/PATCH | Get notifications / mark as read |

### Client Pages

| Route | Description |
|-------|-------------|
| `/client` | Projects list dashboard |
| `/client/projects/[projectId]` | Project detail with deliverables |

### Components

- `ClientProjectView` - Main project page with filters and grid
- `DeliverableDetailModal` - Lightbox with preview, comments, actions
- `NotificationBell` - Header notification dropdown

## Key Features

### 1. Secure Asset URLs
All media assets use server-side signed URLs:
- Thumbnails: 1 hour expiry
- Previews: 1 hour expiry  
- Downloads: 30 minute expiry

Clients never have direct bucket access.

### 2. Approval Workflow
```
pending → delivered → approved
                   ↘ revision_requested → pending (cycle)
```

### 3. Video Timecode Comments
- Comments can include `timecode` (seconds)
- Click on timecode to seek video
- Shows current position when adding comments

### 4. Automatic Notifications
Database triggers create notifications for:
- Deliverable ready for review
- Deliverable approved
- Revision requested
- New comments

## Running the Migration

```bash
cd website
npx supabase db push
```

Or run the SQL directly in Supabase Dashboard > SQL Editor:
```sql
-- Copy contents of supabase/migrations/007_client_deliverables_system.sql
```

## Testing the Client Flow

### 1. Create Test Data

```sql
-- Insert a test deliverable
INSERT INTO deliverables (project_id, title, status, delivered_at, delivered_by)
SELECT 
  id as project_id,
  'Test Video Deliverable' as title,
  'delivered' as status,
  NOW() as delivered_at,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1) as delivered_by
FROM projects 
LIMIT 1;
```

### 2. Test as Client

1. Log in as a client user
2. Navigate to `/client`
3. Click on a project
4. View deliverables, filter by status
5. Click "Review" on a deliverable with status "Needs Review"
6. Test approve/request-change workflow
7. Add comments (with timecode for videos)

### 3. Verify Notifications

```sql
-- Check notifications were created
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;
```

## Client-Facing Status Labels

| Internal Status | Client Label |
|-----------------|--------------|
| `pending` | In Progress |
| `delivered` | Needs Review |
| `approved` | Approved |
| `revision_requested` | Changes Requested |
| `archived` | Archived |

## Security

### RLS Policies
- Clients can only view/update deliverables for their projects
- Clients can only view notifications addressed to them
- Team/admin roles have full access
- Comments are scoped to deliverable access

### Signed URLs
```typescript
// Server-side only
import { getSignedUrl } from '@/utils/getClientPreviewUrl';

const url = await getSignedUrl(storagePath, 3600); // 1 hour
```

## File Structure

```
app/
  client/
    page.tsx                          # Projects list
    projects/
      [projectId]/
        page.tsx                      # Project detail entry
        ClientProjectView.tsx         # Main view component
        DeliverableDetailModal.tsx    # Lightbox modal
        types.ts                      # Type definitions

  api/
    client/
      projects/[projectId]/route.ts   # Project API
      deliverables/[id]/
        approve/route.ts              # Approve endpoint
        request-change/route.ts       # Request change endpoint
        comments/route.ts             # Comments endpoint
      notifications/route.ts          # Notifications API

components/
  portal/
    NotificationBell.tsx              # Notification dropdown

utils/
  getClientPreviewUrl.ts              # Signed URL helper

supabase/
  migrations/
    007_client_deliverables_system.sql  # New tables & RLS
```

## Future Enhancements

1. **Email notifications** - Send emails via Resend/SendGrid
2. **Frame-accurate comments** - Sub-second video timecodes
3. **Version comparison** - Side-by-side before/after
4. **Batch approval** - Approve multiple deliverables at once
5. **Download tracking** - Log and limit downloads
6. **Expiry reminders** - Notify before download links expire
