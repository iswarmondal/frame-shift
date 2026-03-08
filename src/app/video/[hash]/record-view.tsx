"use client";

import { VIEW_RECORD_WATCHED_SECONDS } from "@/lib/view-tracking";
import { useEffect, useRef, type RefObject } from "react";

export { VIEW_RECORD_WATCHED_SECONDS };

/**
 * Records a single view by POSTing the page-issued token to the view API
 * only after the user has watched at least VIEW_RECORD_WATCHED_SECONDS.
 * Requires a ref to the video element so we can listen to timeupdate.
 */
export function RecordView({
  hash,
  token,
  videoRef,
}: {
  hash: string;
  token: string;
  videoRef: RefObject<HTMLVideoElement | null>;
}) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current || !hash || !token) return;
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (sent.current) return;
      const watched = video.currentTime;
      if (watched < VIEW_RECORD_WATCHED_SECONDS) return;
      sent.current = true;
      fetch(`/api/video/${encodeURIComponent(hash)}/view`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, watchedSeconds: watched }),
      }).catch(() => {
        // Best-effort; don't disturb the user
      });
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    return () => video.removeEventListener("timeupdate", onTimeUpdate);
  }, [hash, token, videoRef]);

  return null;
}
