import { NextResponse } from "next/server";
import { apnsConfigured } from "@/lib/apns";
import { isValidApnsToken, saveApnsToken } from "@/lib/apnsStore";
import { vipRedisConfigured } from "@/lib/vip/redis";
import { currentEmail } from "@/lib/vip/session";

export const runtime = "nodejs";

/** iPhone app: save this device's APNs token so it gets Under-EV flip alerts. */
export async function POST(req: Request) {
  if (!vipRedisConfigured() || !apnsConfigured()) {
    return NextResponse.json({ ok: false, error: "push_disabled" }, { status: 503 });
  }
  let token: unknown;
  try {
    token = ((await req.json()) as { token?: unknown }).token;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (!isValidApnsToken(token)) {
    return NextResponse.json({ ok: false, error: "invalid_token" }, { status: 400 });
  }
  const email = await currentEmail().catch(() => null);
  try {
    await saveApnsToken(token, email);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "store_failed" }, { status: 502 });
  }
}
