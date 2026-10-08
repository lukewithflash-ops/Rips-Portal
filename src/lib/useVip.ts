"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

export type VipStatus = {
  loaded: boolean;
  email: string | null;
  vip: boolean;
  /** Gates apply only when checkout is fully configured. */
  gatesOn: boolean;
  checkoutEnabled: boolean;
  signInEmailEnabled: boolean;
};

const INITIAL: VipStatus = {
  loaded: false,
  email: null,
  vip: false,
  gatesOn: false,
  checkoutEnabled: false,
  signInEmailEnabled: false,
};

let cache: Promise<VipStatus> | null = null;

function fetchStatus(): Promise<VipStatus> {
  if (!cache) {
    cache = fetch("/api/vip/status", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => ({
        loaded: true,
        email: d?.email ?? null,
        vip: Boolean(d?.vip),
        gatesOn: Boolean(d?.gatesOn),
        checkoutEnabled: Boolean(d?.checkoutEnabled),
        signInEmailEnabled: Boolean(d?.signInEmailEnabled),
      }))
      .catch(() => ({ ...INITIAL, loaded: true }));
  }
  return cache;
}

export function refreshVipStatus(): void {
  cache = null;
}

/**
 * VIP status for data features (Under-EV full list, Log export, price history,
 * flip emails). Never use this on /open — Open is free and never checks VIP.
 */
export function useVip(): VipStatus {
  const [status, setStatus] = useState<VipStatus>(INITIAL);
  useEffect(() => {
    let alive = true;
    void fetchStatus().then((s) => {
      if (alive) setStatus(s);
    });
    return () => {
      alive = false;
    };
  }, []);
  return status;
}

/** Free Under-EV Watch shows this many rows when VIP gates are on. */
export const FREE_UNDER_EV_ROWS = 2;

const noopSubscribe = () => () => {};

/** Current ?query string on the client ("" during SSR). */
export function useLocationSearch(): string {
  return useSyncExternalStore(
    noopSubscribe,
    () => window.location.search,
    () => ""
  );
}
