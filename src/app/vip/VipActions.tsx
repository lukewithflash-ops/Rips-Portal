"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  refreshVipStatus,
  useLocationSearch,
  useVip,
  type VipStatus,
} from "@/lib/useVip";

type Plan = "monthly" | "yearly";

export default function VipActions() {
  const base = useVip();
  const [override, setOverride] = useState<Partial<VipStatus> | null>(null);
  const status: VipStatus = { ...base, ...override };
  const [busy, setBusy] = useState<Plan | "portal" | "signin" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const search = useLocationSearch();
  const flags = useMemo(() => {
    const q = new URLSearchParams(search);
    return {
      welcome: q.get("welcome") === "1",
      canceled: q.get("canceled") === "1",
      expired: q.get("signin") === "expired",
    };
  }, [search]);

  // After Checkout the webhook may land a few seconds after the redirect.
  useEffect(() => {
    if (!flags.welcome || status.vip || !status.loaded) return;
    let tries = 0;
    const t = window.setInterval(async () => {
      tries += 1;
      try {
        const d = await fetch("/api/vip/status", { cache: "no-store" }).then((r) => r.json());
        if (d?.vip || tries >= 10) {
          window.clearInterval(t);
          refreshVipStatus();
          setOverride({ vip: Boolean(d?.vip), ...(d?.email ? { email: d.email as string } : {}) });
        }
      } catch {
        if (tries >= 10) window.clearInterval(t);
      }
    }, 2000);
    return () => window.clearInterval(t);
  }, [flags.welcome, status.vip, status.loaded]);

  const subscribe = async (plan: Plan) => {
    setBusy(plan);
    setMsg(null);
    try {
      const res = await fetch("/api/vip/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const d = (await res.json()) as { ok?: boolean; url?: string; message?: string; error?: string };
      if (d.ok && d.url) {
        window.location.href = d.url;
        return;
      }
      setMsg(
        d.error === "already_vip"
          ? "You're already VIP."
          : d.message || "Checkout isn't available right now."
      );
    } catch {
      setMsg("Network error. Try again.");
    }
    setBusy(null);
  };

  const manage = async () => {
    setBusy("portal");
    setMsg(null);
    try {
      const d = await fetch("/api/vip/portal", { method: "POST" }).then((r) => r.json());
      if (d?.ok && d.url) {
        window.location.href = d.url;
        return;
      }
      setMsg("Billing page isn't available right now.");
    } catch {
      setMsg("Network error. Try again.");
    }
    setBusy(null);
  };

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("signin");
    setMsg(null);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const d = await res.json();
      if (d?.ok) setLinkSent(true);
      else
        setMsg(
          d?.error === "too_many_requests"
            ? "Too many links requested. Try again in 10 minutes."
            : "Couldn't send the link. Check the address and try again."
        );
    } catch {
      setMsg("Network error. Try again.");
    }
    setBusy(null);
  };

  const signOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" }).catch(() => null);
    refreshVipStatus();
    window.location.assign(`${window.location.origin}/vip`);
  };

  const checkoutOff = status.loaded && !status.checkoutEnabled;

  return (
    <section className="mt-4 panel rounded-2xl p-4 border border-amber-500/25 space-y-3">
      {flags.welcome && (
        <p className="text-[12px] text-emerald-300 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
          {status.vip
            ? "Payment received. VIP is on."
            : "Payment received. VIP turns on as soon as Stripe confirms, usually within a few seconds."}
        </p>
      )}
      {flags.canceled && (
        <p className="text-[12px] text-zinc-400">Checkout canceled. Nothing was charged.</p>
      )}
      {flags.expired && (
        <p className="text-[12px] text-amber-300/90">That sign-in link expired or was already used. Ask for a new one.</p>
      )}

      {status.vip ? (
        <div className="space-y-3">
          <div className="text-sm text-zinc-200">
            👑 You&apos;re VIP{status.email ? ` as ${status.email}` : ""}.
          </div>
          <div className="flex flex-wrap gap-2 text-[12px]">
            <Link href="/deals" className="px-3 py-2 rounded-lg border border-emerald-500/35 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20">
              Full Under-EV list
            </Link>
            <Link href="/vip/history" className="px-3 py-2 rounded-lg border border-amber-500/35 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20">
              Price history
            </Link>
            <Link href="/log" className="px-3 py-2 rounded-lg border border-cyan-500/35 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20">
              Rip Log export
            </Link>
          </div>
          <p className="text-[11px] text-zinc-500">
            Flip emails go to this address. Every email has an unsubscribe link.
          </p>
          <div className="flex flex-wrap gap-3 text-[12px]">
            <button type="button" onClick={manage} disabled={busy !== null} className="text-purple-300 hover:underline disabled:opacity-50">
              {busy === "portal" ? "Opening…" : "Manage billing"}
            </button>
            <button type="button" onClick={signOut} className="text-zinc-400 hover:underline">
              Sign out
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => subscribe("monthly")}
              disabled={!status.loaded || checkoutOff || busy !== null}
              className="rounded-xl py-3 text-sm font-semibold bg-amber-500/20 border border-amber-400/50 text-amber-100 hover:bg-amber-500/30 disabled:opacity-50"
            >
              {busy === "monthly" ? "Opening checkout…" : "Subscribe · $5/month"}
            </button>
            <button
              type="button"
              onClick={() => subscribe("yearly")}
              disabled={!status.loaded || checkoutOff || busy !== null}
              className="rounded-xl py-3 text-sm font-semibold bg-purple-500/20 border border-purple-400/50 text-purple-100 hover:bg-purple-500/30 disabled:opacity-50"
            >
              {busy === "yearly" ? "Opening checkout…" : "Subscribe · $40/year"}
            </button>
          </div>
          {checkoutOff && (
            <p className="text-[12px] text-zinc-400">
              Checkout isn&apos;t open yet. Everything on Rip Portal stays free until it is.
            </p>
          )}
          {status.email && (
            <p className="text-[12px] text-zinc-500">
              Signed in as {status.email} (not VIP).{" "}
              <button type="button" onClick={signOut} className="text-zinc-400 hover:underline">
                Sign out
              </button>
            </p>
          )}
          {!status.email && status.signInEmailEnabled && (
            <div className="pt-2 border-t border-zinc-800/70">
              {linkSent ? (
                <p className="text-[12px] text-emerald-300">Check your email for a sign-in link.</p>
              ) : (
                <form onSubmit={sendLink} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Already VIP? you@email.com"
                    className="flex-1 bg-black/60 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/60"
                  />
                  <button
                    type="submit"
                    disabled={busy !== null || !email.trim()}
                    className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium border border-zinc-600 text-zinc-200 disabled:opacity-50"
                  >
                    {busy === "signin" ? "Sending…" : "Email me a sign-in link"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
      {msg && <p className="text-[12px] text-amber-300/90">{msg}</p>}
    </section>
  );
}
