import { put, del as blobDel } from "@vercel/blob";

const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export function isAllowedVideoType(type: string): boolean {
  return VIDEO_TYPES.includes(type);
}

export function isWithinSizeLimit(size: number): boolean {
  return size > 0 && size <= MAX_SIZE_BYTES;
}

/**
 * Upload a video file to Vercel Blob. Returns public URL and pathname for DB.
 */
export async function uploadVideo(
  pathname: string,
  file: File
): Promise<{ url: string; pathname: string }> {
  const blob = await put(pathname, file, {
    access: "public",
    contentType: file.type || "video/mp4",
  });
  return { url: blob.url, pathname: blob.pathname };
}

/**
 * Delete a blob by URL (e.g. when deleting a video).
 */
export async function deleteBlobByUrl(url: string): Promise<void> {
  await blobDel(url);
}
