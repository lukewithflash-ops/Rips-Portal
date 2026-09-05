import { NextResponse } from "next/server";
import {
  redisConfigured,
  removeSubscription,
  type PushSubscriptionJSON,
} from "@/lib/pushStore";

export const runtime = "nodejs";

type Body = {
  endpoint?: string;
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

  const endpoint = body.endpoint || body.subscription?.endpoint;
  if (!endpoint || typeof endpoint !== "string") {
    return NextResponse.json(
      { ok: false, error: "missing_endpoint" },
      { status: 400 }
    );
  }

  try {
    await removeSubscription(endpoint);
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
