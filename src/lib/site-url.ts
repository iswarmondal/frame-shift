const DEFAULT_SITE_URL = "http://localhost:3000";

function firstHeaderValue(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return value.split(",")[0]?.trim() ?? null;
}

function normalizeSiteUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return DEFAULT_SITE_URL;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  return withProtocol.replace(/\/+$/, "");
}

export function getRuntimeSiteUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return normalizeSiteUrl(window.location.origin);
  }

  return getConfiguredSiteUrl();
}

export function getConfiguredSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) {
    return normalizeSiteUrl(configured);
  }

  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  return DEFAULT_SITE_URL;
}

export function getRequestHost(request: Request): string | null {
  return (
    firstHeaderValue(request.headers.get("x-forwarded-host")) ??
    firstHeaderValue(request.headers.get("host"))
  );
}

export function getRequestOrigin(request: Request): string {
  const requestUrl = new URL(request.url);
  const host = getRequestHost(request);
  if (!host) {
    return requestUrl.origin;
  }

  const proto =
    firstHeaderValue(request.headers.get("x-forwarded-proto")) ??
    requestUrl.protocol.replace(":", "");

  return `${proto}://${host}`;
}

export function buildSiteUrl(path: string): string {
  return new URL(path, `${getConfiguredSiteUrl()}/`).toString();
}

export function buildRuntimeSiteUrl(path: string): string {
  return new URL(path, `${getRuntimeSiteUrl()}/`).toString();
}
