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

Commerce, local modules, assistant tools, generic navigation builder, theme management UI, backup/restore UI, Supabase storage, Vercel-specific deployment wiring, and other non-publishing bulk.

## Local Setup

1. Install Node.js 22 or newer.
2. Install dependencies:

```sh
npm install
```

3. Start the app:

```sh
npm run dev
```

Bolas creates its local SQLite database and media directory automatically under `data/`.

Open `http://localhost:3000/setup` to create the owner account.

You can also double-click `command.launcher` on macOS. The first run may take a moment while dependencies are checked.

## Local Data

By default, runtime data lives here:

- `data/bolas.sqlite` for users, posts, pages, settings, taxonomy, sessions, and audit records
- `data/media/` for uploaded and processed WebP images

Those files are ignored by Git. Backing up Bolas means backing up the `data/` folder.

Optional environment variables are listed in `.env.example` if you want to move the database or media folder elsewhere.

## Self Hosting

Deploy Bolas as a normal Node.js app on hosting you control:

```sh
npm install
npm run build
npm run start
```

Set `PUBLIC_SITE_URL` to the final public URL before launch so feeds, sitemap, and social previews use the right origin.

For cPanel/Passenger hosting, set the application startup file to `server.js`.
