import { NextResponse } from "next/server";
import { runUnderEvFlipEmails } from "@/lib/underEvEmail";

export const runtime = "nodejs";
export const maxDuration = 60;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") || "";
  if (auth === `Bearer ${secret}`) return true;
  const headerSecret = req.headers.get("x-cron-secret");
  return headerSecret === secret;
}

async function run(): Promise<NextResponse> {
  try {
    const result = await runUnderEvFlipEmails();
    const status = result.ok || result.reason === "waiting_on_provider" ? 200 : 503;
    return NextResponse.json(result, { status: result.reason === "redis_not_configured" ? 503 : status });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        live: false,
        reason: "flip_email_failed",
        detail: err instanceof Error ? err.message : "unknown",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return run();
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return run();
}
