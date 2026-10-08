/**
 * Under-EV flip email.
 *
 * Sends only when a catalog row enters or leaves Under-EV (profit > 0 at the
 * sheet price). A quiet check sends nothing.
 *
 * Live sending stays off until ALL of these are set on Vercel (production):
 *   UNDER_EV_FLIP_EMAIL=1
 *   RESEND_API_KEY          Resend API key (https://resend.com) — not created here
 *   RESEND_FROM             Verified sender, e.g. Rip Portal <alerts@ripsportal.com>
 *
 * Subscribers are waitlist emails whose interests include "deals", stored in
 * the existing Upstash Redis (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN).
 * Older waitlist forwards only landed in lukewithflash@gmail.com and are not
 * in Redis unless that person signs up again.
 *
 * The Monday cron (/api/push/notify-deals) runs this check. It also has its
 * own route: /api/email/under-ev-flips (CRON_SECRET).
 */
import { randomBytes } from "node:crypto";
import { listUnderEvDeals } from "@/lib/dealAlerts";
import { findProduct, productDisplayName, calculateEV } from "@/lib/products";
import { redisConfigured } from "@/lib/pushStore";
import { SITE_URL } from "@/lib/site";
import { vipLive } from "@/lib/vip/config";
import { filterVipEmails } from "@/lib/vip/store";

const SUBS_KEY = "email:under-ev-subs";
const SNAPSHOT_KEY = "email:under-ev-snapshot";

export type EmailSubscriber = {
  email: string;
  interests: string[];
  token: string;
  at: string;
};

function emailEnabled(): boolean {
  return (
    process.env.UNDER_EV_FLIP_EMAIL === "1" &&
    Boolean(process.env.RESEND_API_KEY) &&
    Boolean(process.env.RESEND_FROM)
  );
}

async function redis<T>(command: (string | number)[]): Promise<T> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("redis_not_configured");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`upstash_${res.status}:${text.slice(0, 160)}`);
  }
  const json = (await res.json()) as { result: T };
  return json.result;
}

function parseSub(raw: string): EmailSubscriber | null {
  try {
    const parsed = JSON.parse(raw) as EmailSubscriber;
    if (!parsed || typeof parsed.email !== "string" || !parsed.token) return null;
    return {
      email: parsed.email,
      interests: Array.isArray(parsed.interests) ? parsed.interests.map(String) : [],
      token: String(parsed.token),
      at: String(parsed.at || ""),
    };
  } catch {
    return null;
  }
}

export async function listSubscribers(): Promise<EmailSubscriber[]> {
  if (!redisConfigured()) return [];
  const members = await redis<string[]>(["SMEMBERS", SUBS_KEY]);
  if (!Array.isArray(members)) return [];
  const out: EmailSubscriber[] = [];
  for (const m of members) {
    const sub = parseSub(m);
    if (sub) out.push(sub);
  }
  return out;
}

/** Upsert a waitlist signup. Keeps the existing unsubscribe token. */
export async function saveWaitlistSubscriber(
  email: string,
  interests: string[]
): Promise<void> {
  if (!redisConfigured()) return;
  const normalized = email.trim().toLowerCase();
  const members = await redis<string[]>(["SMEMBERS", SUBS_KEY]);
  let token = randomBytes(24).toString("hex");
  let at = new Date().toISOString();
  if (Array.isArray(members)) {
    for (const m of members) {
      const sub = parseSub(m);
      if (sub?.email === normalized) {
        token = sub.token;
        at = sub.at || at;
        await redis(["SREM", SUBS_KEY, m]);
      }
    }
  }
  const next: EmailSubscriber = {
    email: normalized,
    interests: [...new Set(interests.map(String))].slice(0, 20),
    token,
    at,
  };
  await redis(["SADD", SUBS_KEY, JSON.stringify(next)]);
}

export async function removeSubscriberByToken(
  token: string
): Promise<boolean> {
  if (!redisConfigured() || !token) return false;
  const members = await redis<string[]>(["SMEMBERS", SUBS_KEY]);
  if (!Array.isArray(members)) return false;
  let removed = false;
  for (const m of members) {
    const sub = parseSub(m);
    if (sub?.token === token) {
      await redis(["SREM", SUBS_KEY, m]);
      removed = true;
    }
  }
  return removed;
}

async function getSnapshot(): Promise<string[] | null> {
  const raw = await redis<string | null>(["GET", SNAPSHOT_KEY]);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return parsed.map(String).sort();
  } catch {
    /* ignore */
  }
  return null;
}

async function setSnapshot(ids: string[]): Promise<void> {
  await redis(["SET", SNAPSHOT_KEY, JSON.stringify([...ids].sort())]);
}

function fmtMoney(n: number): string {
  const abs = Math.abs(n);
  const body = abs >= 100 ? abs.toFixed(0) : abs.toFixed(2);
  return `${n < 0 ? "-" : ""}$${body}`;
}

function lineForId(id: string, under: boolean): string {
  const product = findProduct(id);
  if (!product) return `- ${id}`;
  const { totalEV, roi, profit } = calculateEV(product, product.defaultPrice);
  const name = `${productDisplayName(product)} · ${product.format}`;
  const roiText = `${roi >= 0 ? "+" : ""}${roi.toFixed(1)}% ROI`;
  if (under) {
    return `- ${name} — catalog ${fmtMoney(product.defaultPrice)}, EV ${fmtMoney(totalEV)}, ${roiText}`;
  }
  return `- ${name} — now ${fmtMoney(product.defaultPrice)} vs EV ${fmtMoney(totalEV)} (${roiText}, edge ${fmtMoney(profit)})`;
}

async function sendResend(
  to: string,
  subject: string,
  text: string
): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
    }),
  });
  return res.ok;
}

export function unsubscribeUrl(token: string): string {
  return `${SITE_URL}/api/email/unsubscribe?token=${encodeURIComponent(token)}`;
}

export type FlipRunResult = {
  ok: boolean;
  live: boolean;
  skipped?: boolean;
  reason: string;
  entered?: string[];
  exited?: string[];
  subscribers?: number;
  sent?: number;
  failed?: number;
};

/**
 * Compare the current Under-EV set to the last snapshot.
 * Emails deal-alert subscribers only when something flipped, and only when
 * UNDER_EV_FLIP_EMAIL=1 plus Resend env vars are present.
 */
export async function runUnderEvFlipEmails(): Promise<FlipRunResult> {
  const live = emailEnabled();
  if (!redisConfigured()) {
    return { ok: false, live, reason: "redis_not_configured" };
  }

  const deals = listUnderEvDeals();
  const currentIds = deals.map((d) => d.id).sort();
  const snapshot = await getSnapshot();

  if (!snapshot) {
    if (!live) {
      return {
        ok: true,
        live: false,
        skipped: true,
        reason: "waiting_on_provider",
        entered: [],
        exited: [],
      };
    }
    await setSnapshot(currentIds);
    return {
      ok: true,
      live: true,
      skipped: true,
      reason: "seeded_baseline",
      entered: [],
      exited: [],
    };
  }

  const prev = new Set(snapshot);
  const cur = new Set(currentIds);
  const entered = currentIds.filter((id) => !prev.has(id));
  const exited = snapshot.filter((id) => !cur.has(id));

  if (!entered.length && !exited.length) {
    return {
      ok: true,
      live,
      skipped: true,
      reason: "unchanged",
      entered,
      exited,
    };
  }

  let subs = (await listSubscribers()).filter((s) =>
    s.interests.includes("deals")
  );
  // VIP data plan: once checkout is live, flip emails go to VIP accounts only.
  if (vipLive()) {
    const vipEmails = await filterVipEmails(subs.map((s) => s.email));
    subs = subs.filter((s) => vipEmails.has(s.email));
  }

  if (!live) {
    return {
      ok: true,
      live: false,
      skipped: true,
      reason: "waiting_on_provider",
      entered,
      exited,
      subscribers: subs.length,
      sent: 0,
    };
  }

  if (!subs.length) {
    await setSnapshot(currentIds);
    return {
      ok: true,
      live: true,
      skipped: true,
      reason: "no_subscribers",
      entered,
      exited,
      subscribers: 0,
      sent: 0,
    };
  }

  const enteredLines = entered.map((id) => lineForId(id, true));
  const exitedLines = exited.map((id) => lineForId(id, false));
  const subject =
    entered.length && exited.length
      ? "Under-EV Watch: rows flipped"
      : entered.length
        ? entered.length === 1
          ? "Under-EV Watch: a product flipped under EV"
          : `Under-EV Watch: ${entered.length} products flipped under EV`
        : exited.length === 1
          ? "Under-EV Watch: a product left under EV"
          : `Under-EV Watch: ${exited.length} products left under EV`;

  let sent = 0;
  let failed = 0;
  for (const sub of subs) {
    const text = [
      "Rip Portal Under-EV Watch changed.",
      "",
      enteredLines.length ? "Now under EV (catalog price below modeled EV):" : "",
      ...enteredLines,
      enteredLines.length ? "" : "",
      exitedLines.length ? "No longer under EV:" : "",
      ...exitedLines,
      "",
      "Catalog estimates only — not financial advice. Markets move.",
      `${SITE_URL}/deals`,
      "",
      `Unsubscribe: ${unsubscribeUrl(sub.token)}`,
    ]
      .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
      .join("\n");

    const ok = await sendResend(sub.email, subject, text);
    if (ok) sent += 1;
    else failed += 1;
  }

  if (sent > 0 || failed === 0) {
    await setSnapshot(currentIds);
  }

  return {
    ok: failed === 0,
    live: true,
    reason: failed ? "partial_or_failed" : "sent",
    entered,
    exited,
    subscribers: subs.length,
    sent,
    failed,
  };
}

