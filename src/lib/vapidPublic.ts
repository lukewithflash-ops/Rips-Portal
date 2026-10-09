/**
 * VAPID public key for Web Push (safe to expose).
 * Comes only from NEXT_PUBLIC_VAPID_PUBLIC_KEY (inlined at build time).
 * Empty string = push is switched off and the UI says so.
 */
export const VAPID_PUBLIC_KEY = (
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
).trim();

export function vapidPublicConfigured(): boolean {
  return VAPID_PUBLIC_KEY.length > 40;
}

/** Convert URL-safe base64 VAPID key to Uint8Array for pushManager.subscribe */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
