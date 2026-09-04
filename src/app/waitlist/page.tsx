"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const LS_KEY = "rip-portal-waitlist-v1";

const INTEREST_CHIPS = [
  { id: "ev", label: "More EV tools" },
  { id: "sim", label: "Pack sims" },
  { id: "log", label: "Rip Log sync" },
  { id: "deals", label: "Deal alerts" },
  { id: "multi", label: "More hobbies" },
  { id: "biz", label: "Portal LLC updates" },
] as const;

type InterestId = (typeof INTEREST_CHIPS)[number]["id"];

interface WaitlistEntry {
  email: string;
  interests: InterestId[];
  at: number;
}

function loadEntries(): WaitlistEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as WaitlistEntry[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveEntry(entry: WaitlistEntry): WaitlistEntry[] {
  const prev = loadEntries().filter(
    (e) => e.email.toLowerCase() !== entry.email.toLowerCase()
  );
  const next = [entry, ...prev].slice(0, 50);
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch {
    /* quota / private */
  }
  return next;
}

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [interests, setInterests] = useState<InterestId[]>(["ev", "biz"]);
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);
  const [exportHint, setExportHint] = useState(false);

  useEffect(() => {
    setCount(loadEntries().length);
  }, []);

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent("Portal Waitlist signup");
    const body = encodeURIComponent(
      `Please add me to the Portal waitlist.\n\nEmail: ${email || "(your email)"}\nInterests: ${
        interests.length
          ? interests
              .map((id) => INTEREST_CHIPS.find((c) => c.id === id)?.label ?? id)
              .join(", ")
          : "(none selected)"
      }\n\n— Sent from ripsportal.com/waitlist`
    );
    // No published contact inbox in-repo; opens a draft the visitor can send.
    return `mailto:?subject=${subject}&body=${body}`;
  }, [email, interests]);

  const toggleInterest = (id: InterestId) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) return;
    const next = saveEntry({
      email: trimmed,
      interests,
      at: Date.now(),
    });
    setCount(next.length);
    setDone(true);
  };

  const exportList = () => {
    const rows = loadEntries();
    const text = rows
      .map(
        (r) =>
          `${r.email}\t${r.interests.join(",")}\t${new Date(r.at).toISOString()}`
      )
      .join("\n");
    try {
      void navigator.clipboard?.writeText(
        text || "(no local waitlist entries yet)"
      );
      setExportHint(true);
      window.setTimeout(() => setExportHint(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="min-h-screen portal-bg flex flex-col">
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-10 pb-24">
        <Link
          href="/"
          className="text-[12px] text-green-400/90 hover:text-green-300"
        >
          ← Rip Portal
        </Link>

        <div className="mt-4 panel rounded-2xl p-5 border border-purple-500/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 via-transparent to-green-500/10 pointer-events-none" />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-widest text-purple-300/90 font-semibold mb-1">
              Portal
            </div>
            <h1 className="text-2xl font-bold text-green-400 neon-text tracking-tight">
              Join the waitlist
            </h1>
            <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
              Rip Portal started as pack EV math for collectors. Portal is the
              bigger umbrella — more products and tools as we grow (possibly
              under a Portal LLC). Leave your email if you want early notes
              when something new ships.
            </p>
            <p className="mt-2 text-[12px] text-zinc-500 leading-relaxed">
              Today: Calculator, Verdict, Keeper EV, Rip Log, Deals, and Free
              Pack Opener. Tomorrow: whatever helps rippers know before they
              rip.
            </p>
          </div>
        </div>

        {done ? (
          <div className="mt-6 rounded-2xl border border-green-500/40 bg-green-500/10 p-5 space-y-3">
            <div className="text-green-300 font-semibold text-sm">
              You&apos;re on the list 🌀
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              We&apos;ll email when Portal expands. Your signup is saved in this
              browser for the MVP — use the mailto backup if you want a draft
              in your inbox too.
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href={mailtoHref}
                className="text-[12px] px-3 py-2 rounded-xl bg-purple-500/15 border border-purple-400/40 text-purple-100 hover:bg-purple-500/25"
              >
                Open mailto draft
              </a>
              <button
                type="button"
                onClick={() => {
                  setDone(false);
                  setEmail("");
                }}
                className="text-[12px] px-3 py-2 rounded-xl border border-zinc-700 text-zinc-400 hover:text-zinc-200"
              >
                Add another
              </button>
              <Link
                href="/open"
                className="text-[12px] px-3 py-2 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-100"
              >
                Try Free Pack Opener →
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mt-6 panel rounded-2xl p-5 space-y-4 portal-border"
          >
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-green-400/60"
              />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">
                Interests
              </div>
              <div className="flex flex-wrap gap-2">
                {INTEREST_CHIPS.map((chip) => {
                  const on = interests.includes(chip.id);
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => toggleInterest(chip.id)}
                      className={`rounded-full px-3 py-1.5 text-[12px] border ${
                        on
                          ? "bg-green-500/15 border-green-400/50 text-green-300"
                          : "bg-black/40 border-zinc-700 text-zinc-400"
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              type="submit"
              disabled={!email.trim()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-medium bg-green-500/20 border border-green-400/50 text-green-100 disabled:opacity-50 portal-glow"
            >
              Join waitlist
            </button>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              MVP stores your email in{" "}
              <span className="font-mono text-zinc-500">localStorage</span> on
              this device only — not a server database. Prefer email?{" "}
              <a
                href={mailtoHref}
                className="text-purple-300/90 hover:text-purple-200 underline-offset-2 hover:underline"
              >
                Open a mailto draft
              </a>{" "}
              with subject &quot;Portal Waitlist signup&quot;.
            </p>
          </form>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3 text-[12px] text-zinc-500">
          <span>{count} saved locally on this browser</span>
          <button
            type="button"
            onClick={exportList}
            className="text-cyan-400/90 hover:text-cyan-300 underline-offset-2 hover:underline"
          >
            {exportHint ? "Copied!" : "Copy local list"}
          </button>
          <Link href="/about" className="hover:text-green-300">
            About Portal
          </Link>
        </div>
      </main>
    </div>
  );
}
