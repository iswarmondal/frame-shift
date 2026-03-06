"use client";

import { useEffect, useRef } from "react";

/**
 * Records a single view by POSTing the page-issued token to the view API.
 * Runs once on mount. Token is required (idempotency + rate limiting).
 */
export function RecordView({ hash, token }: { hash: string; token: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current || !hash || !token) return;
    sent.current = true;
    fetch(`/api/video/${encodeURIComponent(hash)}/view`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).catch(() => {
      // Best-effort; don't disturb the user
    });
  }, [hash, token]);

  return null;
}
