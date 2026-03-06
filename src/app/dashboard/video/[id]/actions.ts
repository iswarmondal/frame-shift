"use server";

import { createClient } from "@/lib/supabase/server";
import { getVideoById, revokeVideoShare, deleteVideo } from "@/lib/db/videos";
import { deleteBlobByUrl } from "@/lib/blob";
import { revalidatePath } from "next/cache";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function revokeShareAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const video = await getVideoById(id);
  if (!video || video.owner_id !== user.id) {
    return { ok: false, error: "Video not found" };
  }

  try {
    await revokeVideoShare(id);
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/video/${id}`);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to revoke link" };
  }
}

export async function deleteVideoAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const video = await getVideoById(id);
  if (!video || video.owner_id !== user.id) {
    return { ok: false, error: "Video not found" };
  }

  try {
    await deleteBlobByUrl(video.blob_url);
    await deleteVideo(id);
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/video/${id}`);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to delete video" };
  }
}
