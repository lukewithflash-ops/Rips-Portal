/**
 * Rip Portal iPhone app (Capacitor shell around www.ripsportal.com).
 *
 * The app loads the live site and appends "RipPortalApp/<ver>" to the user
 * agent; Capacitor also injects window.Capacitor. Everything here is a no-op
 * on the website, and plugin code is only imported inside the app, so the web
 * bundle and behavior stay the same.
 */

export const NATIVE_UA_TOKEN = "RipPortalApp/";

type CapacitorGlobal = {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
};

/** True inside the Rip Portal iPhone app. False on the website (and during SSR). */
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
  if (cap?.isNativePlatform?.()) return true;
  return typeof navigator !== "undefined" && navigator.userAgent.includes(NATIVE_UA_TOKEN);
}

export type HapticKind = "tap" | "reveal" | "hit" | "big-hit";

/** Haptic feedback in the app; nothing on the web. */
export async function haptic(kind: HapticKind): Promise<void> {
  if (!isNativeApp()) return;
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import("@capacitor/haptics");
    if (kind === "tap") await Haptics.impact({ style: ImpactStyle.Light });
    else if (kind === "reveal") await Haptics.impact({ style: ImpactStyle.Medium });
    else if (kind === "hit") await Haptics.impact({ style: ImpactStyle.Heavy });
    else await Haptics.notification({ type: NotificationType.Success });
  } catch {
    /* haptics are a nice-to-have */
  }
}

/**
 * Native iOS share sheet. Returns true when the sheet was shown (or the user
 * dismissed it), false when not in the app so the caller can use its web path.
 */
export async function nativeShare(opts: {
  title?: string;
  text?: string;
  url?: string;
}): Promise<boolean> {
  if (!isNativeApp()) return false;
  try {
    const { Share } = await import("@capacitor/share");
    await Share.share({ ...opts, dialogTitle: opts.title });
  } catch {
    /* user canceled — still handled natively */
  }
  return true;
}

/** Open a URL in Safari (outside the app). Returns false on the web. */
export async function openInSafari(url: string): Promise<boolean> {
  if (!isNativeApp()) return false;
  try {
    const { AppLauncher } = await import("@capacitor/app-launcher");
    await AppLauncher.openUrl({ url });
    return true;
  } catch {
    return false;
  }
}

/** True for http(s) links that leave www.ripsportal.com. */
export function isExternalHref(href: string): boolean {
  try {
    const u = new URL(href, window.location.href);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    return u.hostname !== window.location.hostname && !u.hostname.endsWith("ripsportal.com");
  } catch {
    return false;
  }
}

/* ---------------- Native push (APNs) ---------------- */

const TOKEN_KEY = "rp_apns_token";

export function savedApnsToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export type NativePushPermission = "granted" | "denied" | "prompt";

export async function nativePushPermission(): Promise<NativePushPermission> {
  const { PushNotifications } = await import("@capacitor/push-notifications");
  const p = await PushNotifications.checkPermissions();
  if (p.receive === "granted") return "granted";
  if (p.receive === "denied") return "denied";
  return "prompt";
}

/** Ask permission (if needed), register with APNs, and save the token server-side. */
export async function enableNativePush(): Promise<
  { ok: true } | { ok: false; reason: "denied" | "dismissed" | "register_failed" | "server" }
> {
  const { PushNotifications } = await import("@capacitor/push-notifications");
  let perm = await PushNotifications.checkPermissions();
  if (perm.receive !== "granted") perm = await PushNotifications.requestPermissions();
  if (perm.receive === "denied") return { ok: false, reason: "denied" };
  if (perm.receive !== "granted") return { ok: false, reason: "dismissed" };

  const token = await new Promise<string | null>((resolve) => {
    let done = false;
    const finish = (v: string | null) => {
      if (done) return;
      done = true;
      void okL.then((h) => h.remove());
      void errL.then((h) => h.remove());
      resolve(v);
    };
    const okL = PushNotifications.addListener("registration", (t) => finish(t.value));
    const errL = PushNotifications.addListener("registrationError", () => finish(null));
    window.setTimeout(() => finish(null), 15000);
    void PushNotifications.register();
  });
  if (!token) return { ok: false, reason: "register_failed" };

  try {
    const res = await fetch("/api/push/apns/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) return { ok: false, reason: "server" };
  } catch {
    return { ok: false, reason: "server" };
  }
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
  return { ok: true };
}

export async function disableNativePush(): Promise<void> {
  const token = savedApnsToken();
  if (token) {
    await fetch("/api/push/apns/unregister", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).catch(() => null);
  }
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    await PushNotifications.unregister();
  } catch {
    /* ignore */
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] || "");
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

/**
 * Share a generated image with the native iOS share sheet (Messages, Photos,
 * Instagram…). Returns false on the web so the caller keeps its web path.
 */
export async function nativeShareImage(
  blob: Blob,
  filename: string,
  title: string,
  fallbackUrl?: string
): Promise<boolean> {
  if (!isNativeApp()) return false;
  try {
    const [{ Filesystem, Directory }, { Share }] = await Promise.all([
      import("@capacitor/filesystem"),
      import("@capacitor/share"),
    ]);
    const { uri } = await Filesystem.writeFile({
      path: filename.replace(/[^\w.-]/g, "_"),
      data: await blobToBase64(blob),
      directory: Directory.Cache,
    });
    try {
      await Share.share({ title, files: [uri], dialogTitle: title });
    } catch {
      /* user closed the sheet */
    }
    return true;
  } catch {
    if (fallbackUrl) {
      return nativeShare({ title, url: new URL(fallbackUrl, window.location.href).toString() });
    }
    return false;
  }
}
