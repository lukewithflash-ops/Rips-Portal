/**
 * Minimal Upstash Redis REST call for VIP accounts. Uses the same
 * UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN as Web Push.
 */
export function vipRedisConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

export async function vipRedis<T = unknown>(
  command: (string | number)[]
): Promise<T> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("redis_not_configured");
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
