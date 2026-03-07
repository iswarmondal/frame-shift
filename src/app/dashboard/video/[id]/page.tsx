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
      <header className="mb-12 flex items-center justify-between border-b-[4px] border-black pb-4">
        <Link
          href="/dashboard"
          className="font-black text-2xl uppercase tracking-tighter text-black bg-yellow px-4 py-2 border-[4px] border-black inline-block shadow-brutal hover:translate-x-1 transition-transform"
        >
          ← Dashboard
        </Link>
      </header>

      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="font-black text-4xl uppercase tracking-tighter bg-black text-white inline-block p-2 border-[4px] border-black">{video.title}</h1>

        <div className="aspect-video w-full border-[4px] border-black bg-black">
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
          <div className="border-[4px] border-black p-4 bg-white">
            <p className="text-sm font-black uppercase tracking-widest text-black mb-2 border-b-[4px] border-black pb-1">
              Views
            </p>
            <p className="font-black text-4xl">{video.view_count}</p>
          </div>
          <div className="border-[4px] border-black p-4 bg-white text-black">
            <p className="text-sm font-black uppercase tracking-widest mb-2 border-b-[4px] border-black pb-1">
              Share link
            </p>
            <p className="mt-2 font-bold text-lg bg-yellow border-[4px] border-black p-2 inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
              /video/{video.share_hash}
            </p>
            <p className="mt-3 text-sm font-black uppercase">
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
