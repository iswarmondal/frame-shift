import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getClientIpFromRequest,
  getViewerIdFromRequest,
  getOriginFromRequest,
  isAllowedRequestOrigin,
  getViewerIdentity,
} from "./request-client";

function requestWithHeaders(headers: Record<string, string>): Request {
  return new Request("https://example.com/api/view", {
    headers: new Headers(headers),
  });
}

describe("request-client", () => {
  describe("getClientIpFromRequest", () => {
    it("uses x-real-ip when present", () => {
      const req = requestWithHeaders({ "x-real-ip": " 192.168.1.1 " });
      expect(getClientIpFromRequest(req)).toBe("192.168.1.1");
    });

    it("uses first entry of x-forwarded-for when x-real-ip missing", () => {
      const req = requestWithHeaders({
        "x-forwarded-for": "10.0.0.1, 10.0.0.2",
      });
      expect(getClientIpFromRequest(req)).toBe("10.0.0.1");
    });

    it("uses x-vercel-forwarded-for when others missing", () => {
      const req = requestWithHeaders({ "x-vercel-forwarded-for": "1.2.3.4" });
      expect(getClientIpFromRequest(req)).toBe("1.2.3.4");
    });

    it("returns 0.0.0.0 when no proxy headers", () => {
      const req = requestWithHeaders({});
      expect(getClientIpFromRequest(req)).toBe("0.0.0.0");
    });
  });

  describe("getViewerIdFromRequest", () => {
    it("returns vid cookie value when present", () => {
      const req = requestWithHeaders({
        cookie: "vid=uuid-123; other=value",
      });
      expect(getViewerIdFromRequest(req)).toBe("uuid-123");
    });

    it("returns null when cookie header missing", () => {
      const req = requestWithHeaders({});
      expect(getViewerIdFromRequest(req)).toBeNull();
    });

    it("returns null when vid cookie missing", () => {
      const req = requestWithHeaders({ cookie: "other=value" });
      expect(getViewerIdFromRequest(req)).toBeNull();
    });
  });

  describe("getViewerIdentity", () => {
    it("uses viewer id from cookie when present", () => {
      const req = requestWithHeaders({
        cookie: "vid=my-viewer-id",
        "x-real-ip": "1.2.3.4",
      });
      expect(getViewerIdentity(req)).toEqual({
        viewerId: "my-viewer-id",
        ip: "1.2.3.4",
      });
    });

    it("falls back to ip when vid cookie missing", () => {
      const req = requestWithHeaders({ "x-real-ip": "1.2.3.4" });
      expect(getViewerIdentity(req)).toEqual({
        viewerId: "1.2.3.4",
        ip: "1.2.3.4",
      });
    });
  });

  describe("getOriginFromRequest", () => {
    it("returns Origin header when present", () => {
      const req = requestWithHeaders({ origin: "https://app.example.com" });
      expect(getOriginFromRequest(req)).toBe("https://app.example.com");
    });

    it("derives origin from Referer when Origin missing", () => {
      const req = requestWithHeaders({
        referer: "https://app.example.com/video/abc",
      });
      expect(getOriginFromRequest(req)).toBe("https://app.example.com");
    });

    it("returns null when both missing", () => {
      const req = requestWithHeaders({});
      expect(getOriginFromRequest(req)).toBeNull();
    });
  });

  describe("isAllowedRequestOrigin", () => {
    beforeEach(() => {
      process.env.APP_ORIGIN_ALLOWLIST =
        "https://app.example.com,https://other.example.com";
    });

    afterEach(() => {
      delete process.env.APP_ORIGIN_ALLOWLIST;
    });

    it("returns true when request has no origin", () => {
      const req = requestWithHeaders({});
      expect(isAllowedRequestOrigin(req)).toBe(true);
    });

    it("returns true when origin is in allowlist", () => {
      const req = requestWithHeaders({
        origin: "https://app.example.com",
      });
      expect(isAllowedRequestOrigin(req)).toBe(true);
    });

    it("returns false when origin is not in allowlist", () => {
      const req = requestWithHeaders({
        origin: "https://evil.com",
      });
      expect(isAllowedRequestOrigin(req)).toBe(false);
    });
  });
});
