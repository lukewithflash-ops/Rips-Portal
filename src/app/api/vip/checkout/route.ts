import { NextResponse } from "next/server";
import { priceIdFor, vipLive, type VipPlan } from "@/lib/vip/config";
import { getStripe } from "@/lib/vip/stripe";
import { currentEmail } from "@/lib/vip/session";
import { getVipRecord } from "@/lib/vip/store";

export const runtime = "nodejs";

/** Start Stripe Checkout (subscription mode) for the monthly or yearly price. */
export async function POST(req: Request) {
  const stripe = getStripe();
  if (!vipLive() || !stripe) {
    return NextResponse.json(
      { ok: false, error: "checkout_disabled", message: "VIP checkout is not switched on yet." },
      { status: 503 }
    );
  }

  let plan: VipPlan = "monthly";
  try {
    const body = (await req.json()) as { plan?: string };
    if (body.plan === "yearly") plan = "yearly";
  } catch {
    /* default monthly */
  }
  const price = priceIdFor(plan);
  if (!price) {
    return NextResponse.json({ ok: false, error: "price_missing" }, { status: 503 });
  }

  const origin = new URL(req.url).origin;
  const email = await currentEmail();
  const record = email ? await getVipRecord(email).catch(() => null) : null;
  if (record?.vip) {
    return NextResponse.json({ ok: false, error: "already_vip" }, { status: 409 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      success_url: `${origin}/api/vip/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/vip?canceled=1`,
      ...(record?.customerId
        ? { customer: record.customerId }
        : email
          ? { customer_email: email }
          : {}),
      metadata: { app: "rip-portal-vip", plan },
      subscription_data: { metadata: { app: "rip-portal-vip", plan } },
    });
    if (!session.url) throw new Error("no_session_url");
    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: "checkout_failed",
        message: err instanceof Error ? err.message.slice(0, 200) : "unknown",
      },
      { status: 502 }
    );
  }
}
