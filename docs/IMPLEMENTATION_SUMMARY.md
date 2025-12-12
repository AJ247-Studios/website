# AJ247 Studios - Auth & Storage Implementation

This document summarizes the key changes made to implement persistent authentication and secure file storage.

## 🔐 Auth Persistence (Priority #1 - DONE)

### Problem Solved
Users were being logged out on page refresh because the client-side state wasn't being properly rehydrated from browser storage.

### Solution (`components/SupabaseProvider.tsx`)

1. **On Mount**: Call `supabase.auth.getSession()` to recover session from localStorage
2. **Subscribe**: Listen to `onAuthStateChange` for login/logout/refresh events
3. **Server Hydration**: Accept `initialSession` from SSR but also try client-side recovery

```tsx
// Key changes:
// 1. Added getSession() call on mount when no initialSession
// 2. Handle all auth events: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED
// 3. Added isLoading state based on whether we have initialSession
// 4. Added user state for easier access
```

### Test Auth Persistence
1. Log in to the site
2. Hard refresh the page (Ctrl+F5)
3. Open new tab, navigate to site
4. Close browser, reopen
5. ✅ User should stay logged in in all scenarios

---

## 💾 Database Schema (Priority #2 - DONE)

### New Tables (`supabase/migrations/001_core_schema.sql`)

| Table | Purpose |
|-------|---------|
| `profiles` | Extended user info (role, phone, avatar) |
| `clients` | Business/company clients |
| `client_users` | Links auth users to clients |
| `projects` | Project tracking with status |
| `project_team` | Team member assignments |
| `storage_objects` | R2 file metadata (path, access, type) |
| `upload_tokens` | Presigned URL tracking |
| `transcode_jobs` | Video processing queue |
| `activity_log` | Audit trail |

### Run Migration
```bash
# Via Supabase CLI
supabase db push

# Or manually in SQL Editor
# Copy contents of supabase/migrations/001_core_schema.sql
```

---

## ☁️ R2 Storage with Presigned URLs (Priority #3 - DONE)

### Why Presigned URLs?
- Client uploads directly to R2 (no server bottleneck)
- R2 credentials never exposed to browser
- Short-lived URLs (15 min) limit abuse
- Verified by server before creating DB record

### Upload Flow

```
Client                    Server                     R2
  |                         |                         |
  |-- POST /api/upload/request ---------------------->|
  |<- {presignedUrl, token} -------------------------|
  |                         |                         |
  |-- PUT file ---------------------------------------->|
  |<- 200 OK ------------------------------------------|
  |                         |                         |
  |-- POST /api/upload/complete -------------------->|
  |         (verify via HEAD request)----------------->|
  |<- {id, url, ...} ----------------------------------|
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/upload/request` | POST | Get presigned PUT URL |
| `/api/upload/complete` | POST | Verify upload, create record |
| `/api/download/[objectId]` | GET | Get presigned GET URL |

### Folder Structure in R2

```
/public/
  website-assets/          # Static site images
  portfolio/{projectId}/   # Public portfolio

/profiles/{userId}/        # User avatars

/clients/{clientId}/{projectId}/
  deliverables/            # Client-visible finals
  raw/                     # Private raw footage

/team/{userId}/            # Team WIP files

/transcodes/{projectId}/   # Video transcodes

/backups/{date}/          # Daily backups
```

---

## 🎨 New Components

### `PresignedUploadForm`
Full-featured upload form with:
- Drag & drop support
- Progress tracking
- Multi-file upload
- File type selection (raw, deliverable, portfolio, etc.)
- Role-based file type restrictions

### `AdminFileBrowser`
Admin panel for file management:
- Search and filter files
- Sort by date, name, size
- Bulk selection/delete
- Download with presigned URLs
- Access level badges

### `useUpload` Hook
Reusable upload logic:
```tsx
const { upload, isUploading, progress, error } = useUpload();

await upload(file, {
  fileType: 'deliverable',
  projectId: '...',
});
```

---

## ⚙️ Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# R2 Storage
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=aj247-storage
R2_ENDPOINT=https://ACCOUNT_ID.r2.cloudflarestorage.com
R2_PUBLIC_DOMAIN=https://pub-xxx.r2.dev
```

---

## 🔧 R2 CORS Configuration

**CRITICAL**: Must configure CORS on your R2 bucket for browser uploads to work.

See `docs/R2_CONFIGURATION.md` for detailed instructions.

Quick version - add this CORS policy:
```json
[
  {
    "AllowedOrigins": ["https://aj247studios.com", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["Content-Type", "Content-Length"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

---

## ✅ Testing Checklist

### Auth Persistence
- [ ] Login, hard refresh → still logged in
- [ ] Login, new tab → still logged in
- [ ] Login, close browser, reopen → still logged in
- [ ] Logout → session cleared everywhere

### Upload Flow
- [ ] Admin can upload raw/deliverable files
- [ ] Team can upload raw/deliverable files  
- [ ] Client cannot upload raw files (403)
- [ ] Upload progress shows correctly
- [ ] File appears in FileBrowser after upload
- [ ] storage_objects record created in DB

### Download Flow
- [ ] Admin can download any file
- [ ] Team can download any file
- [ ] Client can only download their project deliverables
- [ ] Unauthenticated users can only access public files

---

## 🚀 Priority Sprint Checklist

1. ✅ Auth persistence bugfix
2. ✅ Supabase DB schema
3. ✅ Presigned upload endpoint
4. ✅ Upload-complete endpoint
5. ✅ Client upload flow
6. ✅ Admin file browser
7. ⏳ R2 CORS configuration (requires Cloudflare setup)
8. ⏳ Transcode job queue
9. ⏳ Daily backups
10. ⏳ Storage metrics UI

---

## 📁 Files Changed/Added

### New Files
- `supabase/migrations/001_core_schema.sql` - Database schema
- `app/api/upload/request/route.ts` - Presigned URL generator
- `app/api/upload/complete/route.ts` - Upload verification
- `app/api/download/[objectId]/route.ts` - Secure downloads
- `hooks/useUpload.ts` - Upload hook
- `components/PresignedUploadForm.tsx` - Upload UI
- `components/admin/FileBrowser.tsx` - File management UI
- `docs/R2_CONFIGURATION.md` - R2 setup guide

### Modified Files
- `components/SupabaseProvider.tsx` - Auth persistence fix
- `lib/r2.ts` - Added presigned URL functions
- `lib/types/r2.ts` - New TypeScript types
- `app/admin/upload/page.tsx` - Uses new upload system
- `components/admin/index.ts` - Export FileBrowser
- `package.json` - Added @aws-sdk/s3-request-presigner
