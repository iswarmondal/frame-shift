"use client";

import { useRef } from "react";
import { RecordView } from "./record-view";

type Props = {
  hash: string;
  token: string;
  title: string;
  blobUrl: string;
};

/**
 * Client wrapper that owns the video element ref and passes it to RecordView
 * so tracking fires only after the playback milestone (watched seconds).
 */
export function VideoPlayerWithTracking({ hash, token, title, blobUrl }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <>
      <RecordView hash={hash} token={token} videoRef={videoRef} />
      <div className="mx-auto max-w-4xl">
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
      </div>
    </>
  );
}
