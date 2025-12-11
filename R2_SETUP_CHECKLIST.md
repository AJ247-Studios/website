# 🚀 R2 Setup Quick Checklist

## Cloudflare Setup

1. **Create R2 Bucket**
   - [ ] Go to Cloudflare Dashboard → R2
   - [ ] Click "Create bucket"
   - [ ] Name: `aj247-media`
   - [ ] Click "Create"

2. **Generate Access Keys**
   - [ ] Go to "Manage R2 API Tokens"
   - [ ] Click "Create API Token"
   - [ ] Copy Access Key ID
   - [ ] Copy Secret Access Key
   - [ ] Note your Account ID
   - [ ] Note endpoint: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`

## Supabase Setup

3. **Run Database Migration**
   - [ ] Open Supabase SQL Editor
   - [ ] Copy content from `supabase/migrations/create_files_table.sql`
   - [ ] Execute the SQL
   - [ ] Verify `files` table exists

4. **Get Supabase Keys**
   - [ ] Go to Supabase Dashboard → Settings → API
   - [ ] Copy Project URL
   - [ ] Copy Anon/Public Key
   - [ ] Copy Service Role Key (keep secret!)

## Local Development

5. **Environment Variables**
   - [ ] Copy `.env.local.example` to `.env.local`
   - [ ] Fill in R2 credentials
   - [ ] Fill in Supabase credentials
   - [ ] Save file

6. **Dependencies**
   - [x] Already installed: `@aws-sdk/client-s3`, `formidable`, `@types/formidable`

7. **Test Upload**
   - [ ] Start dev server: `npm run dev`
   - [ ] Navigate to upload form
   - [ ] Upload a test file
   - [ ] Check Supabase `files` table
   - [ ] Check R2 bucket in Cloudflare

## Production Deployment

8. **Vercel Environment Variables**
   - [ ] Go to Vercel Dashboard
   - [ ] Project Settings → Environment Variables
   - [ ] Add all env vars from `.env.local`
   - [ ] Deploy or redeploy

9. **Verify Production**
   - [ ] Test upload on production site
   - [ ] Check file appears in R2
   - [ ] Check record in Supabase
   - [ ] Verify URL is accessible

## Optional Enhancements

10. **Custom Domain (Optional)**
    - [ ] Set up custom domain in Cloudflare
    - [ ] Add `R2_PUBLIC_DOMAIN` env var
    - [ ] Update `uploadToR2()` to use custom domain

11. **Public Access (if needed)**
    - [ ] Make bucket public in Cloudflare
    - [ ] Or implement presigned URLs for private files

12. **Monitoring**
    - [ ] Set up Cloudflare usage alerts
    - [ ] Monitor R2 operations in dashboard
    - [ ] Track storage growth

---

## Environment Variables Template

```env
# Cloudflare R2
R2_ACCOUNT_ID=
R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=aj247-media
R2_PUBLIC_DOMAIN=  # Optional

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Test Command

```bash
# Test upload endpoint
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test.jpg" \
  -F "title=Test Upload"
```

---

**Status:** ✅ Implementation Complete
**Next:** Follow checklist to configure and test
