import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getVideoById } from "@/lib/db/videos";
import { Button } from "@/components/ui/button";
import { VideoActions } from "@/components/dashboard/video-actions";

export default async function DashboardVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const video = await getVideoById(id);
  if (!video || video.owner_id !== user.id) notFound();

  return (
    <div className="min-h-screen p-8">
      <header className="mb-8 flex items-center justify-between border-b-2 border-charcoal pb-4">
        <Link
          href="/dashboard"
          className="font-serif text-lg font-light text-charcoal hover:text-oxblood"
        >
          ← Dashboard
        </Link>
      </header>

      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="font-serif text-2xl font-light">{video.title}</h1>

        <div className="aspect-video w-full border-2 border-charcoal bg-charcoal shadow-[4px_4px_0_0_theme(colors.charcoal)]">
          <video
            src={video.blob_url}
            controls
            className="h-full w-full"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="border-2 border-charcoal p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate">
              Views
            </p>
            <p className="font-serif text-2xl font-light">{video.view_count}</p>
          </div>
          <div className="border-2 border-charcoal p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate">
              Share link
            </p>
            <p className="mt-1 truncate font-mono text-sm text-pewter">
              /video/{video.share_hash}
            </p>
            <p className="mt-2 text-xs text-pewter">
              {video.is_revoked ? "Revoked" : "Active"}
            </p>
          </div>
        </div>

        <VideoActions
          videoId={video.id}
          shareHash={video.share_hash}
          isRevoked={video.is_revoked}
        />
      </div>
    </div>
  );
}
