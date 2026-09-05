import webpush from "web-push";
import type { PushSubscriptionJSON } from "@/lib/pushStore";
import { VAPID_PUBLIC_KEY } from "@/lib/vapidPublic";

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

export function vapidServerConfigured(): boolean {
  return Boolean(
    process.env.VAPID_PRIVATE_KEY &&
      (process.env.VAPID_SUBJECT || process.env.VAPID_CONTACT)
  );
}

function configureVapid(): void {
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject =
    process.env.VAPID_SUBJECT ||
    process.env.VAPID_CONTACT ||
    "mailto:lukewithflash@gmail.com";
  if (!privateKey) throw new Error("vapid_private_missing");
  webpush.setVapidDetails(subject, VAPID_PUBLIC_KEY, privateKey);
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
