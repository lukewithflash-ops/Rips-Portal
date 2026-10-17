import { NextResponse } from "next/server";
import { isValidApnsToken, removeApnsToken } from "@/lib/apnsStore";
import { vipRedisConfigured } from "@/lib/vip/redis";

export const runtime = "nodejs";

/** iPhone app: stop alerts for this device. */
export async function POST(req: Request) {
  if (!vipRedisConfigured()) {
    return NextResponse.json({ ok: false, error: "push_store_unavailable" }, { status: 503 });
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
  await removeApnsToken(token).catch(() => undefined);
  return NextResponse.json({ ok: true });
}
