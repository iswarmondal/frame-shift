"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getVideoById,
  revokeVideoShare,
  deleteVideo,
  updateVideoTitle,
  updateVideoDescription,
} from "@/lib/db/videos";
import { deleteBlobByUrl } from "@/lib/blob";
import { revalidatePath } from "next/cache";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateVideoTitleAction(
  id: string,
  title: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const video = await getVideoById(id);
  if (!video || video.owner_id !== user.id) {
    return { ok: false, error: "Video not found" };
  }

  const trimmed = title.trim();
  if (!trimmed) return { ok: false, error: "Title cannot be empty" };

  try {
    await updateVideoTitle(id, trimmed);
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/video/${id}`);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to update title" };
  }
}

export async function updateVideoDescriptionAction(
  id: string,
  description: string
): Promise<ActionResult> {
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
    await updateVideoDescription(id, description);
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/video/${id}`);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to update description" };
  }
}

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
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to delete video" };
  }
}
