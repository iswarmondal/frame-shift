import { afterEach, describe, expect, it } from "vitest";
import { buildRuntimeSiteUrl, getRequestOrigin } from "./site-url";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;

  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
    return;
  }

  delete (globalThis as { window?: Window }).window;
});

describe("getRequestOrigin", () => {
  it("uses x-forwarded headers when present", () => {
    const request = new Request("http://localhost:3000/auth/callback", {
      headers: {
        "x-forwarded-host": "frame-shift.example.com",
        "x-forwarded-proto": "https",
      },
    });

    expect(getRequestOrigin(request)).toBe("https://frame-shift.example.com");
  });

  it("falls back to request URL origin when forwarded host is missing", () => {
    const request = new Request("https://frame-shift.example.com/auth/callback");

    expect(getRequestOrigin(request)).toBe("https://frame-shift.example.com");
  });
});

describe("buildRuntimeSiteUrl", () => {
  it("uses the active browser origin before the configured site URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://app.example.com";

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        location: {
          origin: "https://custom-domain.example.com",
        },
      },
    });

    expect(buildRuntimeSiteUrl("/auth/callback")).toBe(
      "https://custom-domain.example.com/auth/callback"
    );
  });
});
