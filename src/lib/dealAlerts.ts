import { products, calculateEV } from "@/lib/products";

const SEEN_KEY = "rip-portal-deal-alerts-seen-v1";
const SETTINGS_KEY = "rip-portal-deal-alerts-settings-v1";
const BANNER_DISMISS_KEY = "rip-portal-deal-alerts-banner-dismiss-v1";

export interface DealAlertsSeen {
  ids: string[];
  at: number;
}

export interface DealAlertsSettings {
  /** Fire local browser Notification when new under-EV appears (tab open/focus). */
  notifyUnderEv: boolean;
}

export interface UnderEvDeal {
  id: string;
  name: string;
  format: string;
  price: number;
  totalEV: number;
  roi: number;
  profit: number;
}

const DEFAULT_SETTINGS: DealAlertsSettings = { notifyUnderEv: false };

export function listUnderEvDeals(): UnderEvDeal[] {
  return products
    .map((p) => {
      const { totalEV, roi, profit } = calculateEV(p, p.defaultPrice);
      return {
        id: p.id,
        name: p.name,
        format: p.format,
        price: p.defaultPrice,
        totalEV,
        roi,
        profit,
      };
    })
    .filter((row) => row.profit > 0)
    .sort((a, b) => b.roi - a.roi);
}

export function loadSeen(): DealAlertsSeen | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DealAlertsSeen;
    if (!parsed || !Array.isArray(parsed.ids)) return null;
    return { ids: parsed.ids.map(String), at: Number(parsed.at) || 0 };
  } catch {
    return null;
  }
}

export function saveSeen(ids: string[]): DealAlertsSeen {
  const next: DealAlertsSeen = { ids: [...ids], at: Date.now() };
  if (typeof window === "undefined") return next;
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify(next));
  } catch {
    /* quota / private */
  }
  return next;
}

export function loadSettings(): DealAlertsSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<DealAlertsSettings>;
    return {
      notifyUnderEv: Boolean(parsed.notifyUnderEv),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(next: DealAlertsSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function loadBannerDismissedFor(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(BANNER_DISMISS_KEY);
  } catch {
    return null;
  }
}

/** Fingerprint of the current new-deal set so dismiss sticks until the set changes. */
export function bannerFingerprint(newIds: string[]): string {
  return [...newIds].sort().join("|");
}

export function dismissBanner(newIds: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      BANNER_DISMISS_KEY,
      bannerFingerprint(newIds)
    );
  } catch {
    /* ignore */
  }
}

export function diffNewUnderEv(
  currentIds: string[],
  seen: DealAlertsSeen | null
): string[] {
  if (!seen || !seen.ids.length) return [];
  const prev = new Set(seen.ids);
  return currentIds.filter((id) => !prev.has(id));
}

export function notificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function ensureNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!notificationSupported()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function fireLocalUnderEvNotification(newDeals: UnderEvDeal[]): void {
  if (!notificationSupported()) return;
  if (Notification.permission !== "granted") return;
  if (!newDeals.length) return;
  const top = newDeals.slice(0, 3);
  const title =
    newDeals.length === 1
      ? "New under-EV deal"
      : `${newDeals.length} new under-EV deals`;
  const body = top
    .map((d) => `${d.name} · ${d.roi >= 0 ? "+" : ""}${d.roi.toFixed(0)}% ROI`)
    .join(" · ");
  try {
    const n = new Notification(title, {
      body: body || "Catalog price under modeled EV",
      icon: "/icons/icon-192.png",
      tag: "rip-portal-under-ev",
      silent: false,
    });
    n.onclick = () => {
      try {
        window.focus();
        // Absolute URL — Notification click handlers are outside React router.
        window.open("https://ripsportal.com/deals", "_self");
      } catch {
        /* ignore */
      }
      n.close();
    };
  } catch {
    /* some browsers block Notification ctor outside gesture */
  }
}

/**
 * Web Push (background) when PWA + VAPID + Upstash are configured.
 * Local Notification fallback still fires while the tab is open/focused.
 */
export const DEAL_ALERTS_PUSH_NOTE =
  "Background Web Push works when this app is installed (Add to Home Screen on iOS) and you Allow notifications. Local alerts still work while this tab is open.";

export function pushManagerSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

export async function subscribeWebPush(): Promise<
  | { ok: true; endpoint: string }
  | { ok: false; error: string; status?: number }
> {
  if (!pushManagerSupported()) {
    return { ok: false, error: "unsupported" };
  }
  try {
    const { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } = await import(
      "@/lib/vapidPublic"
    );
    // Ensure SW is registered (production layout also registers; this covers race / settings-first).
    try {
      await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    } catch {
      /* may already be registering */
    }
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const keyBytes = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyBytes as unknown as BufferSource,
      });
    }
    const json = sub.toJSON() as {
      endpoint?: string;
      expirationTime?: number | null;
      keys?: { p256dh?: string; auth?: string };
    };
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: json }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      message?: string;
    };
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        error: data.message || data.error || `subscribe_${res.status}`,
        status: res.status,
      };
    }
    return { ok: true, endpoint: json.endpoint || sub.endpoint };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "subscribe_failed",
    };
  }
}

export async function unsubscribeWebPush(): Promise<void> {
  if (!pushManagerSupported()) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;
    const endpoint = sub.endpoint;
    try {
      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint }),
      });
    } catch {
      /* ignore network — still drop local sub */
    }
    await sub.unsubscribe().catch(() => undefined);
  } catch {
    /* ignore */
  }
}
