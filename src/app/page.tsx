import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/login-form";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Video sharing, simplified
        </h1>
        <p className="text-neutral-600">
          Sign in with Google to upload and share videos.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
