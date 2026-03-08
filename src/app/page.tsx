import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-0">
        {/* Neo-brutalist: single column, no rounded corners, hard edges */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-charcoal bg-snow px-5 py-4">
          <span className="font-serif text-2xl font-light text-charcoal sm:text-3xl">
            Frame Shift
          </span>
          <span className="border-[3px] border-charcoal bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-charcoal">
            Self-hosted Loom alternative
          </span>
        </header>

        <section className="border-b-[3px] border-charcoal bg-oxblood p-8 text-white shadow-[6px_6px_0_0_var(--charcoal)] sm:p-12">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90">
            Keep async video sharing simple
          </p>
          <h1 className="max-w-2xl font-serif text-[2.25rem] font-light leading-[1.1] text-white sm:text-5xl">
            An alternative to Loom that you can self-host and control.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-[1.75] text-white/95">
            Recordings, links, and playback in one place—no recurring SaaS bill.
            Save at least $20/month and own your setup.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            <Link
              href="/login"
              className="inline-flex h-14 w-full max-w-[280px] items-center justify-center border-[3px] border-charcoal bg-white px-6 text-sm font-semibold uppercase tracking-[0.12em] text-charcoal shadow-[4px_4px_0_0_var(--charcoal)] transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--charcoal)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            >
              Sign in with Google
            </Link>
            <Link
              href="#self-host"
              className="text-sm font-semibold uppercase tracking-wider text-white underline underline-offset-4 decoration-2 hover:no-underline"
            >
              How to self-host ↓
            </Link>
          </div>
        </section>

        <section
          id="savings"
          className="grid gap-0 border-b-[3px] border-charcoal bg-mist p-4 sm:grid-cols-2 sm:gap-4 sm:p-4"
        >
          <article className="border-[3px] border-charcoal bg-white p-6 shadow-[4px_4px_0_0_var(--charcoal)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pewter">
              Cost
            </p>
            <p className="mt-2 font-serif text-4xl font-light text-charcoal">
              -$20
            </p>
            <p className="mt-2 text-sm leading-[1.6] text-slate">
              Minimum monthly savings versus a Loom subscription.
            </p>
          </article>
          <article className="border-[3px] border-charcoal bg-white p-6 shadow-[4px_4px_0_0_var(--charcoal)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pewter">
              Ownership
            </p>
            <p className="mt-2 font-serif text-4xl font-light text-charcoal">
              100%
            </p>
            <p className="mt-2 text-sm leading-[1.6] text-slate">
              Host it yourself and keep your recordings under your control.
            </p>
          </article>
        </section>

        <section
          id="self-host"
          aria-labelledby="self-host-heading"
          className="border-b-[3px] border-charcoal bg-white px-5 py-10 sm:px-8 sm:py-12"
        >
          <h2 id="self-host-heading" className="font-serif text-2xl font-light text-charcoal sm:text-3xl">
            How to self-host on Vercel + Supabase
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-[1.7] text-slate">
            Deploy this app with your own Supabase project and Vercel Blob. You
            need a Supabase account, a Vercel account, and (optional) Upstash
            Redis for view rate limiting.
          </p>

          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <article className="border-[3px] border-charcoal bg-snow p-5 shadow-[4px_4px_0_0_var(--charcoal)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pewter">
                Vercel
              </p>
              <ol className="mt-3 list-inside list-decimal space-y-2 text-sm leading-[1.65] text-slate">
                <li>Push the repo to GitHub and import it in Vercel.</li>
                <li>
                  In the project, go to Storage → create a Blob store and copy
                  the token.
                </li>
                <li>
                  In Settings → Environment Variables, add all variables from
                  <code className="mx-1 rounded-none border border-charcoal bg-white px-1.5 py-0.5 font-mono text-xs">
                    .env.example
                  </code>
                  (see Supabase step for URL/keys).
                </li>
                <li>
                  Set <code className="rounded-none border border-charcoal bg-white px-1.5 py-0.5 font-mono text-xs">APP_ORIGIN_ALLOWLIST</code> to your production URL and any preview patterns, e.g.{" "}
                  <code className="break-all rounded-none border border-charcoal bg-white px-1.5 py-0.5 font-mono text-xs">
                    https://your-app.vercel.app,*.vercel.app
                  </code>
                  .
                </li>
                <li>Redeploy after env changes.</li>
              </ol>
            </article>

            <article className="border-[3px] border-charcoal bg-snow p-5 shadow-[4px_4px_0_0_var(--charcoal)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pewter">
                Supabase
              </p>
              <ol className="mt-3 list-inside list-decimal space-y-2 text-sm leading-[1.65] text-slate">
                <li>
                  Create a project at supabase.com. In Settings → API copy{" "}
                  <code className="rounded-none border border-charcoal bg-white px-1.5 py-0.5 font-mono text-xs">Project URL</code> and{" "}
                  <code className="rounded-none border border-charcoal bg-white px-1.5 py-0.5 font-mono text-xs">anon public</code> key into{" "}
                  <code className="rounded-none border border-charcoal bg-white px-1.5 py-0.5 font-mono text-xs">NEXT_PUBLIC_SUPABASE_*</code>.
                </li>
                <li>
                  Auth → Providers: enable Google and add your OAuth client ID
                  and secret.
                </li>
                <li>
                  Auth → URL config: set Site URL to your Vercel app URL; add
                  redirect URL{" "}
                  <code className="break-all rounded-none border border-charcoal bg-white px-1.5 py-0.5 font-mono text-xs">
                    https://your-app.vercel.app/auth/callback
                  </code>
                  .
                </li>
                <li>
                  Run migrations from the repo:{" "}
                  <code className="mt-1 block border-[3px] border-charcoal bg-white p-3 font-mono text-xs text-charcoal">
                    npx supabase db push
                  </code>
                </li>
                <li>
                  Generate a long random string for{" "}
                  <code className="rounded-none border border-charcoal bg-white px-1.5 py-0.5 font-mono text-xs">VIEW_TOKEN_SECRET</code> and add it in Vercel env.
                </li>
              </ol>
            </article>
          </div>

          <p className="mt-6 text-xs text-pewter">
            For full setup details and optional Upstash Redis (rate limiting),
            see the README in the repo.
          </p>
        </section>

        <footer className="border-t-[3px] border-charcoal bg-white px-5 py-4">
          <p className="text-xs text-pewter">
            Record · share · own your videos.
          </p>
        </footer>
      </div>
    </main>
  );
}
