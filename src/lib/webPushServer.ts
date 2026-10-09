import webpush from "web-push";
import type { PushSubscriptionJSON } from "@/lib/pushStore";
import { VAPID_PUBLIC_KEY, vapidPublicConfigured } from "@/lib/vapidPublic";

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

function vapidSubject(): string {
  return (process.env.VAPID_SUBJECT || process.env.VAPID_CONTACT || "").trim();
}

/**
 * Push is live only when the public key, private key and a mailto:/https:
 * subject are all set. Missing any of them = push stays quietly off.
 */
export function vapidServerConfigured(): boolean {
  const subject = vapidSubject();
  return Boolean(
    vapidPublicConfigured() &&
      process.env.VAPID_PRIVATE_KEY &&
      (subject.startsWith("mailto:") || subject.startsWith("https://"))
  );
}

/** Names only — never values. */
export function missingVapidEnv(): string[] {
  const missing: string[] = [];
  if (!vapidPublicConfigured()) missing.push("NEXT_PUBLIC_VAPID_PUBLIC_KEY");
  if (!process.env.VAPID_PRIVATE_KEY) missing.push("VAPID_PRIVATE_KEY");
  const subject = vapidSubject();
  if (!(subject.startsWith("mailto:") || subject.startsWith("https://"))) {
    missing.push("VAPID_SUBJECT");
  }
  return missing;
}

function configureVapid(): void {
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!privateKey || !vapidServerConfigured()) {
    throw new Error("vapid_not_configured");
  }
  webpush.setVapidDetails(vapidSubject(), VAPID_PUBLIC_KEY, privateKey);
}

export type SendResult =
  | { ok: true }
  | { ok: false; statusCode?: number; gone?: boolean; error?: string };

export async function sendWebPush(
  subscription: PushSubscriptionJSON,
  payload: PushPayload
): Promise<SendResult> {
  configureVapid();
  if (!subscription.keys?.p256dh || !subscription.keys?.auth) {
    return { ok: false, error: "missing_keys" };
  }
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url || "/deals",
        tag: payload.tag || "rip-portal-under-ev",
      }),
      {
        TTL: 60 * 60 * 12,
        urgency: "normal",
      }
    );
    return { ok: true };
  } catch (err: unknown) {
    const statusCode =
      err && typeof err === "object" && "statusCode" in err
        ? Number((err as { statusCode: number }).statusCode)
        : undefined;
    const gone = statusCode === 404 || statusCode === 410;
    return {
      ok: false,
      statusCode,
      gone,
      error: err instanceof Error ? err.message : "send_failed",
    };
  }
}
