# ManMan

A manga / manhwa reading web app: Next.js 14 (App Router), TypeScript, Tailwind CSS,
PostgreSQL via Prisma. Mobile-first, dark by default, built around the reader.

## Getting started

```bash
npm install
docker compose up -d          # Postgres on :5432
cp .env.example .env
npm run db:push               # create the schema
npm run db:seed               # 12 series, 248 chapters, a demo reader
npm run dev
```

### Pointing at a hosted database (Vercel, Neon, Supabase)

One command creates the schema, loads the sample data, and reads it back to
confirm. It validates the connection string first, so a placeholder fails
immediately instead of timing out:

```powershell
.\scripts\setup-db.ps1 -DatabaseUrl "postgresql://...your real string..."
```

Add `-SkipSeed` for an empty schema. Your local `.env` is untouched and the
connection string is never written to disk. Set the same `DATABASE_URL` in
Vercel (Settings -> Environment Variables) and redeploy - env changes do not
apply to existing deployments.

Open http://localhost:3000. To exercise the signed-in surfaces (bookmarks, unread
badges, server-side reading position), go to `/library` and press
**Sign in as demo reader**.

All artwork is generated locally and served from `/public`, so the app needs no
external image host and `next.config.mjs` has an empty `remotePatterns`:

- `npm run gen:covers` - one typographic SVG cover per series
- `npm run gen:panels` - a pool of 36 chapter panels (6 hues x 6 layouts)

Both are placeholders for real artwork.

### Going live with real covers

Nothing is publicly visible until `Series.published` is true - a title can sit
in the database with all its chapters while rights or artwork are still
pending. Browse, search, rankings, the home page, the series route, the reader
and the chapters API all filter on it, so an unpublished title 404s rather than
half-appearing.

When artwork arrives, name the files after the slug and drop them in:

```
public/covers/solo-leveling.jpg
public/covers/tower-of-god.webp
```

```bash
npm run covers:link -- --dry-run    # report, write nothing
npm run covers:link -- --publish    # link the art and make those titles live
```

Raster files beat the generated `.svg`, and only real artwork is ever
published - a placeholder never is. Titles with no file keep their generated
cover and stay hidden, so a launch can go out with whatever has landed and the
rest follow as they arrive.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | `prisma generate` then `next build` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (`next/core-web-vitals`) |
| `npm run db:push` | Push the Prisma schema to the database |
| `npm run db:seed` | Reset and reseed sample data |

## Routes

| Route | Notes |
| --- | --- |
| `/` | Trending carousel, latest-updates grid (20 series), popular sidebar, Continue reading |
| `/series` | Browse with genre / status / sort filters, paginated 24 per page |
| `/series/[slug]` | Cover, synopsis, genres, bookmark, chapter list with read/unread dots |
| `/series/[slug]/[chapterNumber]` | The reader |
| `/search` | Debounced live search (250 ms) against title, author, artist |
| `/library` | Bookmarks sorted by most recently updated, unread badges, Continue |

API routes: `/api/chapters` (feeds the reader's infinite scroll), `/api/progress`,
`/api/bookmarks`, `/api/search`, `/api/comments`, `/api/auth`.

## The reader

`src/components/reader/` is the highest-traffic surface and holds most of the
interaction logic:

- **Vertical long-strip by default**, with a paged mode in the settings drawer.
- **Infinite scroll across chapters** — reaching the end of a chapter fetches and
  appends the next one, and the URL is rewritten with `history.replaceState`
  rather than a navigation, so scrolling never reloads.
- **Auto-hiding top and bottom bars** — scroll down hides them, scroll up or a
  centre tap brings them back. They carry the chapter dropdown, prev/next
  buttons, and a progress bar.
- **Preloads three pages ahead** in both modes.
- **Position is saved at most once every 5 s**, to `/api/progress` when signed in
  and to `localStorage` for guests, plus a `sendBeacon` flush on tab hide.
  Restored on the next visit to that chapter.
- **Swipe** left/right for next/previous chapter (page turns in paged mode);
  arrow keys do the same on desktop.
- Settings drawer: mode, image width, brightness overlay, tap zones — persisted
  to `localStorage`.

## Notes and deliberate limits

- **Authentication is a stub.** `src/lib/session.ts` and `/api/auth` set a plain
  cookie holding a user id — it authenticates nobody and is disabled in
  production unless `ALLOW_DEMO_LOGIN` is set. Everything else only calls
  `getCurrentUser()`, so swapping in NextAuth or Clerk is a one-file change.
- **Rate limiting is in-process.** `src/lib/rate-limit.ts` is a token bucket in a
  `Map`: correct for one Node instance, not for several. Search is 30 req / 10 s
  per IP, comments 5 / min, progress 60 / min. Move it to Redis before scaling out.
- **Every route renders on demand**, not as ISR. The root layout reads the theme
  cookie, which opts the whole tree out of static generation. Series and chapter
  metadata is still fully server-rendered for crawlers, which is what SEO needs;
  if you want ISR later, move the theme to an inline pre-hydration script.
- **Comments have an API but no UI yet** — the endpoint, model, and rate limit are
  in place for the reader-page comment section.
- No web push / email digests yet; the `Bookmark` model is the hook for them.
