import { NextResponse } from "next/server";

const INBOX = "lukewithflash@gmail.com";
const FORMSUBMIT_URL = `https://formsubmit.co/ajax/${INBOX}`;

type Body = {
  email?: string;
  interests?: string[];
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendViaResend(
  email: string,
  interests: string[],
  timestamp: string
): Promise<{ ok: boolean; needsActivation?: boolean; detail?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, detail: "no_resend_key" };

  const interestLine = interests.length
    ? interests.join(", ")
    : "(none selected)";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Rip Portal Waitlist <onboarding@resend.dev>",
      to: [INBOX],
      subject: `Portal Waitlist: ${email}`,
      text: [
        "New Portal waitlist signup",
        "",
        `Email: ${email}`,
        `Interests: ${interestLine}`,
        `Timestamp: ${timestamp}`,
        "",
        "— ripsportal.com/waitlist",
      ].join("\n"),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, detail: text.slice(0, 200) || `resend_${res.status}` };
  }
  return { ok: true };
}

async function sendViaFormSubmit(
  email: string,
  interests: string[],
  timestamp: string
): Promise<{ ok: boolean; needsActivation?: boolean; detail?: string }> {
  const interestLine = interests.length
    ? interests.join(", ")
    : "(none selected)";

  const res = await fetch(FORMSUBMIT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: `Portal Waitlist: ${email}`,
      email,
      interests: interestLine,
      timestamp,
      message: `Waitlist signup from ${email}. Interests: ${interestLine}. At: ${timestamp}`,
      _template: "table",
      _captcha: "false",
    }),
  });

  const text = await res.text().catch(() => "");
  let json: { success?: string | boolean; message?: string; error?: string } = {};
  try {
    json = text ? (JSON.parse(text) as typeof json) : {};
  } catch {
    /* non-json */
  }

  const combined = `${json.message || ""} ${json.error || ""} ${text}`.toLowerCase();
  const needsActivation =
    combined.includes("confirm") ||
    combined.includes("activation") ||
    combined.includes("activate") ||
    combined.includes("check your email");

  if (needsActivation) {
    return {
      ok: true,
      needsActivation: true,
      detail: json.message || text.slice(0, 240),
    };
  }

  if (!res.ok) {
    return {
      ok: false,
      detail: json.message || json.error || text.slice(0, 200) || `formsubmit_${res.status}`,
    };
  }

  // FormSubmit often returns { success: "..." } or success: true
  if (json.error && !json.success) {
    return { ok: false, detail: String(json.error) };
  }

  return { ok: true, detail: typeof json.success === "string" ? json.success : undefined };
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  const interests = Array.isArray(body.interests)
    ? body.interests.map(String).slice(0, 20)
    : [];

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const timestamp = new Date().toISOString();

  // Prefer Resend when key is present; fall back to FormSubmit.
  if (process.env.RESEND_API_KEY) {
    const viaResend = await sendViaResend(email, interests, timestamp);
    if (viaResend.ok) {
      return NextResponse.json({
        ok: true,
        provider: "resend",
        timestamp,
      });
    }
    // Fall through to FormSubmit if Resend fails
  }

  try {
    const viaFs = await sendViaFormSubmit(email, interests, timestamp);
    if (viaFs.ok) {
      return NextResponse.json({
        ok: true,
        provider: "formsubmit",
        needsActivation: Boolean(viaFs.needsActivation),
        message: viaFs.needsActivation
          ? "Check lukewithflash@gmail.com and confirm FormSubmit’s activation email so waitlist forwards start delivering."
          : undefined,
        timestamp,
      });
    }
    return NextResponse.json(
      { ok: false, error: "forward_failed", detail: viaFs.detail },
      { status: 502 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: "forward_exception",
        detail: err instanceof Error ? err.message : "unknown",
      },
      { status: 502 }
    );
  }
}
