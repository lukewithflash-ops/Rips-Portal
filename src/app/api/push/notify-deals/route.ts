import { NextResponse } from "next/server";
import { listUnderEvDeals } from "@/lib/dealAlerts";
import {
  getLastNotifiedIds,
  listSubscriptions,
  redisConfigured,
  removeSubscription,
  setLastNotifiedIds,
} from "@/lib/pushStore";
import {
  sendWebPush,
  vapidServerConfigured,
} from "@/lib/webPushServer";

export const runtime = "nodejs";
export const maxDuration = 60;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") || "";
  if (auth === `Bearer ${secret}`) return true;
  const headerSecret = req.headers.get("x-cron-secret");
  if (headerSecret === secret) return true;
  return false;
}

function snapshotChanged(current: string[], previous: string[]): boolean {
  if (current.length !== previous.length) return true;
  const prev = new Set(previous);
  return current.some((id) => !prev.has(id));
}

function newSinceLast(current: string[], previous: string[]): string[] {
  if (!previous.length) return current;
  const prev = new Set(previous);
  return current.filter((id) => !prev.has(id));
}

async function runNotify(): Promise<NextResponse> {
  if (!redisConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "push_store_unavailable",
        message:
          "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
      },
      { status: 503 }
    );
  }
  if (!vapidServerConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "vapid_unavailable",
        message: "Set VAPID_PRIVATE_KEY and VAPID_SUBJECT.",
      },
      { status: 503 }
    );
  }

  const deals = listUnderEvDeals();
  const currentIds = deals.map((d) => d.id).sort();
  const lastIds = await getLastNotifiedIds();

  // First cron after deploy: store baseline without blasting all subscribers.
  if (!lastIds.length) {
    await setLastNotifiedIds(currentIds);
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "seeded_baseline",
      dealCount: currentIds.length,
    });
  }

  if (!snapshotChanged(currentIds, lastIds)) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "unchanged",
      dealCount: currentIds.length,
    });
  }

  const freshIds = newSinceLast(currentIds, lastIds);
  const freshDeals = deals.filter((d) => freshIds.includes(d.id));
  const highlight = (freshDeals.length ? freshDeals : deals).slice(0, 3);

  const title =
    freshDeals.length === 1
      ? "New under-EV deal"
      : freshDeals.length > 1
        ? `${freshDeals.length} new under-EV deals`
        : currentIds.length
          ? "Under-EV deals updated"
          : "Under-EV Watch";

  const body =
    highlight
      .map((d) => `${d.name} · ${d.roi >= 0 ? "+" : ""}${d.roi.toFixed(0)}% ROI`)
      .join(" · ") || "Catalog under-EV list changed — open Deals.";

  const subs = await listSubscriptions();
  let sent = 0;
  let pruned = 0;
  let failed = 0;

  for (const sub of subs) {
    const result = await sendWebPush(sub, {
      title,
      body,
      url: "/deals",
    });
    if (result.ok) {
      sent += 1;
    } else if (result.gone) {
      await removeSubscription(sub.endpoint);
      pruned += 1;
    } else {
      failed += 1;
    }
  }

  await setLastNotifiedIds(currentIds);

  return NextResponse.json({
    ok: true,
    dealCount: currentIds.length,
    freshCount: freshIds.length,
    subscribers: subs.length,
    sent,
    pruned,
    failed,
  });
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  try {
    return await runNotify();
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: "notify_failed",
        detail: err instanceof Error ? err.message : "unknown",
      },
      { status: 500 }
    );
  }
}

/** Vercel Cron uses GET by default for cron invocations. */
export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  try {
    return await runNotify();
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: "notify_failed",
        detail: err instanceof Error ? err.message : "unknown",
      },
      { status: 500 }
    );
  }
}
