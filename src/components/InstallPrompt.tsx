"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import {
  getDeferredInstallPrompt,
  isIosDevice,
  isStandaloneDisplay,
  markInstallDismissed,
  promptInstall,
  subscribeInstallPrompt,
  wasInstallDismissedRecently,
} from "@/lib/pwa-install";

function useDeferredPrompt() {
  return useSyncExternalStore(
    subscribeInstallPrompt,
    getDeferredInstallPrompt,
    () => null
  );
}

/** Pages where the install toast would cover primary CTAs / bottom nav. */
const HIDE_ON_PATHS = ["/open"];

export default function InstallPrompt() {
  const pathname = usePathname();
  const deferred = useDeferredPrompt();
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"android" | "ios" | null>(null);
  const [showIosHowTo, setShowIosHowTo] = useState(false);

  const hideForRoute =
    !!pathname &&
    HIDE_ON_PATHS.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    );

  useEffect(() => {
    if (hideForRoute) {
      setVisible(false);
      return;
    }
    if (isStandaloneDisplay() || wasInstallDismissedRecently()) {
      setVisible(false);
      return;
    }

    if (isIosDevice()) {
      setMode("ios");
      setVisible(true);
      return;
    }

    // Android/Chrome: show once beforeinstallprompt fires
    if (deferred) {
      setMode("android");
      setVisible(true);
    }
  }, [deferred, hideForRoute]);

  const dismiss = useCallback(() => {
    markInstallDismissed();
    setVisible(false);
    setShowIosHowTo(false);
  }, []);

  const installAndroid = useCallback(async () => {
    await promptInstall();
    markInstallDismissed();
    setVisible(false);
  }, []);

  if (hideForRoute || !visible || !mode) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 pointer-events-none px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:right-4 sm:bottom-4 sm:left-auto sm:px-0 sm:pb-0"
      role="dialog"
      aria-label="Install Rip Portal"
    >
      <div className="pointer-events-auto mx-auto max-w-lg sm:mx-0 rounded-xl border border-green-500/25 bg-[#0a0a12]/95 backdrop-blur-md shadow-[0_0_20px_rgba(57,255,20,0.1)]">
        {/* Compact single-row bar on small screens */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-green-500/30 bg-black/50 text-[9px] font-extrabold tracking-tight text-green-400 neon-text">
            RP
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold leading-tight text-zinc-100 sm:text-[13px]">
              Install Rip Portal
              <span className="hidden font-normal text-zinc-500 sm:inline">
                {" "}
                · home screen
              </span>
            </p>
            {mode === "ios" && showIosHowTo && (
              <ol className="mt-1 list-inside list-decimal space-y-0.5 text-[10px] leading-snug text-zinc-400 sm:text-[11px]">
                <li>
                  Tap{" "}
                  <span className="font-medium text-cyan-300">Share</span> in
                  Safari
                </li>
                <li>
                  Tap{" "}
                  <span className="font-medium text-green-300">
                    Add to Home Screen
                  </span>
                </li>
                <li>
                  Tap <span className="font-medium text-green-300">Add</span>
                </li>
              </ol>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {mode === "android" && (
              <button
                type="button"
                onClick={() => void installAndroid()}
                className="rounded-md border border-green-500/35 bg-green-500/15 px-2 py-1 text-[11px] font-semibold text-green-300 transition-colors hover:bg-green-500/25 sm:px-2.5"
              >
                Install
              </button>
            )}
            {mode === "ios" && !showIosHowTo && (
              <button
                type="button"
                onClick={() => setShowIosHowTo(true)}
                className="rounded-md border border-green-500/35 bg-green-500/15 px-2 py-1 text-[11px] font-semibold text-green-300 transition-colors hover:bg-green-500/25 sm:px-2.5"
              >
                How
              </button>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="rounded-md px-2 py-1 text-[11px] text-zinc-500 transition-colors hover:text-zinc-300 sm:px-2.5"
              aria-label="Not now — dismiss install prompt"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
