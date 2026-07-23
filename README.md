# Bolas!

Bolas! is a slim publishing CMS cloned from Hearth and reduced to the magazine workflow: stories, pages, media, taxonomy, drafts, publishing, previews, revisions, RSS, sitemap, and a fixed editorial theme.

## What Stayed

- Owner/admin/editor sign-in
- Pages and journal posts
- Draft, published, and archived states
- Revision history and restore
- Categories and tags
- Media upload, optimization, alt text, captions, and editor insertion
- SEO fields, RSS feed, sitemap, robots, and authenticated previews
- Magazine landing page with optional background image and the latest five stories
- Standard article layout or GSAP scrollytelling per story

## What Was Removed

Commerce, local modules, assistant tools, generic navigation builder, theme management UI, backup/restore UI, Docker/SQLite local storage, and other non-publishing bulk.

## Local Setup

1. Install Node.js 22 or newer.
2. Copy `.env.example` to `.env.local` and fill in the Supabase and site values.
3. Install dependencies:

```sh
npm install
```

4. Apply the database migration:

```sh
npm run db:migrate
```

5. Start the app:

```sh
npm run dev
```

Open `http://localhost:3000/setup` to create the owner account.

You can also double-click `command.launcher` on macOS. The first run may take a moment while dependencies are checked.

## Supabase

Create one Supabase project with:

- Postgres database
- Storage bucket named `bolas-media`
- A pooled Postgres connection string for `DATABASE_URL`
- A service role key for server-side media uploads

Required environment variables are listed in `.env.example`.

## Vercel

Connect the GitHub repo to Vercel, then add the same environment variables in Vercel project settings for Production and Preview. Set `PUBLIC_SITE_URL` to the final production URL before launch so feeds, sitemap, and social previews use the right origin.
