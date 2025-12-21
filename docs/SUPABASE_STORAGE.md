# Supabase Storage Upload Flow

This document describes the new Supabase Storage-first upload flow for the AJ247 Studios website.

## Overview

We've migrated from CloudFlare R2 to Supabase Storage for simpler, more maintainable file uploads. All files are stored in a private bucket (`media`) and accessed via signed URLs.

## Frontend Flow (MVP)

### 1. Create Project

```typescript
import { useSupabase } from "@/components/SupabaseProvider";

const { supabase } = useSupabase();

const { data: project, error } = await supabase
  .from('projects')
  .insert({
    title: "New Project",
    description: "Project description",
    client_id: clientId,
  })
  .select()
  .single();
```

### 2. Add Project Members

```typescript
await supabase
  .from('project_members')
  .insert([
    { project_id: project.id, user_id: clientId, role: 'client' },
    { project_id: project.id, user_id: teamId, role: 'team' },
  ]);
```

### 3. Upload File to Supabase Storage

Using the `useUpload` hook:

```typescript
import { useUpload } from "@/hooks/useUpload";

const { upload, isUploading, progress, error } = useUpload();

const handleUpload = async (file: File, projectId: string) => {
  const result = await upload(file, {
    fileType: 'deliverable',
    projectId,
  });
  
  console.log('Uploaded:', result.storagePath);
};
```

Or directly with Supabase client:

```typescript
const storagePath = `projects/${projectId}/${Date.now()}_${file.name}`;

const { data, error } = await supabase.storage
  .from('media')
  .upload(storagePath, file);
```

### 4. Save Metadata to media_assets

The `useUpload` hook handles this automatically. If uploading manually:

```typescript
await supabase
  .from('media_assets')
  .insert({
    project_id: projectId,
    uploaded_by: user.id,
    storage_path: storagePath,
    asset_type: 'deliverable',
    filename: file.name,
    file_size: file.size,
    mime_type: file.type,
    status: 'uploaded',
  });
```

### 5. Fetch Files with Signed URLs

Using the `useSignedUrl` hook:

```typescript
import { useSignedUrl } from "@/hooks/useSignedUrl";

const { getSignedUrl } = useSignedUrl();

const handleView = async (storagePath: string) => {
  const result = await getSignedUrl(storagePath, 3600); // 1 hour expiry
  if (result) {
    window.open(result.url, '_blank');
  }
};
```

Or directly with Supabase client:

```typescript
const { data } = await supabase.storage
  .from('media')
  .createSignedUrl(storagePath, 60 * 60); // 1 hour

console.log(data.signedUrl);
```

## Storage Bucket Setup

Configure this in Supabase Dashboard:

1. Go to Storage → Create Bucket
2. **Bucket name**: `media`
3. **Public bucket**: ❌ OFF
4. **File size limit**: 50MB (or higher as needed)

## Storage Paths Convention

| Asset Type | Path Pattern |
|------------|--------------|
| Project files | `projects/{projectId}/{filename}` |
| Deliverables | `projects/{projectId}/deliverables/{filename}` |
| Raw files | `projects/{projectId}/raw/{filename}` |
| Work in progress | `projects/{projectId}/wip/{filename}` |
| Avatars | `avatars/{userId}/{filename}` |
| Portfolio | `portfolio/{filename}` |

## Key Files

- [lib/supabase-storage.ts](lib/supabase-storage.ts) - Storage utility functions
- [hooks/useUpload.ts](hooks/useUpload.ts) - Upload hook
- [hooks/useSignedUrl.ts](hooks/useSignedUrl.ts) - Signed URL hook
- [lib/types/storage.ts](lib/types/storage.ts) - TypeScript types
- [supabase/migrations/003_supabase_storage.sql](supabase/migrations/003_supabase_storage.sql) - Database migration

## Database Schema Updates

The migration adds these columns to `media_assets`:

- `storage_path` - Direct path in Supabase Storage
- `filename` - Original filename
- `file_size` - File size in bytes
- `mime_type` - MIME type
- `asset_type` - Type: raw, deliverable, avatar, portfolio, wip
- `project_id` - Associated project

## RLS Policies (Storage)

Configure these in Supabase Dashboard → Storage → Policies:

**For uploads:**
- Team/Admin can upload anywhere
- Users can upload to projects they're members of
- Users can upload their own avatars

**For downloads:**
- Team/Admin can read all files
- Project members can read project files
- Users can read their own avatars

## Migration from R2

Existing R2 files remain accessible through:
1. The `storage_objects` table (legacy)
2. R2 API routes (deprecated but functional)

New uploads use Supabase Storage exclusively via:
1. The `media_assets` table with `storage_path`
2. Direct Supabase Storage SDK calls

## No Backend API Required for MVP

The entire upload flow works client-side:
- Supabase handles auth via RLS
- Storage policies control access
- Signed URLs provide secure downloads

This eliminates the need for:
- `/api/upload/request` (presigned URL generation)
- `/api/upload/complete` (upload confirmation)
- Complex backend validation
