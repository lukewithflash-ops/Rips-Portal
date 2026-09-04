"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
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

export default function InstallPrompt() {
  const deferred = useDeferredPrompt();
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"android" | "ios" | null>(null);
  const [showIosHowTo, setShowIosHowTo] = useState(false);

  useEffect(() => {
    if (isStandaloneDisplay() || wasInstallDismissedRecently()) return;

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
  }, [deferred]);

  const dismiss = useCallback(() => {
    markInstallDismissed();
    setVisible(false);
    setShowIosHowTo(false);
  }, []);

  const installAndroid = useCallback(async () => {
    await promptInstall();
    setVisible(false);
  }, []);

  if (!visible || !mode) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md sm:left-auto"
      role="dialog"
      aria-label="Install Rip Portal"
    >
      <div className="rounded-xl border border-green-500/25 bg-[#0a0a12]/95 backdrop-blur-md shadow-[0_0_28px_rgba(57,255,20,0.12)] px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-green-500/30 bg-black/50 text-[11px] font-extrabold tracking-tight text-green-400 neon-text">
            RP
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-100">
              Install Rip Portal
            </p>
            {mode === "android" && (
              <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-400">
                Add to your home screen for a faster, app-like experience.
              </p>
            )}
            {mode === "ios" && !showIosHowTo && (
              <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-400">
                Add to Home Screen for quick access from your iPhone.
              </p>
            )}
            {mode === "ios" && showIosHowTo && (
              <ol className="mt-1.5 list-inside list-decimal space-y-1 text-[11px] leading-relaxed text-zinc-300">
                <li>
                  Tap the{" "}
                  <span className="font-medium text-cyan-300">Share</span>{" "}
                  button in Safari
                </li>
                <li>
                  Scroll and tap{" "}
                  <span className="font-medium text-green-300">
                    Add to Home Screen
                  </span>
                </li>
                <li>
                  Tap <span className="font-medium text-green-300">Add</span>
                </li>
              </ol>
            )}
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {mode === "android" && (
                <button
                  type="button"
                  onClick={() => void installAndroid()}
                  className="rounded-md border border-green-500/35 bg-green-500/15 px-3 py-1.5 text-[12px] font-semibold text-green-300 transition-colors hover:bg-green-500/25"
                >
                  Install app
                </button>
              )}
              {mode === "ios" && !showIosHowTo && (
                <button
                  type="button"
                  onClick={() => setShowIosHowTo(true)}
                  className="rounded-md border border-green-500/35 bg-green-500/15 px-3 py-1.5 text-[12px] font-semibold text-green-300 transition-colors hover:bg-green-500/25"
                >
                  How to install
                </button>
              )}
              <button
                type="button"
                onClick={dismiss}
                className="rounded-md px-3 py-1.5 text-[12px] text-zinc-500 transition-colors hover:text-zinc-300"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
