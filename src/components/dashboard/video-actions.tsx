"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { revokeShareAction, deleteVideoAction } from "@/app/dashboard/video/[id]/actions";
import { Button } from "@/components/ui/button";

type Props = {
  videoId: string;
  shareHash: string;
  isRevoked: boolean;
};

export function VideoActions({ videoId, shareHash, isRevoked }: Props) {
  const router = useRouter();
  const [copyDone, setCopyDone] = useState(false);
  const [loading, setLoading] = useState<"revoke" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCopy() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/video/${shareHash}`
        : "";
    try {
      await navigator.clipboard.writeText(url);
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    } catch {
      setError("Copy failed");
    }
  }

  async function handleRevoke() {
    setLoading("revoke");
    setError(null);
    const result = await revokeShareAction(videoId);
    setLoading(null);
    if (result.ok) {
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this video? The share link will stop working and the file will be removed.")) return;
    setLoading("delete");
    setError(null);
    const result = await deleteVideoAction(videoId);
    setLoading(null);
    if (result.ok) {
      router.push("/dashboard");
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="flex flex-wrap gap-4">
      <Button
        type="button"
        variant="secondary"
        onClick={handleCopy}
        disabled={isRevoked}
      >
        {copyDone ? "Copied!" : "Copy shareable link"}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={handleRevoke}
        disabled={isRevoked || loading !== null}
      >
        {loading === "revoke" ? "Revoking…" : "Revoke access"}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={handleDelete}
        disabled={loading !== null}
        className="border-oxblood text-oxblood hover:bg-oxblood/10"
      >
        {loading === "delete" ? "Deleting…" : "Delete video"}
      </Button>
      {error && <p className="w-full text-sm text-oxblood">{error}</p>}
    </div>
  );
}
