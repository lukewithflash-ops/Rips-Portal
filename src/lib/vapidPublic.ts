/**
 * VAPID public key for Web Push (safe to embed / commit).
 * Override at build time with NEXT_PUBLIC_VAPID_PUBLIC_KEY if you rotate keys.
 */
export const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BNGSnSEIXd_sqb7iMHR4VJdljYnHUA6MDIZPgHFYEh10EWP7tYR_aofdkuw7uDmDrv8z90ANWplvrrxZJFxGchw";

/** Convert URL-safe base64 VAPID key to Uint8Array for pushManager.subscribe */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
