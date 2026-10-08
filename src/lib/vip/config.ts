/**
 * VIP data plan configuration (server side).
 *
 * VIP is a paid DATA plan only: flip emails, the full Under-EV list, Rip Log
 * export, and set price history. No coins, no paid opens, no gems. /open never
 * checks VIP.
 *
 * Env (Vercel → Project → Settings → Environment Variables):
 *   NEXT_PUBLIC_VIP_ENABLED  "true" to turn on gates + checkout (needs the rest)
 *   STRIPE_SECRET_KEY        sk_test_… (TEST mode; sk_live_ is refused unless
 *                            STRIPE_ALLOW_LIVE=1)
 *   STRIPE_WEBHOOK_SECRET    whsec_… from the webhook endpoint
 *   STRIPE_PRICE_MONTHLY     price_… ($5 / month, recurring)
 *   STRIPE_PRICE_YEARLY      price_… ($40 / year, recurring)
 *   AUTH_SECRET              random 32+ chars to sign sign-in cookies
 *                            (falls back to a key derived from STRIPE_SECRET_KEY)
 *   RESEND_API_KEY + RESEND_FROM  only for emailed sign-in links + flip emails
 *   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN  account storage
 */
import { vipRedisConfigured } from "@/lib/vip/redis";

export const VIP_PRICE_MONTHLY_LABEL = "$5/month";
export const VIP_PRICE_YEARLY_LABEL = "$40/year";

export type VipPlan = "monthly" | "yearly";

export function vipFlagOn(): boolean {
  const v = (process.env.NEXT_PUBLIC_VIP_ENABLED || "").trim().toLowerCase();
  return v === "true" || v === "1";
}

function stripeKeyAllowed(): boolean {
  const key = process.env.STRIPE_SECRET_KEY || "";
  if (key.startsWith("sk_test_") || key.startsWith("rk_test_")) return true;
  if (key.startsWith("sk_live_") || key.startsWith("rk_live_")) {
    return process.env.STRIPE_ALLOW_LIVE === "1";
  }
  return false;
}

export function stripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      stripeKeyAllowed() &&
      process.env.STRIPE_WEBHOOK_SECRET &&
      process.env.STRIPE_PRICE_MONTHLY &&
      process.env.STRIPE_PRICE_YEARLY
  );
}

export function authSecretAvailable(): boolean {
  return Boolean(process.env.AUTH_SECRET || process.env.STRIPE_SECRET_KEY);
}

/** Checkout + gates are live only when every piece exists. */
export function vipLive(): boolean {
  return (
    vipFlagOn() &&
    stripeConfigured() &&
    vipRedisConfigured() &&
    authSecretAvailable()
  );
}

/** Emailed sign-in links need a mail sender (same Resend vars as flip email). */
export function signInEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
}

export function priceIdFor(plan: VipPlan): string | undefined {
  return plan === "yearly"
    ? process.env.STRIPE_PRICE_YEARLY
    : process.env.STRIPE_PRICE_MONTHLY;
}

/** Names only — never values. For the setup checklist. */
export function missingVipEnv(): string[] {
  const missing: string[] = [];
  if (!vipFlagOn()) missing.push("NEXT_PUBLIC_VIP_ENABLED");
  if (!process.env.STRIPE_SECRET_KEY) missing.push("STRIPE_SECRET_KEY");
  else if (!stripeKeyAllowed()) missing.push("STRIPE_SECRET_KEY (use a sk_test_ key)");
  if (!process.env.STRIPE_WEBHOOK_SECRET) missing.push("STRIPE_WEBHOOK_SECRET");
  if (!process.env.STRIPE_PRICE_MONTHLY) missing.push("STRIPE_PRICE_MONTHLY");
  if (!process.env.STRIPE_PRICE_YEARLY) missing.push("STRIPE_PRICE_YEARLY");
  if (!vipRedisConfigured()) missing.push("UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN");
  return missing;
}
