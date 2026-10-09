"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  currentPushSubscription,
  isIOS,
  isStandalone,
  loadSettings,
  notificationSupported,
  pushManagerSupported,
  saveSettings,
  subscribeWebPush,
  unsubscribeWebPush,
} from "@/lib/dealAlerts";
import { vapidPublicConfigured } from "@/lib/vapidPublic";

type State =
  | "loading"
  | "ios-install"
  | "unsupported"
  | "off-server"
  | "denied"
  | "ready"
  | "busy"
  | "on";

type CoreProps = {
  context?: "deals" | "vip" | "open" | "calculator";
  /** VIP gate message (deals / vip only — never computed on /open). */
  gated?: boolean;
  /** Reports the evaluated state so a soft prompt can hide itself. */
  onState?: (state: State) => void;
  /** Optional dismiss control (soft prompts). */
  onDismiss?: () => void;
};

export type PushAlertsState = State;

/**
 * "Get alerts" — background Web Push for Under-EV flips.
 * Permission is requested only when the button is tapped.
 * No VIP lookup here, so it is safe on /open and the calculator
 * (PushAlertsButton adds the VIP gate note on Deals / VIP).
 */
export default function PushAlertsCore({
  context = "deals",
  gated = false,
  onState,
  onDismiss,
}: CoreProps) {
  const [state, setState] = useState<State>("loading");
  const [msg, setMsg] = useState<string | null>(null);

  const evaluate = useCallback(async () => {
    const ios = isIOS();
    if (ios && !isStandalone()) {
      setState("ios-install");
      return;
    }
    if (!notificationSupported() || !pushManagerSupported()) {
      setState("unsupported");
      return;
    }
    if (!vapidPublicConfigured()) {
      setState("off-server");
      return;
    }
    try {
      const res = await fetch("/api/push/status", { cache: "no-store" });
      const data = (await res.json()) as { enabled?: boolean };
      if (!data.enabled) {
        setState("off-server");
        return;
      }
    } catch {
      /* offline — fall through to local state */
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    const sub = await currentPushSubscription();
    if (sub && Notification.permission === "granted") {
      setState("on");
      // Refresh the saved copy (picks up a VIP sign-in since last time).
      void subscribeWebPush();
      return;
    }
    setState("ready");
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => void evaluate(), 0);
    return () => window.clearTimeout(t);
  }, [evaluate]);

  const turnOn = async () => {
    setMsg(null);
    setState("busy");
    let perm: NotificationPermission;
    try {
      perm = await Notification.requestPermission();
    } catch {
      perm = Notification.permission;
    }
    if (perm === "denied") {
      setState("denied");
      return;
    }
    if (perm !== "granted") {
      setState("ready");
      setMsg("No problem. Tap again whenever you want alerts.");
      return;
    }
    const res = await subscribeWebPush();
    if (res.ok) {
      saveSettings({ ...loadSettings(), notifyUnderEv: true });
      setState("on");
      setMsg("Alerts on. We only ping you when an Under-EV row flips.");
    } else if (res.status === 503) {
      setState("off-server");
    } else {
      setState("ready");
      setMsg("Couldn't turn on alerts just now. Try again in a minute.");
    }
  };

  const turnOff = async () => {
    setMsg(null);
    setState("busy");
    await unsubscribeWebPush();
    saveSettings({ ...loadSettings(), notifyUnderEv: false });
    setState("ready");
    setMsg("Alerts off on this device.");
  };

  useEffect(() => {
    onState?.(state);
  }, [state, onState]);

  if (state === "loading") return null;

  const heading =
    context === "vip"
      ? "Flip alerts on your phone"
      : context === "open" || context === "calculator"
        ? "Want a ping when a deal flips?"
        : "Under-EV alerts";

  return (
    <section className="panel rounded-2xl p-4 border border-emerald-500/25 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-emerald-400/90 font-semibold">
            🔔 {heading}
          </div>
          <p className="text-[12px] text-zinc-400 mt-0.5 leading-relaxed">
            A notification when a product flips under EV (or back), even with
            the app closed. Nothing on quiet weeks.
          </p>
        </div>
        {(state === "ready" || state === "busy") && (
          <button
            type="button"
            onClick={() => void turnOn()}
            disabled={state === "busy"}
            className="shrink-0 rounded-xl px-3.5 py-2 text-[13px] font-semibold bg-emerald-500/20 border border-emerald-400/50 text-emerald-100 hover:bg-emerald-500/30 disabled:opacity-60"
          >
            {state === "busy" ? "…" : "Get alerts"}
          </button>
        )}
        {onDismiss && state !== "busy" && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Not now"
            className="shrink-0 rounded-lg px-2 py-1 text-[12px] text-zinc-500 hover:text-zinc-300"
          >
            Not now
          </button>
        )}
        {state === "on" && !onDismiss && (
          <button
            type="button"
            onClick={() => void turnOff()}
            className="shrink-0 rounded-xl px-3 py-1.5 text-[12px] border border-zinc-700 text-zinc-400 hover:text-zinc-200"
          >
            Turn off
          </button>
        )}
      </div>

      {state === "on" && (
        <p className="text-[12px] text-emerald-300">✓ Alerts are on for this device.</p>
      )}
      {state === "ios-install" && (
        <p className="text-[12px] text-amber-200/90 leading-relaxed">
          On iPhone, add Rip Portal to your Home Screen first: tap Share, then
          &ldquo;Add to Home Screen.&rdquo; Open it from the new icon and tap
          Get alerts there.
        </p>
      )}
      {state === "unsupported" && (
        <p className="text-[12px] text-zinc-500">
          This browser can&apos;t show background alerts. Try Chrome, Edge,
          Firefox, or Safari on a recent device.
        </p>
      )}
      {state === "off-server" && (
        <p className="text-[12px] text-zinc-500">
          Phone alerts aren&apos;t switched on yet. Check back soon.
        </p>
      )}
      {state === "denied" && (
        <p className="text-[12px] text-amber-200/90 leading-relaxed">
          Notifications are blocked for Rip Portal. Turn them on in your
          settings (iPhone: Settings → Notifications → Rip Portal; desktop:
          the lock icon next to the address), then come back.
        </p>
      )}
      {gated && state !== "ios-install" && state !== "unsupported" && (
        <p className="text-[11px] text-amber-300/90">
          Flip alerts are part of{" "}
          <Link href="/vip" className="underline underline-offset-2">
            VIP
          </Link>
          . Sign in with a VIP account before turning them on.
        </p>
      )}
      {msg && <p className="text-[11px] text-zinc-400">{msg}</p>}
    </section>
  );
}
