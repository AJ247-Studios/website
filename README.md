# AJ247 Studios Website

A modern, production-ready business website built with Next.js, TypeScript, Tailwind CSS, Supabase, and Vercel.

## Features

- 🎨 Clean, minimal design system
- 📸 Dynamic portfolio powered by Supabase
- 🤖 AI chat integration with OpenAI
- 🔐 Secure admin panel for media uploads
- ⚡ High performance with Next.js 15
- 🎯 TypeScript for type safety
- 🎨 Tailwind CSS for styling

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
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
cp .env.example .env
```

Edit `.env` and add your credentials:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `OPENAI_API_KEY`: Your OpenAI API key

4. Set up Supabase:

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

Create a storage bucket named `portfolio` with public read access.

5. Run the development server:
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
  api.ts                # API utilities
  utils.ts              # Helper functions
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
- **Database**: Supabase
- **AI**: OpenAI GPT-4o-mini
- **Deployment**: Vercel

## License

ISC

## Author

AJ247 Studios
