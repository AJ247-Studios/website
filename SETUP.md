# AJ247 Studios Website - Quick Setup Guide

## What's Been Created

Your complete Next.js website is now set up with:

✅ **Frontend Pages:**
- Home page with hero section
- Portfolio gallery page
- Admin login page
- Admin upload page

✅ **Components:**
- Header (navigation)
- Footer
- HeroSection
- PortfolioGrid & PortfolioCard
- ChatWidget (AI chat)
- UploadForm
- ImagePreview & YouTubeEmbed
- ContactButton

✅ **API Routes:**
- `/api/chat` - OpenAI chat integration
- `/api/upload` - Media upload handler

✅ **Configuration:**
- TypeScript setup
- Tailwind CSS configured
- Next.js config for Supabase images
- Vercel deployment ready

## Next Steps

### 1. Set Up Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Create the `media` table:

```sql
create table media (
  id uuid default gen_random_uuid() primary key,
  filename text not null,
  url text not null,
  title text,
  description text,
  youtube_id text,
  uploaded_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table media enable row level security;

-- Create policy for public read access
create policy "Public read access"
  on media for select
  using (true);

-- Create policy for authenticated insert
create policy "Authenticated users can insert"
  on media for insert
  with check (auth.role() = 'authenticated');
```

3. Create a storage bucket named `portfolio`:
   - Go to Storage in Supabase dashboard
   - Create new bucket: `portfolio`
   - Make it public for reading

4. Get your Supabase credentials:
   - Project URL: Settings → API → Project URL
   - Anon/Public Key: Settings → API → Project API keys → anon public

### 2. Get OpenAI API Key

1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to API keys and create a new key

### 3. Configure Environment Variables

Edit `.env.local` with your actual credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
OPENAI_API_KEY=sk-your-actual-openai-key
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Create Admin User

In Supabase dashboard:
1. Go to Authentication → Users
2. Add user manually with email/password
3. Use these credentials to log in at `/admin`

### 6. Test Features

- ✅ Browse the home page
- ✅ Visit `/portfolio` to see the gallery
- ✅ Click the chat bubble to test AI chat
- ✅ Log in at `/admin` and upload media

### 7. Deploy to Vercel

```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Deploy
vercel

# Or connect GitHub repo in Vercel dashboard
```

Add the same environment variables in Vercel dashboard.

## Troubleshooting

**Build errors?**
- Make sure all dependencies are installed: `npm install`
- Check TypeScript errors: `npm run build`

**Supabase connection issues?**
- Verify your environment variables
- Check Supabase project is active
- Ensure storage bucket is public

**Chat not working?**
- Verify OpenAI API key is correct
- Check API key has credits
- Look at browser console for errors

## Project Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Need Help?

Check the main README.md for detailed documentation or refer to readme.copilat for the project specification.
