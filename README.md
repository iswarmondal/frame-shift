# Frame Shift

Loom-style video sharing: upload videos, get shareable links, revoke access, and track views.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind
- **Supabase** — auth (Google) and Postgres (videos, RLS)
- **Vercel Blob** — video file storage
- **Vercel** — deployment

## Setup

1. **Clone and install**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env.local` and fill in:

   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` from [Supabase API settings](https://supabase.com/dashboard/project/_/settings/api)
   - `BLOB_READ_WRITE_TOKEN` from [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (create a store and add the token to env)
   - `APP_ORIGIN_ALLOWLIST` as a comma-separated list of allowed callback/signout origins, e.g. `http://localhost:3000,https://your-domain.com,*.vercel.app`
   - `VIEW_TOKEN_SECRET` — at least 16 characters; used to sign view-tracking tokens (required for share links).
   - **Upstash Redis** (optional but recommended for production): `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from [Upstash Console](https://console.upstash.com/). If unset, view API rate limiting is skipped (e.g. local dev).

3. **Supabase**

   - Enable **Google** auth in [Authentication → Providers](https://supabase.com/dashboard/project/_/auth/providers) and add your Google OAuth client ID/secret.
   - Set **Site URL** to your production app URL.
   - Add redirect URLs for local, production, and any other allowed domains in Supabase Auth URL config, e.g. `http://localhost:3000/auth/callback`, `https://your-domain.com/auth/callback`, and your preview/custom-domain callback URLs.
   - Run migrations: `npx supabase db push` (runs all migrations in `supabase/migrations/`).

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000), sign in with Google, then use the dashboard to upload a video.

## Validation checklist

- [ ] **Google auth** — Sign in and sign out work; unauthenticated users are redirected to `/`.
- [ ] **Protected routes** — `/dashboard` and `/dashboard/video/[id]` require login.
- [ ] **Upload** — Video uploads to Blob and appears in the dashboard; clicking a card goes to the video management page.
- [ ] **Share link** — Copy shareable link opens `/video/{hash}` and plays the video.
- [ ] **Revoked link** — After revoking, visiting `/video/{hash}` returns 404.
- [ ] **Delete** — Delete removes the blob and the DB row; share link returns 404.
- [ ] **View count** — A view is recorded only after the viewer has watched at least 5 seconds of the video (playback milestone). One view per viewer per video per 10-minute window; dashboard shows the updated count.

## Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing; Google sign-in. Redirects to `/dashboard` when logged in. |
| `/dashboard` | Protected | List videos, upload form. |
| `/dashboard/video/[id]` | Protected | Playback, copy link, revoke, delete, view count. |
| `/video/[hash]` | Public | Playback by share hash; records one view per viewer after 5+ seconds watched. Exact hash match only. |
| `/auth/callback` | Public | OAuth callback. |
| `/auth/signout` | POST | Signs out and redirects to `/`. |

## Limits

- Server uploads are limited by Vercel’s request body size (~4.5 MB). For larger videos, use client upload (e.g. Vercel Blob’s client upload with a token endpoint).

## View tracking and abuse protection

- **Playback gating:** A view is counted only after the user has watched at least 5 seconds of the video (configurable in `src/lib/view-tracking.ts`).
- **Rate limiting:** The view API is protected by:
  - **Edge (middleware):** Upstash Redis sliding-window limits: 60 requests/min per IP to the view endpoint, and 5 requests per 10 minutes per IP per video. If `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are not set, this layer is skipped.
  - **Database:** Supabase RPC enforces one view per viewer (cookie `vid` or IP) per video per 10-minute bucket, plus idempotency by token.
- **Origin check:** The view API rejects requests whose `Origin` or `Referer` is not in `APP_ORIGIN_ALLOWLIST` (when set).
- **Vercel WAF (optional):** For production, consider enabling [Vercel WAF rate limiting](https://vercel.com/docs/security/vercel-waf/rate-limiting) and/or [Bot Protection](https://vercel.com/docs/security/vercel-waf/managed-rulesets) for `POST /api/video/*/view` to block floods and non-browser traffic before they reach the app.
