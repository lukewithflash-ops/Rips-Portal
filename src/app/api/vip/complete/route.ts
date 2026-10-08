import { NextResponse } from "next/server";
import { vipLive } from "@/lib/vip/config";
import { getStripe } from "@/lib/vip/stripe";
import {
  SESSION_COOKIE,
  createSessionToken,
  normalizeEmail,
  sessionCookieOptions,
} from "@/lib/vip/session";

export const runtime = "nodejs";

/**
 * Stripe success_url. Signs the buyer in with the email they used at
 * Checkout. VIP itself is set by the webhook, not here.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("session_id") || "";
  const dest = new URL("/vip", url.origin);
  const stripe = getStripe();
  if (!vipLive() || !stripe || !id.startsWith("cs_")) {
    return NextResponse.redirect(dest);
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(id);
    const fresh = Date.now() / 1000 - session.created < 60 * 60 * 24;
    const email = normalizeEmail(
      session.customer_details?.email || session.customer_email || ""
    );
    if (session.status !== "complete" || !fresh || !email) {
      return NextResponse.redirect(dest);
    }
    dest.searchParams.set("welcome", "1");
    const res = NextResponse.redirect(dest);
    const token = createSessionToken(email);
    if (token) res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return res;
  } catch {
    return NextResponse.redirect(dest);
  }
}
