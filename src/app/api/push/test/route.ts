import { NextResponse } from "next/server";
import { cronAuthorized } from "@/lib/cronAuth";
import { listSubscriptions, redisConfigured } from "@/lib/pushStore";
import { sendPushToSubscriptions } from "@/lib/underEvPush";
import { missingVapidEnv, vapidServerConfigured } from "@/lib/webPushServer";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Admin check: sends one test notification to every saved subscription.
 * Protected by CRON_SECRET:
 *   curl -X POST https://www.ripsportal.com/api/push/test \
 *     -H "Authorization: Bearer $CRON_SECRET"
 */
async function run(): Promise<NextResponse> {
  if (!redisConfigured()) {
    return NextResponse.json(
      { ok: false, error: "push_store_unavailable" },
      { status: 503 }
    );
  }
  if (!vapidServerConfigured()) {
    return NextResponse.json(
      { ok: false, error: "vapid_unavailable", missing: missingVapidEnv() },
      { status: 503 }
    );
  }
  const subs = await listSubscriptions();
  const result = await sendPushToSubscriptions(subs, {
    title: "Rip Portal test alert",
    body: "Alerts are working. You'll hear from us when an Under-EV row flips.",
    url: "/deals",
    tag: "rip-portal-test",
  });
  return NextResponse.json(
    { ok: result.failed === 0, ...result },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: Request) {
  if (!cronAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return run();
}

export async function GET(req: Request) {
  if (!cronAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return run();
}
