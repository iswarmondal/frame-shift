import { createHmac, timingSafeEqual } from "node:crypto";

const ALG = "sha256";
const SEP = ".";
const TTL_MS = 60_000; // 1 minute: token valid only briefly after page load

function base64urlEncode(buf: Buffer): string {
  return buf.toString("base64url");
}

function base64urlDecode(str: string): Buffer | null {
  try {
    return Buffer.from(str, "base64url");
  } catch {
    return null;
  }
}

function getSecret(): string {
  const secret = process.env.VIEW_TOKEN_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "VIEW_TOKEN_SECRET must be set and at least 16 characters (use a random string for production)"
    );
  }
  return secret;
}

export type ViewTokenPayload = {
  hash: string;
  exp: number;
  jti: string;
};

/**
 * Create a short-lived signed token for one view. Issued by the server on page render.
 */
export function createViewToken(hash: string): string {
  const secret = getSecret();
  const exp = Date.now() + TTL_MS;
  const jti = crypto.randomUUID();
  const payload: ViewTokenPayload = { hash, exp, jti };
  const payloadB64 = base64urlEncode(
    Buffer.from(JSON.stringify(payload), "utf8")
  );
  const sig = createHmac(ALG, secret)
    .update(payloadB64)
    .digest();
  const sigB64 = base64urlEncode(sig);
  return `${payloadB64}${SEP}${sigB64}`;
}

/**
 * Verify token and return payload if valid. Checks signature and expiry.
 * Returns null if invalid or expired.
 */
export function verifyViewToken(
  token: string,
  expectedHash: string
): ViewTokenPayload | null {
  const secret = getSecret();
  const i = token.lastIndexOf(SEP);
  if (i === -1) return null;
  const payloadB64 = token.slice(0, i);
  const sigB64 = token.slice(i + 1);
  const sig = base64urlDecode(sigB64);
  const payloadBuf = base64urlDecode(payloadB64);
  if (!sig || !payloadBuf) return null;

  const expectedSig = createHmac(ALG, secret).update(payloadB64).digest();
  if (sig.length !== expectedSig.length || !timingSafeEqual(sig, expectedSig)) {
    return null;
  }

  let payload: ViewTokenPayload;
  try {
    payload = JSON.parse(payloadBuf.toString("utf8")) as ViewTokenPayload;
  } catch {
    return null;
  }

  if (
    typeof payload.hash !== "string" ||
    typeof payload.exp !== "number" ||
    typeof payload.jti !== "string"
  ) {
    return null;
  }
  if (payload.hash !== expectedHash) return null;
  if (payload.exp < Date.now()) return null; // expired

  return payload;
}
