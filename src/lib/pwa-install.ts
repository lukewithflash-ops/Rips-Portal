"use client";

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const STORAGE_KEY = "rip-portal-install-dismissed";
const COOKIE_KEY = "rp_install_dismissed";
/** Keep dismissed for ~45 days (longer than the prior 30-day window). */
export const DISMISS_DAYS = 45;
const DISMISS_MS = DISMISS_DAYS * 24 * 60 * 60 * 1000;

type Listener = () => void;

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<Listener>();
let listening = false;
/** Session-level dismiss so "Not now" sticks even if storage is blocked. */
let sessionDismissed = false;

function notify() {
  listeners.forEach((l) => l());
}

export function getDeferredInstallPrompt() {
  return deferredPrompt;
}

export function clearDeferredInstallPrompt() {
  deferredPrompt = null;
  notify();
}

export function subscribeInstallPrompt(listener: Listener) {
  listeners.add(listener);
  ensureBeforeInstallListener();
  return () => {
    listeners.delete(listener);
  };
}

function ensureBeforeInstallListener() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    markInstallDismissed();
    notify();
  });
}

export function isIosDevice(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const iPadOs =
    window.navigator.platform === "MacIntel" &&
    window.navigator.maxTouchPoints > 1;
  return iOS || iPadOs;
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return true;
  const mq = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    "standalone" in window.navigator &&
    Boolean(
      (window.navigator as Navigator & { standalone?: boolean }).standalone
    );
  return mq || iosStandalone;
}

function readDismissTimestamp(): number | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const ts = Number(raw);
      if (Number.isFinite(ts) && ts > 0) return ts;
    }
  } catch {
    /* private mode / blocked */
  }

  try {
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]*)`)
    );
    if (match?.[1]) {
      const ts = Number(decodeURIComponent(match[1]));
      if (Number.isFinite(ts) && ts > 0) return ts;
    }
  } catch {
    /* ignore */
  }

  return null;
}

export function wasInstallDismissedRecently(): boolean {
  if (sessionDismissed) return true;
  const ts = readDismissTimestamp();
  if (ts == null) return false;
  return Date.now() - ts < DISMISS_MS;
}

export function markInstallDismissed() {
  sessionDismissed = true;
  const now = String(Date.now());
  try {
    localStorage.setItem(STORAGE_KEY, now);
  } catch {
    /* ignore */
  }
  try {
    const maxAge = DISMISS_DAYS * 24 * 60 * 60;
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(now)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  const event = deferredPrompt;
  if (!event) return "unavailable";
  await event.prompt();
  try {
    const { outcome } = await event.userChoice;
    deferredPrompt = null;
    notify();
    if (outcome === "accepted") markInstallDismissed();
    return outcome;
  } catch {
    deferredPrompt = null;
    notify();
    return "dismissed";
  }
}
