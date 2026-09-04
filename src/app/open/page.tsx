"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  categories,
  products,
  calculateEV,
  type Category,
  type Product,
} from "@/lib/products";
import { findProduct } from "@/lib/riplog";
import {
  OPEN_SIM_DISCLAIMER,
  buildDropTable,
  simulateOpen,
  fmtMoney,
  fmtPct,
  type SimSession,
} from "@/lib/simulate";

type Phase = "idle" | "spinning" | "reveal";

function OpenInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const packFromUrl = searchParams.get("pack");

  const [category, setCategory] = useState<Category>("pokemon");
  const [productId, setProductId] = useState<string | null>(null);
  const [qtyMode, setQtyMode] = useState<"1" | "5" | "10" | "custom">("1");
  const [customQty, setCustomQty] = useState(3);
  const [priceStr, setPriceStr] = useState("");
  const [session, setSession] = useState<SimSession | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [revealIdx, setRevealIdx] = useState(0);
  const [reelLabel, setReelLabel] = useState("?");

  const product: Product | null = useMemo(() => {
    if (productId) return findProduct(productId) ?? null;
    return products.find((p) => p.category === category) ?? null;
  }, [productId, category]);

  const quantity =
    qtyMode === "custom"
      ? Math.max(1, Math.min(100, customQty || 1))
      : parseInt(qtyMode, 10);

  const price =
    priceStr !== ""
      ? parseFloat(priceStr) || 0
      : product?.defaultPrice ?? 0;

  const dropTable = useMemo(
    () => (product ? buildDropTable(product) : []),
    [product]
  );

  const unitEV = useMemo(
    () => (product ? calculateEV(product, price).totalEV : 0),
    [product, price]
  );

  useEffect(() => {
    if (!packFromUrl) return;
    const p = findProduct(packFromUrl);
    if (p) {
      setCategory(p.category);
      setProductId(p.id);
      setPriceStr("");
      setSession(null);
      setPhase("idle");
    }
  }, [packFromUrl]);

  const selectProduct = useCallback(
    (p: Product) => {
      setCategory(p.category);
      setProductId(p.id);
      setPriceStr("");
      setSession(null);
      setPhase("idle");
      const params = new URLSearchParams();
      params.set("pack", p.id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router]
  );

  const categoryProducts = useMemo(
    () => products.filter((p) => p.category === category),
    [category]
  );

  const runOpen = useCallback(() => {
    if (!product || phase === "spinning") return;
    const next = simulateOpen(product, quantity, price);
    setSession(next);
    setPhase("spinning");
    setRevealIdx(0);

    const labels = product.slots.map((s) => s.name);
    let ticks = 0;
    const spin = window.setInterval(() => {
      setReelLabel(labels[Math.floor(Math.random() * labels.length)] ?? "?");
      ticks += 1;
      if (ticks > 14) {
        window.clearInterval(spin);
        const hi = next.packs[0]?.highlight?.name ?? labels[0] ?? "Pull";
        setReelLabel(hi);
        setPhase("reveal");
      }
    }, 70);
  }, [product, quantity, price, phase]);

  useEffect(() => {
    if (phase !== "reveal" || !session) return;
    if (revealIdx >= session.packs.length) return;
    if (session.packs.length <= 1) return;
    const t = window.setTimeout(() => {
      setRevealIdx((i) => Math.min(i + 1, session.packs.length));
    }, 180);
    return () => window.clearTimeout(t);
  }, [phase, session, revealIdx]);

  const shownPacks =
    session && phase === "reveal"
      ? session.packs.slice(0, Math.max(1, revealIdx + 1))
      : session && phase === "spinning"
        ? []
        : session?.packs ?? [];

  return (
    <div className="flex min-h-screen portal-bg flex-col">
      <header className="border-b border-green-500/15 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="px-4 md:px-6 py-3 flex items-center justify-between gap-3 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/"
              className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 portal-glow flex items-center justify-center text-sm font-bold text-black shrink-0"
            >
              🌀
            </Link>
            <div className="min-w-0">
              <div className="font-bold text-cyan-300 neon-text text-sm leading-tight">
                Free Pack Opener
              </div>
              <div className="text-[10px] text-zinc-500 tracking-wider truncate">
                SIMULATION · EV MODEL ODDS
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/deals"
              className="text-[11px] text-emerald-400/90 hover:text-emerald-300 underline-offset-2 hover:underline hidden sm:inline"
            >
              Deals
            </Link>
            <Link
              href="/log"
              className="text-[11px] text-cyan-400/90 hover:text-cyan-300 underline-offset-2 hover:underline hidden sm:inline"
            >
              Rip Log
            </Link>
            <Link
              href={product ? `/?pack=${product.id}` : "/"}
              className="text-[11px] text-green-400/90 hover:text-green-300 underline-offset-2 hover:underline"
            >
              ← Calculator
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 md:px-6 py-5 max-w-3xl mx-auto w-full space-y-4 pb-28">
        <section className="panel rounded-2xl p-4 border border-cyan-500/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-green-500/5 pointer-events-none" />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-widest text-cyan-400/90 font-semibold mb-1">
              Open
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Educational pack simulation
            </h1>
            <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
              Pick a catalog product, preview the drop table, then simulate 1 /
              5 / 10 opens. Free forever — no gems, no wallet, no cash-out.
            </p>
          </div>
        </section>

        <div
          className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-[12px] text-amber-100/90 leading-relaxed"
          role="note"
        >
          {OPEN_SIM_DISCLAIMER}
        </div>

        <section className="panel rounded-2xl p-4 portal-border space-y-3">
          <h2 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
            1 · Product
          </h2>
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCategory(c.id);
                  const first = products.find((p) => p.category === c.id);
                  if (first) selectProduct(first);
                }}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] border ${
                  category === c.id
                    ? "bg-cyan-500/15 border-cyan-400/50 text-cyan-300"
                    : "bg-black/40 border-zinc-700 text-zinc-400"
                }`}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto">
            {categoryProducts.map((p) => {
              const active = product?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectProduct(p)}
                  className={`text-left rounded-xl border px-3 py-2.5 flex gap-2.5 items-center card-hover ${
                    active
                      ? "border-cyan-400/50 bg-cyan-500/10"
                      : "border-zinc-800 bg-black/30"
                  }`}
                >
                  <span className="text-xl shrink-0">{p.emoji ?? "📦"}</span>
                  <span className="min-w-0">
                    <span className="block text-sm text-zinc-100 font-medium truncate">
                      {p.name}
                    </span>
                    <span className="block text-[11px] text-zinc-500 truncate">
                      {p.format} · {fmtMoney(p.defaultPrice)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {product && (
          <>
            <section className="panel rounded-2xl p-4 space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                  2 · Drop table
                </h2>
                <div className="text-[11px] text-zinc-500">
                  Unit EV {fmtMoney(unitEV)} · cost {fmtMoney(price)}
                </div>
              </div>
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-left text-[12px] min-w-[320px]">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-zinc-600 border-b border-zinc-800">
                      <th className="py-2 px-1 font-medium">Tier</th>
                      <th className="py-2 px-1 font-medium">Odds</th>
                      <th className="py-2 px-1 font-medium text-right">
                        Avg $
                      </th>
                      <th className="py-2 px-1 font-medium text-right">EV $</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dropTable.map((row) => (
                      <tr
                        key={row.name}
                        className="border-b border-zinc-900/80 text-zinc-300"
                      >
                        <td className="py-2 px-1 pr-2">{row.name}</td>
                        <td className="py-2 px-1 font-mono text-cyan-300/90">
                          {row.odds}
                        </td>
                        <td className="py-2 px-1 text-right font-mono">
                          {fmtMoney(row.avgValue)}
                        </td>
                        <td className="py-2 px-1 text-right font-mono text-emerald-300/90">
                          {fmtMoney(row.evContribution)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                Simulated odds = catalog{" "}
                <span className="font-mono text-zinc-500">oddsNum</span> per
                slot (independent draws, same as calculator EV). Not official
                published rates.
              </p>
            </section>

            <section className="panel rounded-2xl p-4 space-y-4">
              <h2 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                3 · Simulate open
              </h2>
              <div className="flex flex-wrap gap-2">
                {(["1", "5", "10", "custom"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setQtyMode(m)}
                    className={`rounded-xl px-3 py-2 text-[12px] border ${
                      qtyMode === m
                        ? "bg-cyan-500/15 border-cyan-400/50 text-cyan-200"
                        : "border-zinc-800 text-zinc-400"
                    }`}
                  >
                    {m === "custom" ? "Custom" : `${m} pack${m === "1" ? "" : "s"}`}
                  </button>
                ))}
              </div>
              {qtyMode === "custom" && (
                <div>
                  <label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wider">
                    Quantity (1–100)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={customQty}
                    onChange={(e) =>
                      setCustomQty(
                        Math.max(1, Math.min(100, parseInt(e.target.value, 10) || 1))
                      )
                    }
                    className="w-28 bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-cyan-400/60"
                  />
                </div>
              )}
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wider">
                  Price per unit ($)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={priceStr !== "" ? priceStr : price}
                  onChange={(e) => setPriceStr(e.target.value)}
                  className="w-36 bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-cyan-400/60"
                />
              </div>

              <div
                className={`relative mx-auto w-full max-w-sm h-28 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-black to-emerald-950/30 flex items-center justify-center overflow-hidden ${
                  phase === "spinning" ? "pack-reel-spin" : ""
                } ${phase === "reveal" ? "pack-flip-reveal" : ""}`}
              >
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.35),transparent_70%)]" />
                <div className="relative z-10 text-center px-4">
                  <div className="text-[10px] uppercase tracking-widest text-cyan-500/80 mb-1">
                    {phase === "spinning"
                      ? "Opening…"
                      : phase === "reveal"
                        ? "Reveal"
                        : "Ready"}
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-white truncate max-w-[280px]">
                    {phase === "idle"
                      ? `${product.emoji ?? "📦"} ${product.name}`
                      : reelLabel}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={runOpen}
                disabled={phase === "spinning"}
                className="w-full py-3 rounded-xl text-sm font-semibold bg-cyan-500/20 border border-cyan-400/50 text-cyan-100 hover:bg-cyan-500/30 disabled:opacity-50 portal-glow transition-colors"
              >
                {phase === "spinning"
                  ? "Opening…"
                  : `Open ${quantity} simulated pack${quantity === 1 ? "" : "s"}`}
              </button>
            </section>
          </>
        )}

        {session && phase === "reveal" && (
          <section className="panel rounded-2xl p-4 space-y-4 border border-emerald-500/25">
            <h2 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
              Results
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="rounded-xl bg-black/40 border border-zinc-800 px-3 py-2.5">
                <div className="text-[9px] uppercase tracking-wider text-zinc-600">
                  Sim value
                </div>
                <div className="text-sm font-mono text-white">
                  {fmtMoney(session.totalSimValue)}
                </div>
              </div>
              <div className="rounded-xl bg-black/40 border border-zinc-800 px-3 py-2.5">
                <div className="text-[9px] uppercase tracking-wider text-zinc-600">
                  Expected EV
                </div>
                <div className="text-sm font-mono text-zinc-200">
                  {fmtMoney(session.expectedEV)}
                </div>
              </div>
              <div className="rounded-xl bg-black/40 border border-zinc-800 px-3 py-2.5">
                <div className="text-[9px] uppercase tracking-wider text-zinc-600">
                  Cost × qty
                </div>
                <div className="text-sm font-mono text-zinc-200">
                  {fmtMoney(session.costPaid)}
                </div>
              </div>
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-3 py-2.5">
                <div className="text-[9px] uppercase tracking-wider text-emerald-500/80">
                  Vs EV
                </div>
                <div
                  className={`text-sm font-mono ${
                    session.vsExpected >= 0
                      ? "text-emerald-300"
                      : "text-amber-300"
                  }`}
                >
                  {fmtMoney(session.vsExpected)} (
                  {fmtPct(
                    session.expectedEV > 0
                      ? (session.vsExpected / session.expectedEV) * 100
                      : 0
                  )}
                  )
                </div>
              </div>
            </div>
            <p className="text-[12px] text-zinc-400">
              Vs cost:{" "}
              <span
                className={
                  session.vsCost >= 0 ? "text-emerald-300" : "text-amber-300"
                }
              >
                {fmtMoney(session.vsCost)}
              </span>{" "}
              on {session.quantity}× {session.product.name} (
              {session.product.format}).
            </p>

            <ul className="space-y-2 max-h-80 overflow-y-auto">
              {shownPacks.map((pack) => (
                <li
                  key={pack.packIndex}
                  className="rounded-xl border border-zinc-800 bg-black/30 px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-semibold text-cyan-300/90">
                      Pack {pack.packIndex}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-300">
                      {fmtMoney(pack.packValue)}
                    </span>
                  </div>
                  {pack.pulls.length === 0 ? (
                    <div className="text-[12px] text-zinc-500">No hits rolled</div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {pack.pulls.map((pull, i) => (
                        <span
                          key={`${pack.packIndex}-${i}`}
                          className={`text-[11px] rounded-lg px-2 py-1 border ${
                            pack.highlight?.name === pull.name &&
                            pull.avgValue === pack.highlight.avgValue
                              ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-100"
                              : "border-zinc-800 bg-zinc-900/50 text-zinc-300"
                          }`}
                        >
                          {pull.name} · {fmtMoney(pull.avgValue)}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={runOpen}
                className="text-[12px] px-3 py-2 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-100 hover:bg-cyan-500/25"
              >
                Open again
              </button>
              <Link
                href={`/log?pack=${session.product.id}&qty=${session.quantity}`}
                className="text-[12px] px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200/90 hover:bg-cyan-500/20"
              >
                Log this rip →
              </Link>
              <Link
                href={`/?pack=${session.product.id}`}
                className="text-[12px] px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/25"
              >
                Verdict / Calculator →
              </Link>
            </div>
          </section>
        )}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-green-500/15 bg-black/80 backdrop-blur-md lg:hidden">
        <div className="flex max-w-3xl mx-auto px-2 py-2 gap-1">
          <Link
            href="/"
            className="flex-1 py-2 rounded-xl text-[11px] font-medium border border-zinc-800 text-zinc-400 text-center"
          >
            ⚡ EV
          </Link>
          <Link
            href="/open"
            className="flex-1 py-2 rounded-xl text-[11px] font-medium border border-cyan-400/50 bg-cyan-500/15 text-cyan-200 text-center"
          >
            🎁 Open
          </Link>
          <Link
            href="/deals"
            className="flex-1 py-2 rounded-xl text-[11px] font-medium border border-zinc-800 text-zinc-400 text-center"
          >
            💎 Deals
          </Link>
          <Link
            href="/log"
            className="flex-1 py-2 rounded-xl text-[11px] font-medium border border-zinc-800 text-zinc-400 text-center"
          >
            📝 Log
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default function OpenPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen portal-bg flex items-center justify-center text-sm text-zinc-500">
          Loading pack opener…
        </div>
      }
    >
      <OpenInner />
    </Suspense>
  );
}
