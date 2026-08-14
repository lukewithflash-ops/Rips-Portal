"use client";

import { useState, useMemo } from "react";
import {
  categories,
  products,
  calculateEV,
  type Category,
  type Product,
} from "@/lib/products";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>("pokemon");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customPrice, setCustomPrice] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  const categoryProducts = useMemo(
    () => products.filter((p) => p.category === activeCategory),
    [activeCategory]
  );

  const selectedProduct: Product | null = useMemo(() => {
    if (!selectedId) return categoryProducts[0] ?? null;
    return products.find((p) => p.id === selectedId) ?? null;
  }, [selectedId, categoryProducts]);

  const effectiveProduct =
    selectedProduct && selectedProduct.category === activeCategory
      ? selectedProduct
      : categoryProducts[0] ?? null;

  const price =
    customPrice !== ""
      ? parseFloat(customPrice) || 0
      : effectiveProduct?.defaultPrice ?? 0;

  const result = effectiveProduct
    ? calculateEV(effectiveProduct, price)
    : null;

  const totalEVScaled = result ? result.totalEV * quantity : 0;
  const totalCost = price * quantity;
  const totalProfit = totalEVScaled - totalCost;
  const roi = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  const handleCategory = (cat: Category) => {
    setActiveCategory(cat);
    setSelectedId(null);
    setCustomPrice("");
  };

  const handleSelectProduct = (id: string) => {
    setSelectedId(id);
    setCustomPrice("");
  };

  const topSlot = effectiveProduct?.slots
    .slice()
    .sort((a, b) => b.oddsNum * b.avgValue - a.oddsNum * a.avgValue)[0];

  return (
    <div className="flex min-h-screen portal-bg">
      {/* ========== LEFT SIDEBAR ========== */}
      <aside className="sidebar w-56 flex-shrink-0 hidden lg:flex flex-col">
        <div className="p-4 border-b border-green-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 portal-glow flex items-center justify-center text-lg font-bold text-black">
              🌀
            </div>
            <div>
              <div className="font-bold text-green-400 neon-text text-sm leading-tight">
                Rip Portal
              </div>
              <div className="text-[10px] text-zinc-500 tracking-wider">
                PACK EV CALCULATOR
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-2.5 space-y-0.5 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600 px-3 mb-2">
            Tools
          </div>
          {[
            { icon: "⚡", label: "EV Calculator", active: true },
            { icon: "📦", label: "Packs & Sets" },
            { icon: "🃏", label: "Card Database" },
            { icon: "📊", label: "Market Tracker" },
            { icon: "⭐", label: "Watchlist" },
            { icon: "🔬", label: "Simulations" },
            { icon: "🕐", label: "History" },
            { icon: "📑", label: "Reports" },
          ].map((item) => (
            <div
              key={item.label}
              className={`sidebar-item rounded-lg px-3 py-2.5 text-sm flex items-center gap-2.5 ${
                item.active
                  ? "active font-medium"
                  : "text-zinc-500 cursor-default"
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
              {!item.active && (
                <span className="ml-auto text-[9px] text-zinc-600 uppercase tracking-wide">
                  Soon
                </span>
              )}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-green-500/10">
          <div className="rounded-xl overflow-hidden border border-purple-500/30 purple-glow relative">
            <div className="h-24 bg-gradient-to-br from-purple-900/40 via-black to-green-900/30 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full border-2 border-green-400/60 portal-glow flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-green-400/20" />
              </div>
            </div>
            <div className="p-3 bg-black/60">
              <div className="text-xs font-semibold text-purple-300 mb-1">
                ENTER THE RIP
              </div>
              <div className="text-[10px] text-zinc-500 leading-snug mb-2">
                Open packs. Chase hits. Calculate smarter.
              </div>
              <button className="w-full text-[11px] py-1.5 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-200 hover:bg-purple-600/50 transition">
                Explore Lab →
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ========== MAIN ========== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="border-b border-green-500/15 bg-black/40 backdrop-blur-md sticky top-0 z-40">
          <div className="px-4 md:px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="lg:hidden flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 portal-glow flex items-center justify-center text-sm font-bold text-black">
                  🌀
                </div>
                <span className="font-bold text-green-400 neon-text text-sm">
                  Rip Portal
                </span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500">
                <span className="text-green-400/80 font-medium">MULTIVERSE LAB</span>
                <span className="text-zinc-700">•</span>
                <span>DASHBOARD</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-300">
                ⚡ Free Access
              </span>
              <span className="text-[11px] text-zinc-600 hidden md:inline">
                Not financial advice
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {/* Hero */}
          <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-green-400/70 mb-1.5">
                Calculate. Rip. Repeat.
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Pack EV. <span className="text-green-400 neon-text">Perfected.</span>
              </h1>
              <p className="text-sm text-zinc-500 mt-1 max-w-md">
                Expected value analysis across Pokémon, Sports, and TCG multiverse.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategory(cat.id)}
                  className={`
                    px-3.5 py-1.5 rounded-xl text-sm font-medium border transition-all
                    ${
                      activeCategory === cat.id
                        ? "bg-green-500/15 border-green-400/60 text-green-300 portal-glow"
                        : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-green-500/40 hover:text-green-300"
                    }
                  `}
                >
                  <span className="mr-1">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {effectiveProduct ? (
            <div className="grid xl:grid-cols-12 gap-5">
              {/* LEFT: Product list */}
              <div className="xl:col-span-3 space-y-2">
                <h2 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">
                  Select Pack / Set
                </h2>
                {categoryProducts.map((p) => {
                  const isTrending =
                    p.id.includes("ascended") || p.id.includes("chrome-update");
                  const isActive = effectiveProduct.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProduct(p.id)}
                      className={`
                        w-full text-left p-3.5 rounded-xl border transition-all card-hover
                        ${
                          isActive
                            ? "bg-green-500/10 border-green-400/50 portal-glow"
                            : "bg-zinc-900/40 border-zinc-800/80 hover:border-green-500/30"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-zinc-100 text-sm">
                          {p.name}
                        </span>
                        {isTrending && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-300 border border-green-500/40 font-medium trending-pulse">
                            TRENDING
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">{p.format}</div>
                      <div className="text-[11px] text-green-400/70 mt-1.5 font-mono">
                        Default ~${p.defaultPrice.toFixed(2)}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* CENTER: Calculator */}
              <div className="xl:col-span-6 space-y-4">
                <div className="panel rounded-2xl p-5 portal-border">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {effectiveProduct.name}
                      </h2>
                      <p className="text-sm text-zinc-400">{effectiveProduct.format}</p>
                    </div>
                    <div className="flex items-end gap-3">
                      <div>
                        <label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wider">
                          Pack Cost ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={customPrice !== "" ? customPrice : price}
                          onChange={(e) => setCustomPrice(e.target.value)}
                          className="w-28 bg-black/70 border border-zinc-700 rounded-lg px-3 py-2 text-right text-green-300 font-mono text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/40"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wider">
                          Qty
                        </label>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-8 h-9 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-green-500/50"
                          >
                            −
                          </button>
                          <span className="w-10 text-center font-mono text-sm">
                            {quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-8 h-9 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-green-500/50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {result && (
                    <div
                      className={`rounded-xl p-5 mb-5 border ${
                        totalProfit >= 0
                          ? "bg-green-500/10 border-green-400/40 portal-glow"
                          : "bg-red-500/10 border-red-400/30"
                      }`}
                    >
                      <div className="flex flex-wrap items-end justify-between gap-6">
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1">
                            Expected Value (EV)
                          </div>
                          <div className="text-4xl font-bold font-mono text-white tracking-tight">
                            ${result.totalEV.toFixed(2)}
                          </div>
                          <div className="text-sm text-zinc-400 mt-1">
                            per pack
                            {quantity > 1 && (
                              <span className="text-zinc-500">
                                {" "}
                                · ${totalEVScaled.toFixed(2)} total
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1">
                            vs Your Price
                          </div>
                          <div
                            className={`text-2xl font-bold font-mono ${
                              totalProfit >= 0 ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {totalProfit >= 0 ? "+" : ""}
                            ${totalProfit.toFixed(2)}
                          </div>
                          <div
                            className={`text-sm font-mono ${
                              roi >= 0 ? "text-green-400/80" : "text-red-400/80"
                            }`}
                          >
                            {roi >= 0 ? "+" : ""}
                            {roi.toFixed(1)}% ROI
                          </div>
                        </div>
                        <div className="hidden sm:flex flex-col items-center">
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center border-4"
                            style={{
                              borderColor:
                                roi >= 0
                                  ? "rgba(57,255,20,0.6)"
                                  : "rgba(248,113,113,0.5)",
                            }}
                          >
                            <span
                              className={`text-xs font-bold font-mono ${
                                roi >= 0 ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              {roi >= 0 ? "+" : ""}
                              {Math.round(roi)}%
                            </span>
                          </div>
                          <span className="text-[9px] text-zinc-500 mt-1">ROI</span>
                        </div>
                      </div>
                      <div className="mt-3 text-sm">
                        {totalProfit >= 0 ? (
                          <span className="text-green-300">
                            ▲ Positive EV — math favors opening on average
                          </span>
                        ) : (
                          <span className="text-red-300/90">
                            ▼ Negative EV — paying a premium for the chase / fun
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">
                      Value Breakdown (approx)
                    </h3>
                    <div className="space-y-1">
                      {effectiveProduct.slots.map((slot, i) => {
                        const contribution = slot.oddsNum * slot.avgValue;
                        const pct =
                          result && result.totalEV > 0
                            ? (contribution / result.totalEV) * 100
                            : 0;
                        return (
                          <div
                            key={i}
                            className="flex items-center justify-between text-sm py-2 border-b border-zinc-800/50 last:border-0"
                          >
                            <div className="flex-1 min-w-0 pr-3">
                              <div className="text-zinc-200 truncate text-[13px]">
                                {slot.name}
                              </div>
                              <div className="text-[11px] text-zinc-500">
                                Odds {slot.odds}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono text-zinc-300 text-sm">
                                ${contribution.toFixed(2)}
                              </div>
                              <div className="text-[10px] text-zinc-600">
                                {pct.toFixed(0)}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {effectiveProduct.notes && (
                    <p className="mt-4 text-[11px] text-zinc-500 leading-relaxed border-t border-zinc-800/50 pt-3">
                      {effectiveProduct.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* RIGHT column */}
              <div className="xl:col-span-3 space-y-4">
                <div className="panel rounded-2xl p-4">
                  <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">
                    Market Pulse
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "TCG Index", value: "+2.3%", color: "text-green-400" },
                      { label: "Hot Set", value: "Ascended Heroes", color: "text-purple-300" },
                      { label: "Sports EV", value: "+1.2%", color: "text-cyan-400" },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-zinc-400">{row.label}</span>
                        <span className={`font-medium ${row.color}`}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 h-8 rounded bg-zinc-900/80 flex items-end gap-0.5 px-1 pb-1">
                    {[40, 55, 45, 70, 60, 80, 75, 90, 85, 95].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm bg-green-500/40"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>

                {topSlot && (
                  <div className="panel rounded-2xl p-4">
                    <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">
                      Top EV Contributor
                    </h3>
                    <div className="text-sm font-medium text-zinc-100 mb-1">
                      {topSlot.name}
                    </div>
                    <div className="text-xs text-zinc-500 mb-2">
                      Odds {topSlot.odds}
                    </div>
                    <div className="text-lg font-mono text-green-400">
                      ${(topSlot.oddsNum * topSlot.avgValue).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-zinc-600 mt-1">
                      EV contribution per pack
                    </div>
                  </div>
                )}

                <div className="panel rounded-2xl p-4 border-cyan-500/20">
                  <h3 className="text-[10px] font-semibold text-cyan-400/80 uppercase tracking-widest mb-2">
                    Portal Protocol
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed mb-3">
                    Advanced filters. Custom sims. Edge in every rip.
                  </p>
                  <button className="w-full text-[11px] py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition">
                    Coming Soon →
                  </button>
                </div>

                <p className="text-[10px] text-zinc-600 leading-relaxed px-1">
                  All values and odds are approximate community estimates and change constantly. This is a decision aid, not financial advice. Ripping is for fun.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-zinc-500 py-20">
              No products in this category yet.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
