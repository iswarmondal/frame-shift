"use client";

import { useRef } from "react";
import { RecordView } from "./record-view";
import { MarkdownContent } from "@/components/ui/markdown-content";

type Props = {
  hash: string;
  token: string;
  title: string;
  description: string;
  blobUrl: string;
};

/**
 * Client wrapper that owns the video element ref and passes it to RecordView
 * so tracking fires only after the playback milestone (watched seconds).
 */
export function VideoPlayerWithTracking({
  hash,
  token,
  title,
  description,
  blobUrl,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <>
      <RecordView hash={hash} token={token} videoRef={videoRef} />
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="mb-6 font-black text-4xl uppercase tracking-tighter bg-black text-white inline-block p-2 border-[4px] border-black mx-auto">
          {title}
        </h1>
        <div className="border-[4px] border-black bg-black aspect-video w-full">
          <video
            ref={videoRef}
            src={blobUrl}
            controls
            className="w-full h-full"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>
        {description.trim() ? (
          <div className="border-2 border-charcoal bg-white p-6 shadow-[4px_4px_0_0_theme(colors.charcoal)]">
            <MarkdownContent content={description} />
          </div>
        ) : null}
      </div>
    </>
  );
}
