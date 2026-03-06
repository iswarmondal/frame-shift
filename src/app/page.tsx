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
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-yellow">
      <div className="w-full max-w-lg space-y-8 text-center p-8 md:p-12 border-[4px] border-black bg-white shadow-brutal">
        <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">
          Video sharing
          <br className="hidden md:block" /> simplified
        </h1>
        <p className="text-lg md:text-xl font-black uppercase tracking-wider text-black border-y-[4px] border-black py-4 bg-cyan border-x-[4px] shadow-[4px_4px_0_0_#000]">
          Sign in with Google to upload and share videos limitlessly.
        </p>
        <div className="pt-4">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
