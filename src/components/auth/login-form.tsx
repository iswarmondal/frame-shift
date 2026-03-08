"use client";

import { getAuthCallbackOrigin, getBrowserAppOrigin } from "@/lib/app-url";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  async function signInWithGoogle() {
    const supabase = createClient();
    const browserOrigin = getBrowserAppOrigin();
    const authOrigin = getAuthCallbackOrigin();

    const callbackUrl = new URL("/auth/callback", authOrigin);
    callbackUrl.searchParams.set("next", redirectTo);
    if (browserOrigin !== authOrigin) {
      callbackUrl.searchParams.set("origin", browserOrigin);
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });
  }

  return (
    <Button type="button" onClick={signInWithGoogle} size="lg">
      Sign in with Google
    </Button>
  );
}
