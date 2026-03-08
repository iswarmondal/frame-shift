import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-snow p-8">
      <div className="w-full max-w-lg border-2 border-charcoal bg-white p-8 text-center shadow-[6px_6px_0_0_theme(colors.charcoal)]">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-pewter">
          Frame Shift
        </p>
        <h1 className="font-serif text-4xl font-light tracking-tight">
          Sign in to upload and share
        </h1>
        <p className="mt-3 text-sm text-slate">
          Continue with Google to access your dashboard.
        </p>
        <div className="mt-8">
          <LoginForm />
        </div>
        <Link
          href="/"
          className="mt-5 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-pewter underline underline-offset-4"
        >
          Back to landing page
        </Link>
      </div>
    </main>
  );
}
