import Stripe from "stripe";
import { stripeConfigured } from "@/lib/vip/config";

let client: Stripe | null = null;

/** Stripe client, or null when keys are missing / not test mode. */
export function getStripe(): Stripe | null {
  if (!stripeConfigured()) return null;
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  return client;
}
