"use client";

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const STORAGE_KEY = "rip-portal-install-dismissed";
export const DISMISS_DAYS = 30;

type Listener = () => void;

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<Listener>();
let listening = false;

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

export function wasInstallDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function markInstallDismissed() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
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
