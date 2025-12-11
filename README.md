# AJ247 Studios Website

A modern, production-ready business website built with Next.js, TypeScript, Tailwind CSS, Supabase, Cloudflare R2, and Vercel.

## Features

- 🎨 Clean, minimal design system
- 📸 Dynamic portfolio powered by Supabase
- 🤖 AI chat integration with OpenAI
- 🔐 Secure admin panel for media uploads
- ☁️ **Cloudflare R2 file storage** (S3-compatible)
- ⚡ High performance with Next.js 15
- 🎯 TypeScript for type safety
- 🎨 Tailwind CSS for styling

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Cloudflare account with R2 enabled
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AJ247-Studios/website.git
cd website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `R2_ACCOUNT_ID`: Your Cloudflare account ID
- `R2_ENDPOINT`: Your R2 endpoint URL
- `R2_ACCESS_KEY_ID`: Your R2 access key ID
- `R2_SECRET_ACCESS_KEY`: Your R2 secret access key
- `R2_BUCKET`: Your R2 bucket name (e.g., `aj247-media`)
- `OPENAI_API_KEY`: Your OpenAI API key

**Quick Setup Guide**: See [QUICK_START.md](QUICK_START.md) for step-by-step instructions.

4. Set up Supabase:

Run the database migrations:
```bash
# In Supabase SQL Editor, run:
# supabase/migrations/create_files_table.sql
```

Create a `media` table:
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
```

5. Set up Cloudflare R2:

- Create a bucket named `aj247-media` in Cloudflare R2
- Generate access keys (API tokens)
- See [QUICK_START.md](QUICK_START.md) for detailed instructions

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app
  /api
    /chat/route.ts       # OpenAI chat API
    /upload/route.ts     # Media upload API
  /admin
    page.tsx            # Admin login
    /upload
      page.tsx          # Media upload page
  /portfolio
    page.tsx            # Portfolio gallery
  layout.tsx            # Root layout
  page.tsx              # Home page
  globals.css           # Global styles

/components
  Header.tsx            # Navigation header
  Footer.tsx            # Site footer
  HeroSection.tsx       # Hero section
  PortfolioGrid.tsx     # Portfolio grid
  PortfolioCard.tsx     # Portfolio card
  ChatWidget.tsx        # AI chat widget
  UploadForm.tsx        # File upload form
  YouTubeEmbed.tsx      # YouTube embed
  ImagePreview.tsx      # Image preview
  ContactButton.tsx     # Contact button

/lib
  supabaseClient.ts     # Supabase client
  r2.ts                 # Cloudflare R2 utilities
  api.ts                # API utilities
  utils.ts              # Helper functions
  /types
    r2.ts               # R2 TypeScript types
```

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The site will be automatically deployed with zero configuration.

## Technologies

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Cloudflare R2 (S3-compatible)
- **AI**: OpenAI GPT-4o-mini
- **Deployment**: Vercel

## Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get R2 running in 10 minutes
- **[R2_IMPLEMENTATION.md](R2_IMPLEMENTATION.md)** - Complete R2 integration guide
- **[R2_ARCHITECTURE.md](R2_ARCHITECTURE.md)** - Architecture diagrams and flows
- **[R2_SUMMARY.md](R2_SUMMARY.md)** - Implementation summary
- **[R2_SETUP_CHECKLIST.md](R2_SETUP_CHECKLIST.md)** - Setup checklist

## License

ISC

## Author

AJ247 Studios
