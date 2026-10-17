"use client";

import { useState } from "react";
import { refreshVipStatus } from "@/lib/useVip";

/** Two-step account deletion for a signed-in visitor (type your email to confirm). */
export default function DeleteAccount({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: typed }),
      });
      const d = (await res.json()) as { ok?: boolean; error?: string };
      if (d.ok) {
        refreshVipStatus();
        window.location.assign(`${window.location.origin}/vip?deleted=1`);
        return;
      }
      setMsg(
        d.error === "confirm_mismatch"
          ? "That email doesn't match the signed-in account."
          : "Couldn't delete right now. Nothing was removed. Try again or email lukewithflash@gmail.com."
      );
    } catch {
      setMsg("Network error. Nothing was removed.");
    }
    setBusy(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[12px] text-red-300/90 hover:underline min-h-[24px]"
      >
        Delete account
      </button>
    );
  }

  return (
    <div className="w-full rounded-xl border border-red-500/30 bg-red-500/5 p-3 space-y-2">
      <p className="text-[12px] text-zinc-300 leading-relaxed">
        This deletes your Rip Portal account: your email, VIP status, any active
        subscription (canceled right away, no further charges), phone/browser
        alert subscriptions tied to this email, and flip-email signups. Rip Log
        and prices saved on this device stay on this device.
      </p>
      <label htmlFor="delete-confirm" className="block text-[12px] text-zinc-400">
        Type <span className="text-zinc-200">{email}</span> to confirm
      </label>
      <input
        id="delete-confirm"
        type="email"
        autoComplete="off"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        className="w-full bg-black/60 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-red-400/60"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={run}
          disabled={busy || typed.trim().toLowerCase() !== email}
          className="px-3 py-2 rounded-lg text-[13px] font-medium border border-red-500/50 bg-red-500/15 text-red-200 disabled:opacity-50"
        >
          {busy ? "Deleting…" : "Delete my account"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setTyped("");
            setMsg(null);
          }}
          className="px-3 py-2 rounded-lg text-[13px] text-zinc-400 hover:text-zinc-200"
        >
          Cancel
        </button>
      </div>
      {msg && <p className="text-[12px] text-amber-300/90">{msg}</p>}
    </div>
  );
}
