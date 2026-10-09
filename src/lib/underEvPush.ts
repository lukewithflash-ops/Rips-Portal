/**
 * Under-EV flip Web Push.
 *
 * Sends a phone/desktop notification only when a catalog row enters or leaves
 * Under-EV (profit > 0 at the sheet price) — same rule as the flip email.
 * A quiet Monday sends nothing.
 *
 * Who gets it:
 *  - VIP gates off (checkout not live): everyone who tapped "Get alerts".
 *  - VIP gates on: only subscriptions saved while signed in to a VIP account,
 *    same rule as flip emails. /open never checks VIP.
 *
 * Stays off until NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and
 * VAPID_SUBJECT (mailto:) are set, plus the existing Upstash Redis vars.
 */
import { listUnderEvDeals } from "@/lib/dealAlerts";
import { findProduct, productDisplayName, calculateEV } from "@/lib/products";
import {
  getPushFlipSnapshot,
  listSubscriptions,
  redisConfigured,
  removeSubscription,
  setPushFlipSnapshot,
  type PushSubscriptionJSON,
} from "@/lib/pushStore";
import {
  sendWebPush,
  vapidServerConfigured,
  type PushPayload,
} from "@/lib/webPushServer";
import { vipLive } from "@/lib/vip/config";
import { filterVipEmails } from "@/lib/vip/store";

export type PushBlastResult = {
  subscribers: number;
  sent: number;
  pruned: number;
  failed: number;
};

/** Send one payload to each subscription; drop 404/410 (expired) ones. */
export async function sendPushToSubscriptions(
  subs: PushSubscriptionJSON[],
  payload: PushPayload
): Promise<PushBlastResult> {
  let sent = 0;
  let pruned = 0;
  let failed = 0;
  for (const sub of subs) {
    const result = await sendWebPush(sub, payload);
    if (result.ok) {
      sent += 1;
    } else if (result.gone) {
      await removeSubscription(sub.endpoint).catch(() => undefined);
      pruned += 1;
    } else {
      failed += 1;
    }
  }
  return { subscribers: subs.length, sent, pruned, failed };
}

/** Subscriptions allowed to get flip alerts under the current VIP rule. */
export async function flipAlertRecipients(): Promise<PushSubscriptionJSON[]> {
  const subs = await listSubscriptions();
  if (!vipLive()) return subs;
  const emails = [
    ...new Set(subs.map((s) => s.email).filter((e): e is string => Boolean(e))),
  ];
  const vip = await filterVipEmails(emails);
  return subs.filter((s) => Boolean(s.email && vip.has(s.email)));
}

function shortName(id: string): string {
  const p = findProduct(id);
  return p ? productDisplayName(p) : id;
}

function roiText(id: string): string {
  const p = findProduct(id);
  if (!p) return "";
  const { roi } = calculateEV(p, p.defaultPrice);
  return ` ${roi >= 0 ? "+" : ""}${roi.toFixed(0)}% ROI`;
}

export function flipPushPayload(entered: string[], exited: string[]): PushPayload {
  const title =
    entered.length && exited.length
      ? "Under-EV Watch changed"
      : entered.length
        ? entered.length === 1
          ? "Flipped under EV"
          : `${entered.length} products flipped under EV`
        : exited.length === 1
          ? "Left Under-EV"
          : `${exited.length} products left Under-EV`;
  const parts: string[] = [];
  if (entered.length) {
    parts.push(
      "Now under EV: " +
        entered
          .slice(0, 3)
          .map((id) => `${shortName(id)}${roiText(id)}`)
          .join(" · ") +
        (entered.length > 3 ? ` · +${entered.length - 3} more` : "")
    );
  }
  if (exited.length) {
    parts.push(
      "No longer under EV: " +
        exited
          .slice(0, 3)
          .map(shortName)
          .join(" · ") +
        (exited.length > 3 ? ` · +${exited.length - 3} more` : "")
    );
  }
  return {
    title,
    body: `${parts.join(". ")}. Catalog estimates — check live prices.`,
    url: "/deals",
    tag: "rip-portal-under-ev",
  };
}

export type FlipPushResult = {
  ok: boolean;
  live: boolean;
  skipped?: boolean;
  reason: string;
  entered?: string[];
  exited?: string[];
  subscribers?: number;
  sent?: number;
  pruned?: number;
  failed?: number;
};

export async function runUnderEvFlipPush(): Promise<FlipPushResult> {
  const live = vapidServerConfigured();
  if (!redisConfigured()) {
    return { ok: false, live, reason: "redis_not_configured" };
  }
  // Off until keys exist. Do not touch the snapshot, so the first live run
  // seeds a baseline instead of alerting on old changes.
  if (!live) {
    return { ok: true, live: false, skipped: true, reason: "waiting_on_vapid" };
  }

  const currentIds = listUnderEvDeals()
    .map((d) => d.id)
    .sort();
  const snapshot = await getPushFlipSnapshot();

  if (!snapshot) {
    await setPushFlipSnapshot(currentIds);
    return { ok: true, live, skipped: true, reason: "seeded_baseline" };
  }

  const prev = new Set(snapshot);
  const cur = new Set(currentIds);
  const entered = currentIds.filter((id) => !prev.has(id));
  const exited = snapshot.filter((id) => !cur.has(id));

  if (!entered.length && !exited.length) {
    return { ok: true, live, skipped: true, reason: "unchanged", entered, exited };
  }

  const recipients = await flipAlertRecipients();
  const result = await sendPushToSubscriptions(
    recipients,
    flipPushPayload(entered, exited)
  );
  await setPushFlipSnapshot(currentIds);

  return {
    ok: result.failed === 0,
    live,
    reason: result.subscribers ? "sent" : "no_subscribers",
    entered,
    exited,
    ...result,
  };
}
