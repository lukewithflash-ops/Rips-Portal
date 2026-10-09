import { NextResponse } from "next/server";
import { redisConfigured } from "@/lib/pushStore";
import { vapidServerConfigured } from "@/lib/webPushServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Whether background alerts can be turned on. Booleans only, never keys. */
export async function GET() {
  const store = redisConfigured();
  const keys = vapidServerConfigured();
  return NextResponse.json(
    { ok: true, enabled: store && keys, store, keys },
    { headers: { "Cache-Control": "no-store" } }
  );
}
