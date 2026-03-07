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

3. **Supabase**

   - Enable **Google** auth in [Authentication → Providers](https://supabase.com/dashboard/project/_/auth/providers) and add your Google OAuth client ID/secret.
   - Set **Site URL** to your production app URL.
   - Add redirect URLs for local, production, and any other allowed domains in Supabase Auth URL config, e.g. `http://localhost:3000/auth/callback`, `https://your-domain.com/auth/callback`, and your preview/custom-domain callback URLs.
   - Run migrations: `npx supabase db push` or run `supabase/migrations/0001_init_videos.sql` in the SQL editor.

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
- [ ] **View count** — Each load of `/video/{hash}` (exact hash) increments the view count; dashboard shows the updated count.

## Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing; Google sign-in. Redirects to `/dashboard` when logged in. |
| `/dashboard` | Protected | List videos, upload form. |
| `/dashboard/video/[id]` | Protected | Playback, copy link, revoke, delete, view count. |
| `/video/[hash]` | Public | Playback by share hash; increments view count. Exact hash match only. |
| `/auth/callback` | Public | OAuth callback. |
| `/auth/signout` | POST | Signs out and redirects to `/`. |

## Limits

- Server uploads are limited by Vercel’s request body size (~4.5 MB). For larger videos, use client upload (e.g. Vercel Blob’s client upload with a token endpoint).
