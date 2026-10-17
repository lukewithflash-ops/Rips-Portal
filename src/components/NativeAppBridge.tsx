"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isExternalHref, isNativeApp, openInSafari } from "@/lib/native";

/**
 * iPhone app glue. Renders nothing and does nothing on the website.
 *  - Outbound links (Buy links, retailer pages) open in Safari, not inside the app.
 *  - Tapping an Under-EV alert opens the page it points to (default /deals).
 */
export default function NativeAppBridge() {
  const router = useRouter();

  useEffect(() => {
    if (!isNativeApp()) return;
    document.documentElement.setAttribute("data-app", "ios");

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || !isExternalHref(a.href)) return;
      // Capture phase: stop the WebView navigation, keep React onClick (click tracking).
      e.preventDefault();
      void openInSafari(a.href);
    };
    document.addEventListener("click", onClick, true);

    let removePush: (() => void) | null = null;
    void import("@capacitor/push-notifications")
      .then(({ PushNotifications }) =>
        PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
          const raw = (action.notification?.data as { url?: unknown } | undefined)?.url;
          const url = typeof raw === "string" && raw.startsWith("/") ? raw : "/deals";
          router.push(url);
        })
      )
      .then((h) => {
        removePush = () => void h.remove();
      })
      .catch(() => undefined);

    return () => {
      document.removeEventListener("click", onClick, true);
      removePush?.();
    };
  }, [router]);

  return null;
}
