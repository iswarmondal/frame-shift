import { notFound } from "next/navigation";
import {
  getVideoByShareHash,
  incrementVideoViewCount,
} from "@/lib/db/videos";

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

  await incrementVideoViewCount(hash);

  return (
    <div className="min-h-screen bg-deep-sea p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="border-2 border-white/20 bg-charcoal shadow-[4px_4px_0_0_rgba(255,255,255,0.2)]">
          <video
            src={video.blob_url}
            controls
            className="aspect-video w-full"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>
        <p className="mt-4 font-serif text-lg font-light text-white/90">
          {video.title}
        </p>
      </div>
    </div>
  );
}
