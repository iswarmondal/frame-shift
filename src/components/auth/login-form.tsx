"use client";

import { getBrowserAppOrigin } from "@/lib/app-url";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  async function signInWithGoogle() {
    const supabase = createClient();
    const appOrigin = getBrowserAppOrigin();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${appOrigin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
  }

  return (
    <Button type="button" onClick={signInWithGoogle} size="lg" className="w-full text-xl py-6">
      Sign in with Google
    </Button>
  );
}
