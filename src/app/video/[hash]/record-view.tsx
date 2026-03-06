"use client";

import { useEffect, useRef } from "react";

/**
 * Records a single view by POSTing to the view API. Runs once on mount.
 * Uses the standard request context (no after() / no cookies in callback).
 */
export function RecordView({ hash }: { hash: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current || !hash) return;
    sent.current = true;
    fetch(`/api/video/${encodeURIComponent(hash)}/view`, {
      method: "POST",
    fetch(`/api/video/${encodeURIComponent(hash)}/view`, {
      method: "POST",
    }).catch(() => {
    }).catch(() => {
      // Best-effort; don't disturb the user
    });
  }, [hash]);

  return null;
}
