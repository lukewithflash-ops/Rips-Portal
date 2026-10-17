/**
 * Native iPhone app push tokens in Upstash Redis (same URL/token as Web Push).
 *   apns:tokens  HASH  <deviceToken> -> JSON { token, email, at }
 */
import { vipRedis, vipRedisConfigured } from "@/lib/vip/redis";

export type ApnsDevice = { token: string; email: string | null; at: string };

const KEY = "apns:tokens";

export function isValidApnsToken(t: unknown): t is string {
  return typeof t === "string" && /^[0-9a-fA-F]{64,200}$/.test(t);
}

export async function saveApnsToken(token: string, email: string | null): Promise<void> {
  const rec: ApnsDevice = { token: token.toLowerCase(), email, at: new Date().toISOString() };
  await vipRedis(["HSET", KEY, rec.token, JSON.stringify(rec)]);
}

export async function removeApnsToken(token: string): Promise<void> {
  await vipRedis(["HDEL", KEY, token.toLowerCase()]);
}

export async function listApnsDevices(): Promise<ApnsDevice[]> {
  if (!vipRedisConfigured()) return [];
  const flat = await vipRedis<string[] | null>(["HGETALL", KEY]);
  const out: ApnsDevice[] = [];
  if (!Array.isArray(flat)) return out;
  for (let i = 1; i < flat.length; i += 2) {
    try {
      const d = JSON.parse(flat[i]!) as ApnsDevice;
      if (isValidApnsToken(d?.token)) out.push(d);
    } catch {
      /* skip corrupt */
    }
  }
  return out;
}

/** Account deletion: drop every device saved with this email. */
export async function removeApnsTokensByEmail(email: string): Promise<number> {
  const target = email.trim().toLowerCase();
  let n = 0;
  for (const d of await listApnsDevices()) {
    if ((d.email || "").toLowerCase() === target) {
      await removeApnsToken(d.token);
      n += 1;
    }
  }
  return n;
}
