"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  getDeferredInstallPrompt,
  isIosDevice,
  isStandaloneDisplay,
  promptInstall,
  subscribeInstallPrompt,
} from "@/lib/pwa-install";

function useDeferredPrompt() {
  return useSyncExternalStore(
    subscribeInstallPrompt,
    getDeferredInstallPrompt,
    () => null
  );
}

export default function InstallAppButton({
  className = "",
}: {
  className?: string;
}) {
  const deferred = useDeferredPrompt();
  const [ready, setReady] = useState(false);
  const [ios, setIos] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);

  useEffect(() => {
    if (isStandaloneDisplay()) return;
    setReady(true);
    setIos(isIosDevice());
  }, []);

  const onClick = useCallback(async () => {
    if (ios) {
      setShowHowTo((v) => !v);
      return;
    }
    if (deferred) {
      await promptInstall();
      return;
    }
    setShowHowTo((v) => !v);
  }, [deferred, ios]);

  if (!ready) return null;

  return (
    <span className={`relative inline-flex flex-col items-start ${className}`}>
      <button
        type="button"
        onClick={() => void onClick()}
        className="transition-colors hover:text-green-300"
      >
        Install app
      </button>
      {showHowTo && (
        <span className="absolute bottom-full left-0 z-40 mb-2 w-56 rounded-lg border border-green-500/25 bg-[#0a0a12] p-3 text-[11px] leading-relaxed text-zinc-300 shadow-lg">
          {ios ? (
            <>
              In Safari: tap <strong className="text-cyan-300">Share</strong>,
              then{" "}
              <strong className="text-green-300">Add to Home Screen</strong>.
            </>
          ) : (
            <>
              Use your browser menu →{" "}
              <strong className="text-green-300">Install app</strong> /{" "}
              <strong className="text-green-300">Add to Home screen</strong>.
            </>
          )}
          <button
            type="button"
            className="mt-1.5 block text-zinc-500 hover:text-zinc-300"
            onClick={() => setShowHowTo(false)}
          >
            Close
          </button>
        </span>
      )}
    </span>
  );
}
