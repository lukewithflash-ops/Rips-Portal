/**
 * Account + data deletion (App Store guideline 5.1.1(v)).
 *
 * Deletes everything stored server-side for one email:
 *   - VIP record + Stripe customer lookup (Upstash)
 *   - Stripe customer (cancels any subscription) — skipped when Stripe isn't configured
 *   - Web Push subscriptions and iPhone app push tokens saved with that email
 *   - Waitlist / flip-email subscriber entry
 * Device-only data (Rip Log, your price, shop inventory) never leaves the device.
 */
import { getStripe } from "@/lib/vip/stripe";
import { deleteVipRecord, getVipRecord } from "@/lib/vip/store";
import { vipRedisConfigured } from "@/lib/vip/redis";
import { removeSubscriptionsByEmail } from "@/lib/pushStore";
import { removeSubscriberByEmail } from "@/lib/underEvEmail";
import { removeApnsTokensByEmail } from "@/lib/apnsStore";

export type DeleteResult = {
  stripe: "deleted" | "skipped_not_configured" | "no_customer" | "failed";
  vipRecord: boolean;
  pushRemoved: number;
  appDevicesRemoved: number;
  emailListRemoved: boolean;
  extra: Record<string, unknown>;
};

type Hook = (email: string) => Promise<Record<string, unknown>>;
const extraHooks: Hook[] = [];

/** Other stores (e.g. native push tokens) register their own cleanup here. */
export function registerDeleteHook(hook: Hook): void {
  extraHooks.push(hook);
}

export async function deleteAccountData(email: string): Promise<DeleteResult> {
  const result: DeleteResult = {
    stripe: "no_customer",
    vipRecord: false,
    pushRemoved: 0,
    appDevicesRemoved: 0,
    emailListRemoved: false,
    extra: {},
  };

  const record = vipRedisConfigured() ? await getVipRecord(email).catch(() => null) : null;
  const stripe = getStripe();
  if (record?.customerId) {
    if (!stripe) {
      result.stripe = "skipped_not_configured";
    } else {
      try {
        // Deleting the customer cancels any active subscription immediately.
        await stripe.customers.del(record.customerId);
        result.stripe = "deleted";
      } catch {
        result.stripe = "failed";
      }
    }
  } else if (!stripe) {
    result.stripe = "skipped_not_configured";
  }

  // Never drop the customer lookup while a subscription might still bill.
  if (result.stripe === "failed") return result;

  if (vipRedisConfigured()) {
    result.vipRecord = Boolean(await deleteVipRecord(email).catch(() => null));
    result.pushRemoved = await removeSubscriptionsByEmail(email).catch(() => 0);
    result.emailListRemoved = await removeSubscriberByEmail(email).catch(() => false);
    result.appDevicesRemoved = await removeApnsTokensByEmail(email).catch(() => 0);
  }

  for (const hook of extraHooks) {
    try {
      Object.assign(result.extra, await hook(email));
    } catch {
      /* best effort */
    }
  }
  return result;
}
