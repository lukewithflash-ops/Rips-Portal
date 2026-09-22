"use client";

import { useEffect, useState } from "react";
import { pricesUpdated } from "@/lib/products";

/**
 * Honest offline cue: never imply live prices. Shows catalog stamp when offline.
 */
export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (!offline) return null;

  const stamp = pricesUpdated || "unknown";

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-[60] w-full border-b border-amber-500/40 bg-amber-950/95 px-3 py-2 text-center text-[11px] leading-snug text-amber-100 backdrop-blur-md"
    >
      <span className="font-semibold text-amber-200">Offline</span>
      {" — "}
      prices may be stale / last updated {stamp}. App chrome works; live market
      data is unavailable until you reconnect.
    </div>
  );
}
