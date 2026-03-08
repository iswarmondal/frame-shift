"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateVideoTitleAction } from "@/app/dashboard/video/[id]/actions";
import { Button } from "@/components/ui/button";

type Props = {
  videoId: string;
  initialTitle: string;
};

export function VideoTitleEdit({ videoId, initialTitle }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialTitle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Title cannot be empty");
      return;
    }
    if (trimmed === initialTitle) {
      setIsEditing(false);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await updateVideoTitleAction(videoId, trimmed);
    setLoading(false);
    if (result.ok) {
      setValue(trimmed);
      setIsEditing(false);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  function handleCancel() {
    setValue(initialTitle);
    setError(null);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="space-y-3">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
          autoFocus
          disabled={loading}
          className="w-full border-2 border-charcoal bg-white px-4 py-2 font-serif text-2xl font-light text-charcoal shadow-[4px_4px_0_0_theme(colors.charcoal)] outline-none transition-[box-shadow] focus:shadow-[2px_2px_0_0_theme(colors.charcoal)] disabled:opacity-50 rounded-none"
          placeholder="Video title"
        />
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving…" : "Save"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
        {error && (
          <p className="text-sm text-oxblood">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="group flex flex-wrap items-baseline gap-3">
      <h1 className="font-serif text-2xl font-light text-charcoal">
        {initialTitle}
      </h1>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsEditing(true)}
        className="text-xs font-semibold uppercase tracking-wider text-pewter hover:text-charcoal hover:bg-mist"
      >
        Edit title
      </Button>
    </div>
  );
}
