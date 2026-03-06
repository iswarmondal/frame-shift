import { createClient } from "@/lib/supabase/server";

export type VideoRow = {
  id: string;
  owner_id: string;
  title: string;
  blob_url: string;
  blob_path: string;
  share_hash: string;
  is_revoked: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  revoked_at: string | null;
};

/**
 * List videos owned by the current user (for dashboard).
 */
export async function listVideosByOwner(): Promise<VideoRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as VideoRow[];
}

/**
 * Get a single video by id. Caller must be owner (enforced by RLS).
 */
export async function getVideoById(id: string): Promise<VideoRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as VideoRow;
}

/**
 * Get a video by share hash for public playback. Only returns non-revoked videos.
 * Uses RPC so anon can call without direct table read.
 */
export async function getVideoByShareHash(
  hash: string
): Promise<VideoRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_video_by_share_hash", {
    p_hash: hash,
  });

  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return (row ?? null) as VideoRow | null;
}

/**
 * Increment view count for a video by share hash (public playback).
 * No-op if hash not found or revoked.
 */
export async function incrementVideoViewCount(hash: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("increment_video_view_count", {
    p_hash: hash,
  });
  if (error) throw error;
}

export type InsertVideo = {
  owner_id: string;
  title: string;
  blob_url: string;
  blob_path: string;
  share_hash: string;
};

/**
 * Insert a new video. Caller must be authenticated; owner_id must match auth.uid() (RLS).
 */
export async function insertVideo(row: InsertVideo): Promise<VideoRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("videos")
    .insert(row)
    .select()
    .single();

  if (error) throw error;
  return data as VideoRow;
}

/**
 * Revoke share link for a video. Owner only (RLS).
 */
export async function revokeVideoShare(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("videos")
    .update({ is_revoked: true, revoked_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

/**
 * Delete a video row. Owner only (RLS). Caller is responsible for deleting the blob.
 */
export async function deleteVideo(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("videos").delete().eq("id", id);

  if (error) throw error;
}
