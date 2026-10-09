import { NextResponse } from "next/server";
import { cronAuthorized } from "@/lib/cronAuth";
import { runUnderEvFlipPush, type FlipPushResult } from "@/lib/underEvPush";
import { runUnderEvFlipEmails, type FlipRunResult } from "@/lib/underEvEmail";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Monday cron: checks whether any Under-EV row flipped since last time and,
 * only if so, sends Web Push and flip email. Quiet weeks send nothing.
 */
async function run(): Promise<NextResponse> {
  let push: FlipPushResult | { ok: false; reason: string; detail?: string };
  let email: FlipRunResult | { ok: false; reason: string; detail?: string };
  try {
    push = await runUnderEvFlipPush();
  } catch (err) {
    push = {
      ok: false,
      reason: "push_failed",
      detail: err instanceof Error ? err.message : "unknown",
    };
  }
  try {
    email = await runUnderEvFlipEmails();
  } catch (err) {
    email = {
      ok: false,
      reason: "email_failed",
      detail: err instanceof Error ? err.message : "unknown",
    };
  }
  return NextResponse.json(
    { ok: push.ok && email.ok, push, email },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: Request) {
  if (!cronAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return run();
}

/** Vercel Cron uses GET. */
export async function GET(req: Request) {
  if (!cronAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return run();
}
