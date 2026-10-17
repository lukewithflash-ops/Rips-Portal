import { NextResponse } from "next/server";
import { redisConfigured } from "@/lib/pushStore";
import { vapidServerConfigured } from "@/lib/webPushServer";
import { apnsConfigured } from "@/lib/apns";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Whether background alerts can be turned on. Booleans only, never keys. */
export async function GET() {
  const store = redisConfigured();
  const keys = vapidServerConfigured();
  const apns = store && apnsConfigured();
  return NextResponse.json(
    { ok: true, enabled: store && keys, store, keys, apns },
    { headers: { "Cache-Control": "no-store" } }
  );
}
