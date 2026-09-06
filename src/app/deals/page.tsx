"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  categories,
  products,
  calculateEV,
  pricesUpdated,
  type Category,
} from "@/lib/products";
import DealAlertsBanner from "@/components/DealAlertsBanner";
import BuyLinks from "@/components/BuyLinks";

const DISCLAIMER =
  "Under-EV Watch ranks catalog products where default/market price sits below modeled expected value (positive ROI / $ edge). Slot odds and averages are estimates — entertainment and math only, not financial, investment, or collecting advice. Markets move; verify live prices before you buy or rip. No gambling features.";

type SortKey = "roi" | "edge";

function fmtMoney(n: number): string {
  const abs = Math.abs(n);
  const body = abs >= 100 ? abs.toFixed(0) : abs.toFixed(2);
  return `${n < 0 ? "-" : ""}$${body}`;
}

function fmtRoi(roi: number): string {
  return `${roi >= 0 ? "+" : ""}${roi.toFixed(1)}%`;
}

export default function DealsPage() {
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("roi");
  const [copiedShare, setCopiedShare] = useState(false);

  const copyShareLink = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/deals`
        : "https://ripsportal.com/deals";
    try {
      await navigator.clipboard?.writeText(url);
      setCopiedShare(true);
      window.setTimeout(() => setCopiedShare(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const underEv = useMemo(() => {
    const rows = products
      .map((p) => {
        const { totalEV, roi, profit } = calculateEV(p, p.defaultPrice);
        return { product: p, totalEV, roi, profit, price: p.defaultPrice };
      })
      .filter((row) => row.profit > 0);

    rows.sort((a, b) =>
      sortKey === "edge" ? b.profit - a.profit : b.roi - a.roi
    );
    return rows;
  }, [sortKey]);

  const filtered = useMemo(() => {
    if (categoryFilter === "all") return underEv;
    return underEv.filter((row) => row.product.category === categoryFilter);
  }, [underEv, categoryFilter]);

  const catLabel = (id: Category) =>
    categories.find((c) => c.id === id)?.label ?? id;

  const catEmoji = (id: Category) =>
    categories.find((c) => c.id === id)?.emoji ?? "📦";

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
              <div className="font-bold text-emerald-400 neon-text text-sm leading-tight">
                Under-EV Watch
              </div>
              <div className="text-[10px] text-zinc-500 tracking-wider truncate">
                BUY SIGNALS · PRICE UNDER EV
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/log"
              className="text-[11px] text-cyan-400/90 hover:text-cyan-300 underline-offset-2 hover:underline hidden sm:inline"
            >
              Rip Log
            </Link>
            <Link
              href="/"
              className="text-[11px] text-emerald-400/90 hover:text-emerald-300 underline-offset-2 hover:underline"
            >
              ← Calculator
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 md:px-6 py-5 max-w-3xl mx-auto w-full space-y-4 pb-24">
        <section className="panel rounded-2xl p-4 border border-emerald-500/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-green-500/5 pointer-events-none" />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-widest text-emerald-400/90 font-semibold mb-1">
              Deals
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Price under expected EV
            </h1>
            <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
              Products where catalog default/market price is below modeled EV —
              ranked by ROI% or $ edge. Multi-hobby. Same math as the calculator.
            </p>
            <p className="text-[11px] text-zinc-500 mt-2">
              Prices sheet: {pricesUpdated} · {underEv.length} under-EV right now
              {categoryFilter !== "all"
                ? ` · ${filtered.length} in filter`
                : ""}
            </p>
            <button
              type="button"
              onClick={copyShareLink}
              className="mt-3 text-[11px] px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-200/90 hover:bg-emerald-500/20 transition-colors"
            >
              {copiedShare ? "Copied!" : "Copy share link"}
            </button>
          </div>
        </section>

        <div
          className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-[12px] text-amber-100/90 leading-relaxed"
          role="note"
        >
          {DISCLAIMER}
        </div>

        <DealAlertsBanner variant="banner" />
        <DealAlertsBanner variant="settings" />

        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] border ${
              categoryFilter === "all"
                ? "bg-emerald-500/15 border-emerald-400/50 text-emerald-300"
                : "bg-black/40 border-zinc-700 text-zinc-400"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryFilter(c.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] border ${
                categoryFilter === c.id
                  ? "bg-emerald-500/15 border-emerald-400/50 text-emerald-300"
                  : "bg-black/40 border-zinc-700 text-zinc-400"
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <span className="uppercase tracking-widest">Rank by</span>
          <button
            type="button"
            onClick={() => setSortKey("roi")}
            className={`rounded-lg px-2.5 py-1 border ${
              sortKey === "roi"
                ? "border-emerald-400/50 text-emerald-300 bg-emerald-500/10"
                : "border-zinc-800 text-zinc-400"
            }`}
          >
            ROI%
          </button>
          <button
            type="button"
            onClick={() => setSortKey("edge")}
            className={`rounded-lg px-2.5 py-1 border ${
              sortKey === "edge"
                ? "border-emerald-400/50 text-emerald-300 bg-emerald-500/10"
                : "border-zinc-800 text-zinc-400"
            }`}
          >
            $ edge
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="panel rounded-2xl p-8 text-center border border-zinc-800">
            <div className="text-3xl mb-2">📭</div>
            <h2 className="text-sm font-semibold text-zinc-200 mb-1">
              No under-EV products
            </h2>
            <p className="text-[13px] text-zinc-500 max-w-sm mx-auto leading-relaxed">
              {categoryFilter === "all"
                ? "Nothing in the catalog currently prices below modeled EV. Check back when prices update, or open the calculator to run your own number."
                : `No ${catLabel(categoryFilter)} products currently sit under EV. Try All or another category.`}
            </p>
            <Link
              href="/"
              className="inline-block mt-4 text-[12px] text-emerald-400 hover:text-emerald-300 underline-offset-2 hover:underline"
            >
              Open EV Calculator →
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map(({ product: p, totalEV, roi, profit, price }, idx) => (
              <li key={p.id}>
                <div className="panel rounded-2xl p-3.5 border border-emerald-500/15 hover:border-emerald-400/35 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-300 shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-zinc-100 truncate">
                            {p.emoji ?? catEmoji(p.category)} {p.name}
                          </div>
                          <div className="text-[11px] text-zinc-500 truncate">
                            {p.format} · {catLabel(p.category)}
                          </div>
                        </div>
                        <div className="text-right shrink-0 sm:hidden">
                          <div className="text-sm font-mono text-emerald-400">
                            {fmtRoi(roi)}
                          </div>
                          <div className="text-[10px] text-emerald-300/80">
                            {fmtMoney(profit)} edge
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 grid grid-cols-4 gap-2 sm:grid-cols-[repeat(4,4rem)] sm:justify-end">
                        <div className="rounded-lg bg-black/40 border border-zinc-800/80 px-2 py-1.5 text-center">
                          <div className="text-[9px] uppercase tracking-wider text-zinc-600">
                            Price
                          </div>
                          <div className="text-[12px] font-mono text-zinc-200">
                            {fmtMoney(price)}
                          </div>
                        </div>
                        <div className="rounded-lg bg-black/40 border border-zinc-800/80 px-2 py-1.5 text-center">
                          <div className="text-[9px] uppercase tracking-wider text-zinc-600">
                            EV
                          </div>
                          <div className="text-[12px] font-mono text-zinc-200">
                            {fmtMoney(totalEV)}
                          </div>
                        </div>
                        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/25 px-2 py-1.5 text-center">
                          <div className="text-[9px] uppercase tracking-wider text-emerald-500/80">
                            ROI%
                          </div>
                          <div className="text-[12px] font-mono text-emerald-300">
                            {fmtRoi(roi)}
                          </div>
                        </div>
                        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/25 px-2 py-1.5 text-center">
                          <div className="text-[9px] uppercase tracking-wider text-emerald-500/80">
                            $ edge
                          </div>
                          <div className="text-[12px] font-mono text-emerald-300">
                            {fmtMoney(profit)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5">
                        <BuyLinks query={p.name} compact />
                      </div>

                      <div className="mt-2.5 flex flex-wrap gap-2">
                        <Link
                          href={`/?pack=${p.id}`}
                          className="text-[11px] px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/25 transition-colors"
                        >
                          Open calculator
                        </Link>
                        <Link
                          href={`/log?pack=${p.id}`}
                          className="text-[11px] px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-200/90 hover:bg-cyan-500/20 transition-colors"
                        >
                          Log a rip
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            const url = `${window.location.origin}/pack/${p.id}`;
                            void navigator.clipboard?.writeText(url);
                          }}
                          className="text-[11px] px-2.5 py-1.5 rounded-lg bg-black/40 border border-zinc-700 text-zinc-300 hover:border-emerald-500/40 transition-colors"
                        >
                          Copy share link
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="text-[11px] text-zinc-600 leading-relaxed pt-2">
          Not financial advice. Under-EV ≠ guaranteed profit — variance,
          fees, and liquidity matter. Use the calculator for custom prices.
        </p>
      </main>
    </div>
  );
}
