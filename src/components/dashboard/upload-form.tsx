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
    <form action={formAction} className="space-y-4 inline-block w-full max-w-2xl">
      <div className="flex flex-col sm:flex-row flex-wrap items-end gap-6">
        <label className="flex flex-col gap-2 w-full sm:w-auto flex-1">
          <span className="text-sm font-black uppercase tracking-widest text-black bg-white inline-block px-2 py-1 border-[4px] border-black max-w-max">
            Video file (MP4, WebM, max 20 MB)
          </span>
          <input
            type="file"
            name="video"
            accept="video/mp4,video/webm,video/quicktime"
            required
            className="block w-full border-[4px] border-black bg-white px-3 py-3 file:mr-4 file:border-[4px] file:border-black file:bg-yellow file:px-4 file:py-2 file:text-sm file:font-black file:uppercase file:cursor-pointer hover:file:bg-[#e6c757] file:transition-colors focus:outline-none focus:ring-4 focus:ring-pink"
          />
        </label>
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto h-[76px] self-end">
          {isPending ? "Uploading…" : "Upload"}
        </Button>
      </div>
      {state && !state.ok && (
        <p className="text-base font-black uppercase bg-red text-white p-2 border-[4px] border-black inline-block">{state.error}</p>
      )}
    </form>
  );
}
