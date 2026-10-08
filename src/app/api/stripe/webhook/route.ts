import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/vip/stripe";
import { normalizeEmail } from "@/lib/vip/session";
import { emailForCustomer, setVip } from "@/lib/vip/store";
import { onVipActivated } from "@/lib/vip/alerts";

export const runtime = "nodejs";

/**
 * Stripe webhook. Register in Stripe (test mode):
 *   https://www.ripsportal.com/api/stripe/webhook
 * Events: checkout.session.completed, invoice.paid,
 *         invoice.payment_failed, customer.subscription.deleted
 */
function idOf(v: string | { id: string } | null | undefined): string | undefined {
  if (!v) return undefined;
  return typeof v === "string" ? v : v.id;
}

async function resolveEmail(
  stripe: Stripe,
  customerId: string | undefined,
  hint?: string | null
): Promise<string | null> {
  if (customerId) {
    const mapped = await emailForCustomer(customerId).catch(() => null);
    if (mapped) return mapped;
  }
  const fromHint = normalizeEmail(hint || "");
  if (fromHint) return fromHint;
  if (!customerId) return null;
  try {
    const c = await stripe.customers.retrieve(customerId);
    if ("deleted" in c && c.deleted) return null;
    return normalizeEmail((c as Stripe.Customer).email || "");
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ ok: false, error: "stripe_not_configured" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    if (!signature) throw new Error("missing_signature");
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch {
    return NextResponse.json({ ok: false, error: "bad_signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object;
        if (s.mode !== "subscription") break;
        const customerId = idOf(s.customer);
        const email = await resolveEmail(
          stripe,
          undefined,
          s.customer_details?.email || s.customer_email
        );
        if (!email) break;
        await setVip(email, true, {
          customerId,
          subscriptionId: idOf(s.subscription),
          event: event.type,
        });
        await onVipActivated(email);
        break;
      }
      case "invoice.paid": {
        const inv = event.data.object;
        const customerId = idOf(inv.customer);
        const email = await resolveEmail(stripe, customerId, inv.customer_email);
        if (!email) break;
        // Renewal / recovered payment. Doesn't re-add someone who unsubscribed
        // from flip emails; only first checkout does that.
        await setVip(email, true, { customerId, event: event.type });
        break;
      }
      case "invoice.payment_failed": {
        const inv = event.data.object;
        const customerId = idOf(inv.customer);
        const email = await resolveEmail(stripe, customerId, inv.customer_email);
        if (!email) break;
        await setVip(email, false, { customerId, event: event.type });
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customerId = idOf(sub.customer);
        const email = await resolveEmail(stripe, customerId);
        if (!email) break;
        await setVip(email, false, {
          customerId,
          subscriptionId: sub.id,
          event: event.type,
        });
        break;
      }
      default:
        break;
    }
  } catch (err) {
    // 500 → Stripe retries later (e.g. Redis briefly down).
    return NextResponse.json(
      { ok: false, error: "handler_failed", message: err instanceof Error ? err.message.slice(0, 160) : "unknown" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, received: event.type });
}
