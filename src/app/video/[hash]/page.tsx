import { getVideoByShareHash } from "@/lib/db/videos";
import { createViewToken } from "@/lib/view-token";
import { notFound } from "next/navigation";
import { VideoPlayerWithTracking } from "./video-player-with-tracking";

export default async function PublicVideoPage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = await params;

  // Exact match: no trimming, no case normalization
  const video = await getVideoByShareHash(hash);
  if (!video) {
    notFound();
  }

  const viewToken = createViewToken(hash);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <VideoPlayerWithTracking
        hash={hash}
        token={viewToken}
        title={video.title}
        description={video.description ?? ""}
        blobUrl={video.blob_url}
      />
    </div>
  );
}
