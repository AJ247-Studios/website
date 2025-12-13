# Cloudflare R2 Configuration Guide

## 1. CORS Configuration (Required for Presigned Uploads)

For browser-based uploads using presigned URLs to work, you MUST configure CORS on your R2 bucket.

### Option A: Via Cloudflare Dashboard

1. Go to **Cloudflare Dashboard** → **R2** → Select your bucket
2. Click **Settings** → **CORS Policy**
3. Add the following CORS rules:

```json
[
  {
    "AllowedOrigins": [
      "https://aj247studios.com",
      "https://www.aj247studios.com",
      "http://localhost:3000"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "HEAD"
    ],
    "AllowedHeaders": [
      "Content-Type",
      "Content-Length",
      "Content-MD5"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

### Option B: Via Wrangler CLI

Create a `cors-rules.json` file:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": [
        "https://aj247studios.com",
        "https://www.aj247studios.com",
        "http://localhost:3000"
      ],
      "AllowedMethods": ["GET", "PUT", "HEAD"],
      "AllowedHeaders": ["Content-Type", "Content-Length", "Content-MD5"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

Then apply it:
```bash
npx wrangler r2 bucket cors put YOUR_BUCKET_NAME --file cors-rules.json
```

## 2. Environment Variables

Add these to your `.env.local` and Vercel environment variables:

```env
# R2 Storage
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET=your_bucket_name
R2_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
R2_PUBLIC_DOMAIN=https://pub-xxxxx.r2.dev  # or your custom domain
```

### Getting R2 Credentials

1. Go to **Cloudflare Dashboard** → **R2** → **Overview**
2. Click **Manage R2 API Tokens**
3. Create a new API token with:
   - **Permissions**: Object Read & Write
   - **Specify bucket(s)**: Select your bucket

## 3. Public Access (Optional)

For public portfolio/website assets, you can enable public access:

### Option A: R2.dev Subdomain
1. Go to bucket settings → **Public Access**
2. Enable **R2.dev subdomain**
3. Your public URL will be: `https://pub-a2a87610a991462eb9a67ee2f3755e98.r2.dev`

### Option B: Custom Domain
1. Add a custom domain in bucket settings
2. Configure DNS (CNAME to your R2 bucket)
3. Enable caching for better performance

## 4. Folder Structure Convention

Our upload system uses this folder structure:

```
/public/
  website-assets/          # Static site images, hero videos
  portfolio/{projectId}/   # Public portfolio items

/profiles/
  {userId}/avatar.jpg      # User avatars

/clients/
  {clientId}/
    {projectId}/
      deliverables/        # Client-visible final files
      raw/                 # Private raw footage

/team/
  {userId}/
    work_in_progress/      # Team-only files

/backups/
  {YYYY-MM-DD}/           # Daily backups

/transcodes/
  {projectId}/
    720p/                  # Derived video files
    1080p/
```

## 5. Testing Presigned Uploads

### Quick Test Script

```javascript
// test-upload.js
async function testUpload() {
  // 1. Request presigned URL
  const requestRes = await fetch('/api/upload/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: 'test.jpg',
      contentType: 'image/jpeg',
      size: 1024,
      fileType: 'deliverable',
      projectId: 'test-project-id'
    })
  });
  
  const { presignedUrl, token } = await requestRes.json();
  console.log('Got presigned URL:', presignedUrl);
  
  // 2. Upload file
  const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
  await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': 'image/jpeg' }
  });
  
  // 3. Complete upload
  const completeRes = await fetch('/api/upload/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  
  const result = await completeRes.json();
  console.log('Upload complete:', result);
}
```

## 6. Troubleshooting

### CORS Errors
- Check that your origin is in the AllowedOrigins list
- Verify AllowedMethods includes PUT
- Check browser console for specific CORS error messages

### 403 Forbidden
- Verify R2 credentials are correct
- Check that the API token has write permissions
- Ensure the bucket name is correct

### Upload Timeout
- For large files (>100MB), consider increasing presigned URL expiry
- Check your network connection
- Consider implementing chunked uploads for very large files

### Files Not Appearing
- Check the storage_objects table in Supabase
- Verify the upload-complete endpoint was called
- Check server logs for errors

## 7. Security Checklist

- [ ] R2 credentials are NOT exposed in client-side code
- [ ] Presigned URLs have short expiry (15 minutes)
- [ ] File size limits are enforced server-side
- [ ] MIME type validation is enabled
- [ ] User permissions are checked before generating URLs
- [ ] Upload tokens are single-use
- [ ] CORS is configured for specific origins (not *)
