/**
 * Minimal signed-cookie sessions + one-time sign-in tokens (HMAC-SHA256).
 * No third-party auth service. The only identity is an email address.
 */
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "rp_session";
const SESSION_DAYS = 30;
const LINK_MINUTES = 20;

function secret(): string | null {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  const stripe = process.env.STRIPE_SECRET_KEY;
  if (stripe) {
    return createHash("sha256").update(`rip-portal-session:${stripe}`).digest("hex");
  }
  return null;
}

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString("base64url");
}

function sign(payload: object): string | null {
  const key = secret();
  if (!key) return null;
  const body = b64url(JSON.stringify(payload));
  const mac = createHmac("sha256", key).update(body).digest("base64url");
  return `${body}.${mac}`;
}

function verify<T extends { exp: number }>(token: string | undefined | null): T | null {
  const key = secret();
  if (!key || !token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = createHmac("sha256", key).update(body).digest();
  let given: Buffer;
  try {
    given = Buffer.from(mac, "base64url");
  } catch {
    return null;
  }
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
    if (!payload || typeof payload.exp !== "number" || payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function normalizeEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return null;
  return email;
}

type SessionPayload = { k: "s"; e: string; exp: number };
type LinkPayload = { k: "l"; e: string; n: string; exp: number };

export function createSessionToken(email: string): string | null {
  return sign({ k: "s", e: email, exp: Date.now() + SESSION_DAYS * 86400_000 });
}

export function createSignInToken(email: string): { token: string; nonce: string } | null {
  const nonce = randomBytes(16).toString("hex");
  const token = sign({ k: "l", e: email, n: nonce, exp: Date.now() + LINK_MINUTES * 60_000 });
  return token ? { token, nonce } : null;
}

export function readSignInToken(token: string): LinkPayload | null {
  const p = verify<LinkPayload>(token);
  return p && p.k === "l" && typeof p.e === "string" && typeof p.n === "string" ? p : null;
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DAYS * 86400,
};

/** Email of the signed-in visitor, or null. */
export async function currentEmail(): Promise<string | null> {
  const jar = await cookies();
  const p = verify<SessionPayload>(jar.get(SESSION_COOKIE)?.value);
  return p && p.k === "s" && typeof p.e === "string" ? p.e : null;
}
