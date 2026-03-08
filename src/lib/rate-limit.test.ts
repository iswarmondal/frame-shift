import { describe, it, expect } from "vitest";
import {
  getViewApiHashFromPath,
  isViewApiPath,
  getClientIp,
} from "./rate-limit";

describe("rate-limit", () => {
  describe("getViewApiHashFromPath", () => {
    it("extracts hash from /api/video/<hash>/view", () => {
      expect(getViewApiHashFromPath("/api/video/abc123/view")).toBe("abc123");
      expect(getViewApiHashFromPath("/api/video/xyz/view")).toBe("xyz");
    });

    it("returns null for non-view paths", () => {
      expect(getViewApiHashFromPath("/api/video/view")).toBeNull();
      expect(getViewApiHashFromPath("/api/video/")).toBeNull();
      expect(getViewApiHashFromPath("/video/abc/view")).toBeNull();
      expect(getViewApiHashFromPath("/api/video/abc/other")).toBeNull();
    });
  });

  describe("isViewApiPath", () => {
    it("returns true for view API path", () => {
      expect(isViewApiPath("/api/video/abc123/view")).toBe(true);
    });

    it("returns false for other paths", () => {
      expect(isViewApiPath("/api/video/view")).toBe(false);
      expect(isViewApiPath("/dashboard")).toBe(false);
    });
  });

  describe("getClientIp", () => {
    it("prefers x-real-ip and normalizes IP", () => {
      const request = {
        headers: new Headers({ "x-real-ip": " 10.0.0.1 " }),
        ip: undefined,
      } as unknown as import("next/server").NextRequest;
      expect(getClientIp(request)).toBe("10.0.0.1");
    });

    it("returns 0.0.0.0 when no proxy headers", () => {
      const request = {
        headers: new Headers(),
      } as unknown as import("next/server").NextRequest;
      expect(getClientIp(request)).toBe("0.0.0.0");
    });
  });
});
