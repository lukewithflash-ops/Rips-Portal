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
 * True background push (closed tab) needs a later push vendor (OneSignal, etc.).
 * This helper only covers local notifications while the app/tab is open or focused.
 */
export const DEAL_ALERTS_PUSH_NOTE =
  "Local browser notifications only work while this tab is open (or on focus). True background push needs a later service (OneSignal / Web Push).";
