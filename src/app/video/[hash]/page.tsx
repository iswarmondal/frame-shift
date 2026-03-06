import { getVideoByShareHash } from "@/lib/db/videos";
import { notFound } from "next/navigation";
import { RecordView } from "./record-view";

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

  return (
    <div className="min-h-screen bg-pink p-4 md:p-8">
      <RecordView hash={hash} />
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 font-black text-4xl uppercase tracking-tighter bg-white text-black inline-block p-2 border-[4px] border-black shadow-brutal mx-auto">
          {video.title}
        </h1>
        <div className="border-[4px] border-black bg-black shadow-brutal aspect-video w-full">
          <video
            src={video.blob_url}
            controls
            className="w-full h-full"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}
