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

3. Create storage buckets:
   - Go to Storage in Supabase dashboard
  - Create new bucket: `portfolio` (public read)
  - Create new bucket: `avatars` (public read) for profile pictures
  - (Optional) Create new bucket: `projects` (public read) for client portal assets

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
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # server-side only
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

Also, mark your admin user in the `user_profiles` table (see below) with role `admin`.

### 6. Create User Profiles + Roles

Create `user_profiles` to track roles, display name, and avatar:

```sql
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'guest' check (role in ('guest','client','team','admin')),
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_profiles enable row level security;

create policy "Read own profile" on public.user_profiles
  for select using (auth.uid() = id);

create policy "Update own profile" on public.user_profiles
  for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, role)
  values (new.id, 'guest');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

Optional guest chat limit table:
```sql
create table if not exists public.guest_message_counts (
  guest_token text primary key,
  count int not null default 0,
  last_message timestamp with time zone
);
```

### 6.1 Client Portal Tables

Create the minimal schema for client portals, media, memberships, and invoices:

```sql
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  details text,
  client_user_id uuid references auth.users(id) on delete set null,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc', now()) not null
);

create table if not exists public.project_members (
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('client','team','admin')) not null,
  primary key (project_id, user_id)
);

create table if not exists public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  type text not null check (type in ('photo','video','youtube')),
  url text,
  youtube_id text,
  title text,
  description text,
  category text,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc', now()) not null
);

create table if not exists public.project_invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  number text not null,
  amount_cents int not null,
  status text not null default 'unpaid',
  link_url text,
  issued_at timestamp with time zone default timezone('utc', now()),
  due_at timestamp with time zone
);

alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.project_media enable row level security;
alter table public.project_invoices enable row level security;

-- Basic RLS examples (tune as needed):
-- Clients can read their projects via membership
drop policy if exists "Clients/team read projects" on public.projects;
create policy "Clients/team read projects" on public.projects
  for select using (
    exists(select 1 from public.project_members m where m.project_id = id and m.user_id = auth.uid())
  );

drop policy if exists "Clients/team read media" on public.project_media;
create policy "Clients/team read media" on public.project_media
  for select using (
    exists(select 1 from public.project_members m where m.project_id = project_id and m.user_id = auth.uid())
  );

drop policy if exists "Clients/team read invoices" on public.project_invoices;
create policy "Clients/team read invoices" on public.project_invoices
  for select using (
    exists(select 1 from public.project_members m where m.project_id = project_id and m.user_id = auth.uid())
  );

-- Team can insert media
drop policy if exists "Team insert media" on public.project_media;
create policy "Team insert media" on public.project_media
  for insert with check (
    exists(
      select 1
      from public.project_members m
      where m.project_id = project_id
        and m.user_id = auth.uid()
        and m.role in ('team','admin')
    )
  );
```

### 7. Test Features

- ✅ Browse the home page
- ✅ Visit `/portfolio` to see the gallery
- ✅ Click the chat bubble to test AI chat
- ✅ Log in at `/admin` and upload media

### 8. Deploy to Vercel

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
