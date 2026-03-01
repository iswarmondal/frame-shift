import { randomBytes } from "crypto";

const BYTE_LENGTH = 24; // 24 bytes = 32 url-safe base64 chars (unguessable)

/**
 * Generate a cryptographically strong, url-safe share hash for video links.
 * Not reversible; used as a stable unique identifier in URLs.
 */
export function generateShareHash(): string {
  return randomBytes(BYTE_LENGTH).toString("base64url");
}
