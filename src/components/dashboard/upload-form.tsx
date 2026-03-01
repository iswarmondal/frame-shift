"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { uploadVideoAction, type UploadResult } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";

export function UploadForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => {
      return await uploadVideoAction(formData);
    },
    null as UploadResult | null
  );

  useEffect(() => {
    if (state?.ok === true) {
      router.push(`/dashboard/video/${state.id}`);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate">
            Video file (MP4, WebM, max 4 MB)
          </span>
          <input
            type="file"
            name="video"
            accept="video/mp4,video/webm,video/quicktime"
            required
            className="block w-full max-w-sm border-2 border-charcoal px-3 py-2 file:mr-2 file:border-2 file:border-charcoal file:bg-snow file:px-3 file:py-1 file:text-sm file:font-semibold"
          />
        </label>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Uploading…" : "Upload"}
        </Button>
      </div>
      {state && !state.ok && (
        <p className="text-sm text-oxblood">{state.error}</p>
      )}
    </form>
  );
}
