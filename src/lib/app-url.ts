function getAllowlistEntries(): string[] {
  return (
    process.env.APP_ORIGIN_ALLOWLIST?.split(",")
    .map((entry) => entry.trim())
    .filter(Boolean) ?? []
  );
}

function getOriginHostname(origin: string): string | null {
  try {
    return new URL(origin).host;
  } catch {
    return null;
  }
}

function matchesAllowlistEntry(origin: string, entry: string): boolean {
  if (entry.includes("://")) {
    return origin === entry;
  }

  const hostname = getOriginHostname(origin);
  if (!hostname) return false;

  const normalizedEntry = entry.startsWith("*.") ? entry.slice(1) : entry;
  if (normalizedEntry.startsWith(".")) {
    return hostname === normalizedEntry.slice(1) || hostname.endsWith(normalizedEntry);
  }

  return hostname === normalizedEntry;
}

export function getRequestOrigin(requestUrl: string): string {
  return new URL(requestUrl).origin;
}

export function getBrowserAppOrigin(): string {
  if (typeof window === "undefined") {
    throw new Error("Browser origin is only available in the browser.");
  }

  return window.location.origin;
}

export function isAllowedOrigin(origin: string): boolean {
  const allowlist = getAllowlistEntries();
  if (allowlist.length === 0) {
    return process.env.NODE_ENV !== "production";
  }

  return allowlist.some((entry) => matchesAllowlistEntry(origin, entry));
}

export function getAllowedRequestOrigin(requestUrl: string): string {
  const origin = getRequestOrigin(requestUrl);
  if (!isAllowedOrigin(origin)) {
    throw new Error(
      `Origin "${origin}" is not in APP_ORIGIN_ALLOWLIST.`
    );
  }

  return origin;
}
