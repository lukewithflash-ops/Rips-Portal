/**
 * VIP account records in Upstash Redis.
 *   vip:user:<email>        JSON VipRecord
 *   vip:customer:<cus_id>   email
 */
import { vipRedis, vipRedisConfigured } from "@/lib/vip/redis";

export type VipRecord = {
  email: string;
  vip: boolean;
  customerId?: string;
  subscriptionId?: string;
  /** Last Stripe event that changed this record. */
  lastEvent?: string;
  updatedAt: string;
};

const userKey = (email: string) => `vip:user:${email}`;
const customerKey = (id: string) => `vip:customer:${id}`;

export async function getVipRecord(email: string): Promise<VipRecord | null> {
  if (!vipRedisConfigured()) return null;
  const raw = await vipRedis<string | null>(["GET", userKey(email)]);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as VipRecord;
  } catch {
    return null;
  }
}

export async function isVip(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  try {
    return Boolean((await getVipRecord(email))?.vip);
  } catch {
    return false;
  }
}

export async function emailForCustomer(customerId: string): Promise<string | null> {
  if (!vipRedisConfigured() || !customerId) return null;
  return (await vipRedis<string | null>(["GET", customerKey(customerId)])) || null;
}

export async function setVip(
  email: string,
  vip: boolean,
  extra: { customerId?: string; subscriptionId?: string; event?: string } = {}
): Promise<VipRecord> {
  const prev = await getVipRecord(email);
  const next: VipRecord = {
    email,
    vip,
    customerId: extra.customerId || prev?.customerId,
    subscriptionId: extra.subscriptionId || prev?.subscriptionId,
    lastEvent: extra.event || prev?.lastEvent,
    updatedAt: new Date().toISOString(),
  };
  await vipRedis(["SET", userKey(email), JSON.stringify(next)]);
  if (next.customerId) {
    await vipRedis(["SET", customerKey(next.customerId), email]);
  }
  return next;
}

/** Set of VIP emails among the given addresses (for flip-email filtering). */
export async function filterVipEmails(emails: string[]): Promise<Set<string>> {
  const out = new Set<string>();
  if (!vipRedisConfigured() || !emails.length) return out;
  const keys = emails.map(userKey);
  const raws = await vipRedis<(string | null)[]>(["MGET", ...keys]);
  raws?.forEach((raw, i) => {
    if (!raw) return;
    try {
      if ((JSON.parse(raw) as VipRecord).vip) out.add(emails[i]!);
    } catch {
      /* skip */
    }
  });
  return out;
}

/** One-time use for sign-in link nonces. Returns true the first time only. */
export async function claimNonce(nonce: string): Promise<boolean> {
  const r = await vipRedis<string | null>(["SET", `auth:used:${nonce}`, "1", "NX", "EX", 3600]);
  return r === "OK";
}

/** Simple per-email throttle for sign-in emails: 5 per 10 minutes. */
export async function allowSignInEmail(email: string): Promise<boolean> {
  const key = `auth:rl:${email}`;
  const n = await vipRedis<number>(["INCR", key]);
  if (n === 1) await vipRedis(["EXPIRE", key, 600]);
  return n <= 5;
}
