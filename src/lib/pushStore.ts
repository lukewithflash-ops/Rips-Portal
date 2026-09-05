/**
 * Upstash Redis REST helpers for Web Push subscriptions.
 * Requires UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.
 */

export type PushSubscriptionJSON = {
  endpoint: string;
  expirationTime?: number | null;
  keys?: { p256dh?: string; auth?: string };
};

const SUBS_KEY = "push:subscriptions";
const LAST_NOTIFIED_KEY = "push:last-notified-ids";

export function redisConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

async function redisCommand<T = unknown>(
  command: (string | number)[]
): Promise<T> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("redis_not_configured");
  }
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`upstash_${res.status}:${text.slice(0, 160)}`);
  }
  const json = (await res.json()) as { result: T };
  return json.result;
}

function isValidSub(raw: unknown): raw is PushSubscriptionJSON {
  if (!raw || typeof raw !== "object") return false;
  const s = raw as PushSubscriptionJSON;
  return typeof s.endpoint === "string" && s.endpoint.startsWith("http");
}

export async function listSubscriptions(): Promise<PushSubscriptionJSON[]> {
  const members = await redisCommand<string[]>(["SMEMBERS", SUBS_KEY]);
  if (!Array.isArray(members)) return [];
  const out: PushSubscriptionJSON[] = [];
  for (const m of members) {
    try {
      const parsed = JSON.parse(m) as unknown;
      if (isValidSub(parsed)) out.push(parsed);
    } catch {
      /* skip corrupt */
    }
  }
  return out;
}

/** Upsert by endpoint: remove any prior JSON for same endpoint, then SADD. */
export async function saveSubscription(
  sub: PushSubscriptionJSON
): Promise<void> {
  if (!isValidSub(sub)) throw new Error("invalid_subscription");
  const members = await redisCommand<string[]>(["SMEMBERS", SUBS_KEY]);
  if (Array.isArray(members)) {
    for (const m of members) {
      try {
        const parsed = JSON.parse(m) as PushSubscriptionJSON;
        if (parsed?.endpoint === sub.endpoint) {
          await redisCommand(["SREM", SUBS_KEY, m]);
        }
      } catch {
        /* ignore */
      }
    }
  }
  const json = JSON.stringify({
    endpoint: sub.endpoint,
    expirationTime: sub.expirationTime ?? null,
    keys: sub.keys ?? {},
  });
  await redisCommand(["SADD", SUBS_KEY, json]);
}

export async function removeSubscription(
  endpointOrSub: string | PushSubscriptionJSON
): Promise<void> {
  const endpoint =
    typeof endpointOrSub === "string"
      ? endpointOrSub
      : endpointOrSub.endpoint;
  if (!endpoint) return;
  const members = await redisCommand<string[]>(["SMEMBERS", SUBS_KEY]);
  if (!Array.isArray(members)) return;
  for (const m of members) {
    try {
      const parsed = JSON.parse(m) as PushSubscriptionJSON;
      if (parsed?.endpoint === endpoint) {
        await redisCommand(["SREM", SUBS_KEY, m]);
      }
    } catch {
      /* also try exact string match */
      if (m.includes(endpoint)) await redisCommand(["SREM", SUBS_KEY, m]);
    }
  }
}

export async function getLastNotifiedIds(): Promise<string[]> {
  const raw = await redisCommand<string | null>(["GET", LAST_NOTIFIED_KEY]);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    /* ignore */
  }
  return [];
}

export async function setLastNotifiedIds(ids: string[]): Promise<void> {
  await redisCommand([
    "SET",
    LAST_NOTIFIED_KEY,
    JSON.stringify([...ids].sort()),
  ]);
}
