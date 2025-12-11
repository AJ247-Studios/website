# 🚀 Quick Start - Get R2 Running in 10 Minutes

Follow these steps to get file uploads working with Cloudflare R2.

## Step 1: Cloudflare (3 minutes)

1. Go to https://dash.cloudflare.com
2. Navigate to **R2 Object Storage**
3. Click **Create bucket** → Name it `aj247-media` → Create
4. Go to **Manage R2 API Tokens** → Click **Create API Token**
5. Copy and save:
   - Access Key ID
   - Secret Access Key
   - Your Account ID (visible in dashboard)

## Step 2: Supabase (2 minutes)

1. Open Supabase Dashboard → **SQL Editor**
2. Copy entire contents of `supabase/migrations/create_files_table.sql`
3. Paste and click **Run**
4. Verify: Go to **Table Editor** → Should see `files` table

## Step 3: Environment Variables (2 minutes)

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and fill in:
   ```env
   # From Cloudflare
   R2_ACCOUNT_ID=your_account_id
   R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
   R2_ACCESS_KEY_ID=your_key_id_here
   R2_SECRET_ACCESS_KEY=your_secret_here
   R2_BUCKET=aj247-media
   
   # From Supabase (Settings → API)
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
   ```

## Step 4: Test (3 minutes)

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Navigate to your upload form (e.g., `/admin/upload`)

3. Upload a test image

4. Verify:
   - ✅ Upload succeeds
   - ✅ File appears in Cloudflare R2 bucket
   - ✅ Record appears in Supabase `files` table
   - ✅ URL is accessible

## Step 5: Deploy to Production

### For Vercel:

1. Go to Vercel Dashboard → Your Project → **Settings**
2. Click **Environment Variables**
3. Add all variables from `.env.local`
4. Click **Deploy** or push to trigger deployment

### For Other Platforms:

Add the same environment variables to your hosting platform's configuration.

---

## ✅ You're Done!

Files now upload to Cloudflare R2 instead of Supabase Storage.

**Test command:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test.jpg" \
  -F "title=Test"
```

**Next Steps:**
- Read `R2_IMPLEMENTATION.md` for detailed documentation
- Configure custom domain (optional)
- Set up monitoring
- Implement file deletion

---

## 🐛 Not Working?

### Upload fails with "Unauthorized"
→ Check R2 credentials in `.env.local`

### 403 error when accessing file URL
→ Make bucket public in Cloudflare dashboard

### Supabase insert error
→ Verify `files` table was created and RLS policies are set

### "Module not found"
→ Run `npm install` (dependencies already in package.json)

---

## 📞 Need Help?

- Check `R2_IMPLEMENTATION.md` for detailed troubleshooting
- Verify all env vars are set correctly
- Check Cloudflare dashboard for R2 access
- Check Supabase logs for database errors

**Common mistake:** Using `<ACCOUNT_ID>` literally in endpoint URL. Replace it with your actual account ID!
