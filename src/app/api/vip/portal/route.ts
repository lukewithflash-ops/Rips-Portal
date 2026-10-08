import { NextResponse } from "next/server";
import { vipLive } from "@/lib/vip/config";
import { getStripe } from "@/lib/vip/stripe";
import { currentEmail } from "@/lib/vip/session";
import { getVipRecord } from "@/lib/vip/store";

export const runtime = "nodejs";

/** Stripe Billing Portal (cancel / change card). Needs the portal enabled in Stripe. */
export async function POST(req: Request) {
  const stripe = getStripe();
  const email = await currentEmail();
  if (!vipLive() || !stripe || !email) {
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 });
  }
  const record = await getVipRecord(email).catch(() => null);
  if (!record?.customerId) {
    return NextResponse.json({ ok: false, error: "no_customer" }, { status: 404 });
  }
  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: record.customerId,
      return_url: `${new URL(req.url).origin}/vip`,
    });
    return NextResponse.json({ ok: true, url: portal.url });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: "portal_failed",
        message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
      },
      { status: 502 }
    );
  }
}
