"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateVideoDescriptionAction } from "@/app/dashboard/video/[id]/actions";
import { Button } from "@/components/ui/button";

type Props = {
  videoId: string;
  initialDescription: string;
};

export function VideoDescriptionEdit({
  videoId,
  initialDescription,
}: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialDescription);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    setError(null);
    const result = await updateVideoDescriptionAction(videoId, value);
    setLoading(false);
    if (result.ok) {
      setIsEditing(false);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  function handleCancel() {
    setValue(initialDescription);
    setError(null);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="space-y-3 border-2 border-charcoal p-4 shadow-[4px_4px_0_0_theme(colors.charcoal)]">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate">
          Description (Markdown)
        </p>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") handleCancel();
          }}
          autoFocus
          disabled={loading}
          rows={6}
          className="w-full resize-y border-2 border-charcoal bg-white px-4 py-3 font-mono text-sm text-charcoal shadow-[4px_4px_0_0_theme(colors.charcoal)] outline-none transition-[box-shadow] focus:shadow-[2px_2px_0_0_theme(colors.charcoal)] disabled:opacity-50 rounded-none"
          placeholder="Add a description in **Markdown**…"
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
        {error && <p className="text-sm text-oxblood">{error}</p>}
      </div>
    );
  }

  return (
    <div className="border-2 border-charcoal p-4 shadow-[4px_4px_0_0_theme(colors.charcoal)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate">
          Description
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="text-xs font-semibold uppercase tracking-wider text-pewter hover:text-charcoal hover:bg-mist"
        >
          {initialDescription ? "Edit description" : "Add description"}
        </Button>
      </div>
      {initialDescription ? (
        <div className="mt-3 whitespace-pre-wrap font-mono text-sm text-slate leading-relaxed">
          {initialDescription}
        </div>
      ) : (
        <p className="mt-2 text-sm text-pewter italic">
          No description yet. Viewers will only see the title.
        </p>
      )}
    </div>
  );
}
