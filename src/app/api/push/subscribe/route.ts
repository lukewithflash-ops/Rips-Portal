import { NextResponse } from "next/server";
import {
  redisConfigured,
  saveSubscription,
  type PushSubscriptionJSON,
} from "@/lib/pushStore";

export const runtime = "nodejs";

type Body = {
  subscription?: PushSubscriptionJSON;
};

export async function POST(req: Request) {
  if (!redisConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "push_store_unavailable",
        message:
          "Web Push storage is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN on the server.",
      },
      { status: 503 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const sub = body.subscription;
  if (
    !sub?.endpoint ||
    typeof sub.endpoint !== "string" ||
    !sub.keys?.p256dh ||
    !sub.keys?.auth
  ) {
    return NextResponse.json(
      { ok: false, error: "invalid_subscription" },
      { status: 400 }
    );
  }

  try {
    await saveSubscription({
      endpoint: sub.endpoint,
      expirationTime: sub.expirationTime ?? null,
      keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: "store_failed",
        detail: err instanceof Error ? err.message : "unknown",
      },
      { status: 502 }
    );
  }
}
