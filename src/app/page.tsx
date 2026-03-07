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
    <main className="min-h-screen bg-snow p-6 sm:p-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-2 border-charcoal bg-white px-4 py-3 shadow-[4px_4px_0_0_theme(colors.charcoal)]">
          <p className="font-serif text-3xl font-light">Frame Shift</p>
          <p className="border-2 border-charcoal bg-mist px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate">
            Self-hosted Loom alternative
          </p>
        </header>

        <section className="border-2 border-charcoal bg-oxblood p-6 text-white shadow-[6px_6px_0_0_theme(colors.charcoal)] sm:p-10">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em]">
            Keep async video sharing simple
          </p>
          <h1 className="max-w-3xl font-serif text-4xl font-light leading-tight sm:text-5xl">
            An alternative to Loom that you can self-host and control.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-snow sm:text-lg">
            Recordings, links, and playback in one place, without another
            recurring SaaS bill. Teams switching from Loom can save at least
            $20 per month while owning their own setup.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center border-2 border-charcoal bg-white px-6 text-sm font-semibold uppercase tracking-[0.14em] text-charcoal shadow-[4px_4px_0_0_theme(colors.charcoal)] transition-[box-shadow,transform,background-color] hover:bg-mist hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_theme(colors.charcoal)]"
            >
              Sign in with Google
            </Link>
            <Link
              href="#savings"
              className="inline-flex h-12 items-center justify-center border-2 border-white px-6 text-sm font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white hover:text-charcoal"
            >
              Why self-host
            </Link>
          </div>
        </section>

        <section
          id="savings"
          className="grid gap-4 text-charcoal sm:grid-cols-2"
        >
          <article className="border-2 border-charcoal bg-white p-5 shadow-[4px_4px_0_0_theme(colors.charcoal)]">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-pewter">
              Cost
            </p>
            <p className="mt-2 font-serif text-4xl font-light">$20+</p>
            <p className="mt-2 text-sm text-slate">
              Minimum monthly savings versus a Loom subscription.
            </p>
          </article>
          <article className="border-2 border-charcoal bg-white p-5 shadow-[4px_4px_0_0_theme(colors.charcoal)]">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-pewter">
              Ownership
            </p>
            <p className="mt-2 font-serif text-4xl font-light">100%</p>
            <p className="mt-2 text-sm text-slate">
              Host it yourself and keep your recordings under your control.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
