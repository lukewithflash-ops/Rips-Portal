"use client";

import { useEffect } from "react";
import { isNativeApp } from "@/lib/native";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // Avoid SW during local Next HMR churn; still fine on Vercel preview/prod
    if (process.env.NODE_ENV !== "production") return;
    // iPhone app always loads live pages (offline is the bundled native page).
    if (isNativeApp()) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch {
        // Silent — PWA install still works without SW on some browsers
      }
    };

    void register();
  }, []);

  return null;
}
