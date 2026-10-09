"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PushAlertsCore, { type PushAlertsState } from "@/components/PushAlertsCore";

/** Show the soft prompt at most once per this many days (per device). */
export const ALERTS_NUDGE_DAYS = 14;
const KEY = "rip-portal-alerts-nudge-v1";

function shownRecently(): boolean {
  try {
    const at = Number(window.localStorage.getItem(KEY) || 0);
    return at > 0 && Date.now() - at < ALERTS_NUDGE_DAYS * 86_400_000;
  } catch {
    return true; // storage blocked — stay quiet
  }
}

function markShown(): void {
  try {
    window.localStorage.setItem(KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

/**
 * Soft, inline "Get alerts" prompt. Never a modal and never on page load:
 * the parent sets `active` only after a real action (3 opens, leaving an
 * Open session, or a calculator verdict). Dismissible; once per N days.
 * No VIP lookup (safe on /open). Keeps the iOS Add-to-Home-Screen hint.
 */
export default function AlertsNudge({
  active,
  context,
  className = "",
}: {
  active: boolean;
  context: "open" | "calculator";
  className?: string;
}) {
  // Decided once per mount from localStorage; null on the server (renders nothing).
  const [eligible] = useState(() =>
    typeof window === "undefined" ? false : !shownRecently()
  );
  const [hidden, setHidden] = useState(false);
  const firstState = useRef<PushAlertsState | null>(null);
  const show = eligible && active && !hidden;

  useEffect(() => {
    if (show) markShown();
  }, [show]);

  const onState = useCallback((s: PushAlertsState) => {
    if (s === "loading" || firstState.current) return;
    firstState.current = s;
    // Nothing to offer on arrival: already on, blocked, unsupported, or push not live.
    // (After a tap we keep the card so the "Alerts are on" confirmation shows.)
    if (s === "on" || s === "denied" || s === "unsupported" || s === "off-server") {
      setHidden(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className={className}>
      <PushAlertsCore
        context={context}
        onState={onState}
        onDismiss={() => setHidden(true)}
      />
    </div>
  );
}
