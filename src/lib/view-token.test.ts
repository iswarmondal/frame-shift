import { createHmac } from "node:crypto";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createViewToken, verifyViewToken } from "./view-token";

const FAKE_SECRET = "test-secret-at-least-16chars";

describe("view token", () => {
  beforeEach(() => {
    process.env.VIEW_TOKEN_SECRET = FAKE_SECRET;
  });

  afterEach(() => {
    delete process.env.VIEW_TOKEN_SECRET;
  });

  describe("createViewToken + verifyViewToken", () => {
    it("returns payload when token is valid and hash matches", () => {
      const hash = "abc123";
      const token = createViewToken(hash);
      const payload = verifyViewToken(token, hash);
      expect(payload).not.toBeNull();
      expect(payload!.hash).toBe(hash);
      expect(payload!.jti).toBeDefined();
      expect(typeof payload!.exp).toBe("number");
    });

    it("returns null when expectedHash does not match token hash", () => {
      const token = createViewToken("hash1");
      expect(verifyViewToken(token, "hash2")).toBeNull();
    });

    it("returns null when token is tampered (payload changed)", () => {
      const hash = "abc";
      const token = createViewToken(hash);
      const [payloadB64, sigB64] = token.split(".");
      const badPayload = Buffer.from(
        JSON.stringify({ hash: "other", exp: Date.now() + 1e6, jti: "x" }),
        "utf8"
      ).toString("base64url");
      const tampered = `${badPayload}.${sigB64}`;
      expect(verifyViewToken(tampered, "other")).toBeNull();
    });

    it("returns null when token is empty or malformed", () => {
      expect(verifyViewToken("", "h")).toBeNull();
      expect(verifyViewToken("no-dot", "h")).toBeNull();
      expect(verifyViewToken("a.b.c", "h")).toBeNull();
    });

    it("returns null when token is expired", () => {
      const hash = "abc";
      const payload = {
        hash,
        exp: Date.now() - 1000,
        jti: "test-jti",
      };
      const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString(
        "base64url"
      );
      const sig = createHmac("sha256", FAKE_SECRET)
        .update(payloadB64)
        .digest();
      const expiredToken = `${payloadB64}.${sig.toString("base64url")}`;
      expect(verifyViewToken(expiredToken, hash)).toBeNull();
    });
  });
});
