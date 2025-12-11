# Cloudflare R2 Integration Guide

This guide covers the complete setup and implementation of Cloudflare R2 for file uploads in the AJ247 Studios website.

## 📋 Overview

File uploads flow:
1. User uploads file via frontend form
2. Server receives file via API route
3. Server uploads to Cloudflare R2 (S3-compatible storage)
4. Server stores metadata in Supabase `files` table
5. Returns URL to client

## ✅ Prerequisites Checklist

- [ ] Cloudflare account with R2 enabled
- [ ] R2 bucket created (e.g., `aj247-media`)
- [ ] R2 Access Keys generated (Access Key ID + Secret)
- [ ] Account ID and R2 endpoint noted
- [ ] Supabase project with database access
- [ ] `files` table created in Supabase

## 🚀 Step 1: Cloudflare Dashboard Setup

### Create R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2 Object Storage**
2. Click **Create bucket**
3. Enter bucket name: `aj247-media` (lowercase, simple)
4. Click **Create**

### Generate Access Keys

1. In R2 dashboard, go to **Manage R2 API Tokens**
2. Click **Create API Token** or use **R2 Access Keys**
3. Copy:
   - Access Key ID
   - Secret Access Key
   - Account ID
   - Endpoint: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`

### Optional: Configure CORS (for direct browser uploads)

Only needed if you want browsers to upload directly to R2:

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

## 🗄️ Step 2: Supabase Setup

### Create Files Table

Run the SQL migration in `supabase/migrations/create_files_table.sql`:

```bash
# Copy the SQL content and run in Supabase SQL Editor
# Or use Supabase CLI:
supabase db push
```

The migration creates:
- `files` table with proper schema
- Row Level Security (RLS) policies
- Indexes for performance
- Auto-update triggers

### Get Supabase Credentials

From Supabase Dashboard → Settings → API:
- Project URL
- Anon/Public Key (for client-side)
- Service Role Key (for server-side - keep secret!)

## 🔐 Step 3: Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your credentials:
   ```env
   # Cloudflare R2
   R2_ACCOUNT_ID=your_account_id_here
   R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
   R2_ACCESS_KEY_ID=your_access_key_id
   R2_SECRET_ACCESS_KEY=your_secret_key
   R2_BUCKET=aj247-media
   
   # Optional: Custom domain
   R2_PUBLIC_DOMAIN=https://cdn.aj247studios.com
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. For Vercel deployment:
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all variables above
   - Redeploy after adding

## 📦 Step 4: Install Dependencies

Already installed:
```bash
npm install @aws-sdk/client-s3 formidable @types/formidable
```

## 🏗️ Architecture

### Files Created/Modified

1. **`lib/r2.ts`** - R2 client and utility functions
   - `uploadToR2()` - Upload file to R2
   - `deleteFromR2()` - Delete file from R2
   - `generateFileKey()` - Generate unique file keys
   - `extractKeyFromUrl()` - Extract key from URL

2. **`app/api/upload/route.ts`** - Main upload endpoint
   - Handles file uploads from frontend
   - Uploads to R2
   - Stores metadata in Supabase

3. **`app/api/portal/[projectId]/upload/route.ts`** - Project portal uploads
   - Project-specific uploads
   - Organizes files by project ID
   - Team/admin authentication

4. **`supabase/migrations/create_files_table.sql`** - Database schema
   - Files table structure
   - RLS policies
   - Indexes and triggers

5. **`.env.local.example`** - Environment template

## 🔧 Usage

### Frontend Upload Example

The existing `UploadForm` component already works! Just ensure you pass `user_id` if available:

```tsx
const formData = new FormData();
formData.append("file", file);
formData.append("title", title);
formData.append("description", description);
formData.append("youtube_id", youtubeId);
formData.append("user_id", userId); // Add this

const response = await fetch("/api/upload", {
  method: "POST",
  body: formData,
});

const data = await response.json();
console.log(data.file); // File metadata
console.log(data.media); // Media record
```

### Programmatic Upload

```typescript
import { uploadToR2, generateFileKey } from '@/lib/r2';

const buffer = Buffer.from(await file.arrayBuffer());
const key = generateFileKey(file.name, 'custom-folder');
const url = await uploadToR2(buffer, key, file.type);
```

### Delete File

```typescript
import { deleteFromR2, extractKeyFromUrl } from '@/lib/r2';

const key = extractKeyFromUrl(fileUrl);
if (key) {
  await deleteFromR2(key);
}
```

## 🧪 Testing

1. **Test upload endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/upload \
     -F "file=@test-image.jpg" \
     -F "title=Test Upload" \
     -F "user_id=YOUR_USER_ID"
   ```

2. **Check Supabase:**
   - Open Supabase Table Editor
   - View `files` table
   - Verify record was created

3. **Check R2:**
   - Open Cloudflare Dashboard → R2
   - Browse `aj247-media` bucket
   - Confirm file exists

## 🔒 Security Best Practices

### Server-Side Only
✅ **DO:** Keep R2 credentials on server
❌ **DON'T:** Expose keys in client-side code

### Row Level Security
The `files` table has RLS enabled:
- Users can only access their own files
- Admins can view all files
- Proper user authentication required

### File Validation
Consider adding:
```typescript
// Validate file size
if (file.size > 100 * 1024 * 1024) { // 100MB
  throw new Error('File too large');
}

// Validate file type
const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];
if (!allowedTypes.includes(file.type)) {
  throw new Error('Invalid file type');
}
```

### Content Security
For sensitive files:
1. Set bucket to private
2. Generate presigned URLs:
   ```typescript
   import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
   import { GetObjectCommand } from "@aws-sdk/client-s3";
   
   const command = new GetObjectCommand({
     Bucket: process.env.R2_BUCKET,
     Key: key,
   });
   
   const url = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
   ```

## 📊 Monitoring & Costs

### Cloudflare R2 Pricing
- **Storage:** $0.015 per GB/month
- **Class A Operations:** 1M free/month, then $4.50/million
- **Class B Operations:** 10M free/month, then $0.36/million
- **Egress:** FREE (major advantage over S3)

### Monitor Usage
1. Cloudflare Dashboard → R2 → Metrics
2. Track:
   - Storage size
   - Operations count
   - Request patterns

### Optimize Costs
- Use folders to organize files
- Implement lifecycle rules for old files
- Cache with Cloudflare CDN
- Batch operations when possible

## 🐛 Troubleshooting

### Error: "Unauthorized" when uploading to R2
**Cause:** Invalid credentials
**Fix:** 
1. Verify `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`
2. Check Account ID in `R2_ENDPOINT`
3. Ensure API token has R2 permissions

### Error: "403 Forbidden" on public URL
**Cause:** Bucket/object not public
**Fix:**
1. Make bucket public in Cloudflare dashboard
2. Or use presigned URLs for private files

### Files not visible in dashboard
**Cause:** Looking in wrong location
**Fix:**
1. Check file key path
2. Browse bucket → Objects
3. Search by timestamp/filename

### Supabase insert fails
**Cause:** RLS policy blocking insert
**Fix:**
1. Ensure user is authenticated
2. Pass correct `user_id`
3. Use Service Role Key for server routes

### "Module not found" errors
**Cause:** Missing dependencies
**Fix:**
```bash
npm install @aws-sdk/client-s3 formidable @types/formidable
```

## 🚀 Advanced: Direct Browser Uploads

For large files, upload directly from browser to R2:

### 1. Create Presigned POST endpoint

```typescript
// app/api/upload/presigned/route.ts
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { r2Client } from "@/lib/r2";

export async function POST(request: Request) {
  const { filename, contentType } = await request.json();
  
  const { url, fields } = await createPresignedPost(r2Client, {
    Bucket: process.env.R2_BUCKET!,
    Key: generateFileKey(filename),
    Conditions: [
      ["content-length-range", 0, 100 * 1024 * 1024], // 100MB max
      ["eq", "$Content-Type", contentType],
    ],
    Expires: 600, // 10 minutes
  });
  
  return Response.json({ url, fields });
}
```

### 2. Upload from client

```typescript
// Get presigned URL
const { url, fields } = await fetch('/api/upload/presigned', {
  method: 'POST',
  body: JSON.stringify({ filename: file.name, contentType: file.type }),
}).then(r => r.json());

// Upload directly to R2
const formData = new FormData();
Object.entries(fields).forEach(([key, value]) => {
  formData.append(key, value as string);
});
formData.append('file', file);

await fetch(url, { method: 'POST', body: formData });
```

## 📚 Additional Resources

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [AWS SDK v3 Documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## ✨ Next Steps

1. [ ] Add environment variables to `.env.local`
2. [ ] Run Supabase migration
3. [ ] Test upload functionality
4. [ ] Deploy to Vercel with env vars
5. [ ] Configure custom domain (optional)
6. [ ] Set up CDN caching (optional)
7. [ ] Implement file deletion feature
8. [ ] Add file type/size validation
9. [ ] Monitor R2 usage and costs

---

**Questions or issues?** Check the troubleshooting section or review the implementation in the codebase.
