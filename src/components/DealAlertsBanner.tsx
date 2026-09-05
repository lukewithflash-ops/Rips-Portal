"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  DEAL_ALERTS_PUSH_NOTE,
  bannerFingerprint,
  diffNewUnderEv,
  dismissBanner,
  ensureNotificationPermission,
  fireLocalUnderEvNotification,
  listUnderEvDeals,
  loadBannerDismissedFor,
  loadSeen,
  loadSettings,
  notificationSupported,
  pushManagerSupported,
  saveSeen,
  saveSettings,
  subscribeWebPush,
  unsubscribeWebPush,
  type DealAlertsSettings,
  type UnderEvDeal,
} from "@/lib/dealAlerts";

type Props = {
  /** Compact strip for home; full banner + settings on /deals */
  variant?: "banner" | "compact" | "settings";
};

export default function DealAlertsBanner({ variant = "banner" }: Props) {
  const [hydrated, setHydrated] = useState(false);
  const [newDeals, setNewDeals] = useState<UnderEvDeal[]>([]);
  const [settings, setSettings] = useState<DealAlertsSettings>({
    notifyUnderEv: false,
  });
  const [dismissed, setDismissed] = useState(false);
  const [permHint, setPermHint] = useState<string | null>(null);
  const notifiedRef = useRef<string>("");

  const underEv = useMemo(() => listUnderEvDeals(), []);
  const currentIds = useMemo(() => underEv.map((d) => d.id), [underEv]);

  const evaluate = useCallback(
    (opts?: { notify?: boolean }) => {
      const seen = loadSeen();
      const freshIds = diffNewUnderEv(currentIds, seen);
      const fresh = underEv.filter((d) => freshIds.includes(d.id));
      setNewDeals(fresh);

      const fp = bannerFingerprint(freshIds);
      const dismissedFp = loadBannerDismissedFor();
      setDismissed(Boolean(freshIds.length && dismissedFp === fp));

      // First visit: seed last-seen without treating everything as "new"
      if (!seen) {
        saveSeen(currentIds);
        setNewDeals([]);
        setDismissed(false);
        return;
      }

      if (
        opts?.notify &&
        loadSettings().notifyUnderEv &&
        fresh.length &&
        notificationSupported() &&
        Notification.permission === "granted"
      ) {
        if (notifiedRef.current !== fp) {
          notifiedRef.current = fp;
          fireLocalUnderEvNotification(fresh);
        }
      }
    },
    [currentIds, underEv]
  );

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSettings(loadSettings());
      evaluate({ notify: true });
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(t);
  }, [evaluate]);

  useEffect(() => {
    const onFocus = () => evaluate({ notify: true });
    const onVisibility = () => {
      if (document.visibilityState === "visible") onFocus();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [evaluate]);

  const markSeen = () => {
    saveSeen(currentIds);
    setNewDeals([]);
    setDismissed(false);
  };

  const onDismiss = () => {
    dismissBanner(newDeals.map((d) => d.id));
    setDismissed(true);
  };

  const toggleNotify = async () => {
    const nextOn = !settings.notifyUnderEv;
    if (nextOn) {
      const perm = await ensureNotificationPermission();
      if (perm === "unsupported") {
        setPermHint("Notifications are not supported in this browser.");
        return;
      }
      if (perm !== "granted") {
        setPermHint(
          "Permission blocked — enable notifications for this site in browser settings. On iPhone, add Rip Portal to the Home Screen first, then Allow."
        );
        saveSettings({ notifyUnderEv: false });
        setSettings({ notifyUnderEv: false });
        return;
      }

      // Best-effort Web Push subscribe (does not block local Notification fallback)
      if (pushManagerSupported()) {
        const push = await subscribeWebPush();
        if (!push.ok) {
          if (push.status === 503) {
            setPermHint(
              "Local alerts on. Background push needs server setup (Redis/VAPID) — ask the site operator."
            );
          } else if (push.error === "unsupported") {
            setPermHint(
              "Local alerts on. Background push needs an installed PWA (Add to Home Screen on iOS)."
            );
          } else {
            setPermHint(
              `Local alerts on. Background push unavailable (${push.error}).`
            );
          }
        } else {
          setPermHint(
            "Notifications enabled — including background push when the app is closed (platform-permitting)."
          );
        }
      } else {
        setPermHint(
          "Local alerts on while this tab is open. For background push on iPhone: Safari → Share → Add to Home Screen, open the icon, then enable again."
        );
      }
    } else {
      setPermHint(null);
      void unsubscribeWebPush();
    }
    const next = { notifyUnderEv: nextOn };
    saveSettings(next);
    setSettings(next);
  };

  if (!hydrated) return null;

  if (variant === "settings") {
    return (
      <section className="panel rounded-2xl p-4 border border-zinc-800 space-y-2">
        <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
          Deal alerts
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 accent-emerald-400"
            checked={settings.notifyUnderEv}
            onChange={() => void toggleNotify()}
          />
          <span className="min-w-0">
            <span className="block text-sm text-zinc-200">
              Notify me about under-EV deals
            </span>
            <span className="block text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
              {DEAL_ALERTS_PUSH_NOTE}
            </span>
            <span className="block text-[11px] text-zinc-600 mt-1 leading-relaxed">
              iOS: only works after Add to Home Screen; tap Allow when prompted.
            </span>
          </span>
        </label>
        {permHint && (
          <p className="text-[11px] text-amber-200/90">{permHint}</p>
        )}
        {newDeals.length > 0 && (
          <button
            type="button"
            onClick={markSeen}
            className="text-[11px] text-emerald-400/90 hover:text-emerald-300 underline-offset-2 hover:underline"
          >
            Mark current under-EV set as seen
          </button>
        )}
      </section>
    );
  }

  if (!newDeals.length || dismissed) return null;

  if (variant === "compact") {
    return (
      <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 flex items-center justify-between gap-3">
        <div className="min-w-0 text-[12px] text-emerald-100/95">
          <span className="font-semibold">New under-EV deals</span>
          <span className="text-emerald-200/70"> · {newDeals.length} since last visit</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/deals"
            className="text-[11px] text-emerald-300 hover:text-emerald-200 underline-offset-2 hover:underline"
          >
            View
          </Link>
          <button
            type="button"
            onClick={onDismiss}
            className="text-[11px] text-zinc-500 hover:text-zinc-300"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-3 relative overflow-hidden"
      role="status"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="relative flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-sm shrink-0">
          ✨
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-emerald-300/90">
              New under-EV deals
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200">
              {newDeals.length} new
            </span>
          </div>
          <p className="text-[13px] text-zinc-200 mt-1 leading-relaxed">
            {newDeals
              .slice(0, 3)
              .map((d) => d.name)
              .join(" · ")}
            {newDeals.length > 3 ? ` · +${newDeals.length - 3} more` : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={markSeen}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-100"
            >
              Got it
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="text-[11px] px-2.5 py-1 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200"
            >
              Dismiss
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-zinc-500 hover:text-zinc-300 text-sm shrink-0"
          aria-label="Dismiss banner"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
