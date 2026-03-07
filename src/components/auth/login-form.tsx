"use client";

import { createClient } from "@/lib/supabase/client";
import { buildRuntimeSiteUrl } from "@/lib/site-url";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: buildRuntimeSiteUrl(
          `/auth/callback?next=${encodeURIComponent(redirectTo)}`
        ),
      },
    });
  }

  return (
    <Button type="button" onClick={signInWithGoogle} size="lg">
      Sign in with Google
    </Button>
  );
}
