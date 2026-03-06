"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadVideo, isAllowedVideoType, isWithinSizeLimit } from "@/lib/blob";
import { insertVideo } from "@/lib/db/videos";
import { generateShareHash } from "@/lib/hash";
import { revalidatePath } from "next/cache";

export type UploadResult = { ok: true; id: string } | { ok: false; error: string };

export async function uploadVideoAction(formData: FormData): Promise<UploadResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const file = formData.get("video") as File | null;
  if (!file || !(file instanceof File)) {
    return { ok: false, error: "No file provided" };
  }

  if (!isAllowedVideoType(file.type)) {
    return { ok: false, error: "Invalid file type. Use MP4, WebM, or QuickTime." };
  }
  if (!isWithinSizeLimit(file.size)) {
    return { ok: false, error: "File too large. Max 20 MB for server upload." };
  }

  const ext = file.name.split(".").pop() || "mp4";
  const pathname = `videos/${user.id}/${Date.now()}-${generateShareHash().slice(0, 8)}.${ext}`;

  let url: string;
  let blobPath: string;
  try {
    const result = await uploadVideo(pathname, file);
    url = result.url;
    blobPath = result.pathname;
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Upload failed" };
  }

  const shareHash = generateShareHash();
  const title = file.name.replace(/\.[^.]+$/, "") || "Untitled";

  try {
    const row = await insertVideo({
      owner_id: user.id,
      title,
      blob_url: url,
      blob_path: blobPath,
      share_hash: shareHash,
    });
    revalidatePath("/dashboard");
    return { ok: true, id: row.id };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to save video record" };
  }
}
