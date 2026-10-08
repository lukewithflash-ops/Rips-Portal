import { NextResponse } from "next/server";
import { signInEmailConfigured, vipLive } from "@/lib/vip/config";
import { createSignInToken, normalizeEmail } from "@/lib/vip/session";
import { allowSignInEmail } from "@/lib/vip/store";

export const runtime = "nodejs";

/** Email a one-time sign-in link (20 minutes). Needs RESEND_API_KEY + RESEND_FROM. */
export async function POST(req: Request) {
  if (!vipLive() || !signInEmailConfigured()) {
    return NextResponse.json(
      { ok: false, error: "sign_in_email_disabled", message: "Emailed sign-in links are not switched on yet." },
      { status: 503 }
    );
  }
  let email: string | null = null;
  try {
    const body = (await req.json()) as { email?: string };
    email = normalizeEmail(body.email || "");
  } catch {
    /* fallthrough */
  }
  if (!email) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }
  if (!(await allowSignInEmail(email).catch(() => false))) {
    return NextResponse.json({ ok: false, error: "too_many_requests" }, { status: 429 });
  }
  const signed = createSignInToken(email);
  if (!signed) {
    return NextResponse.json({ ok: false, error: "auth_secret_missing" }, { status: 503 });
  }
  const link = `${new URL(req.url).origin}/api/auth/verify?token=${encodeURIComponent(signed.token)}`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM,
      to: [email],
      subject: "Your Rip Portal sign-in link",
      text: [
        "Tap to sign in to Rip Portal:",
        link,
        "",
        "The link works once and expires in 20 minutes.",
        "If you didn't ask for this, ignore this email.",
      ].join("\n"),
    }),
  }).catch(() => null);
  if (!res?.ok) {
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
