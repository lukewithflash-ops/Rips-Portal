"use client";

import { useState, useMemo, useRef } from "react";
import {
  categories,
  products,
  calculateEV,
  type Category,
  type Product,
} from "@/lib/products";

const RECENT_RIPS = [
  { set: "Ascended Heroes", packs: 12, ev: 9.1, roi: -18 },
  { set: "Chrome Update Hobby", packs: 1, ev: 720, roi: -24 },
  { set: "Prismatic Evolutions", packs: 24, ev: 11.2, roi: -12 },
  { set: "OP-16 Box", packs: 1, ev: 98, roi: -15 },
  { set: "Surging Sparks", packs: 36, ev: 4.8, roi: -13 },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>("pokemon");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customPrice, setCustomPrice] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [view, setView] = useState<"calculator" | "insider">("calculator");
  const resultsRef = useRef<HTMLDivElement>(null);

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
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const topSlot = effectiveProduct?.slots
    .slice()
    .sort((a, b) => b.oddsNum * b.avgValue - a.oddsNum * a.avgValue)[0];

  const roiVisual = Math.min(100, Math.max(0, Math.abs(roi)));

  return (
    <div className="flex min-h-screen portal-bg">
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
            { icon: "⚡", label: "EV Calculator", id: "calculator" as const, active: view === "calculator" },
            { icon: "🔐", label: "Insider Pro", id: "insider" as const, active: view === "insider", pro: true },
            { icon: "📦", label: "Packs & Sets", soon: true },
            { icon: "🃏", label: "Card Database", soon: true },
            { icon: "📊", label: "Market Tracker", soon: true },
            { icon: "⭐", label: "Watchlist", soon: true },
            { icon: "🔬", label: "Simulations", soon: true },
            { icon: "🕐", label: "History", soon: true },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                if ("id" in item && item.id) setView(item.id);
              }}
              className={`sidebar-item w-full rounded-lg px-3 py-2.5 text-sm flex items-center gap-2.5 text-left ${
                item.active ? "active font-medium" : "text-zinc-500"
              } ${"soon" in item && item.soon ? "cursor-default" : "cursor-pointer hover:text-green-300"}`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
              {"pro" in item && item.pro && (
                <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wide">
                  Pro
                </span>
              )}
              {"soon" in item && item.soon && (
                <span className="ml-auto text-[9px] text-zinc-600 uppercase tracking-wide">
                  Soon
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-green-500/10">
          <div className="rounded-xl overflow-hidden border border-purple-500/30 purple-glow relative">
            <div className="h-28 bg-gradient-to-br from-purple-900/50 via-black to-green-900/40 flex items-center justify-center relative">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.25),transparent_70%)]" />
              <div className="w-16 h-16 rounded-full border-2 border-green-400/70 portal-glow flex items-center justify-center z-10">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400/30 to-purple-500/20" />
              </div>
            </div>
            <div className="p-3 bg-black/70">
              <div className="text-xs font-semibold text-purple-300 mb-1">
                ENTER THE RIP
              </div>
              <div className="text-[10px] text-zinc-500 leading-snug mb-2">
                Open packs. Chase hits. Calculate smarter.
              </div>
              <button className="w-full text-[11px] py-1.5 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-200">
                Explore Lab →
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
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
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-300">
              ⚡ Free Access
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="mb-5">
            <div className="text-[11px] uppercase tracking-[0.2em] text-green-400/70 mb-1.5">
              Calculate. Rip. Repeat.
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Pack EV. <span className="text-green-400 neon-text">Perfected.</span>
            </h1>
            <p className="text-sm text-zinc-500 mt-1 max-w-lg">
              Expected value for Pokémon, Sports & One Piece — know before you rip.
            </p>
          </div>

          {view === "calculator" && (
            <div className="flex flex-wrap gap-2 mb-5">
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
          )}

          <div className="flex gap-2 mb-4 lg:hidden">
            <button
              onClick={() => setView("calculator")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border ${
                view === "calculator"
                  ? "bg-green-500/15 border-green-400/60 text-green-300"
                  : "border-zinc-800 text-zinc-400"
              }`}
            >
              ⚡ Calculator
            </button>
            <button
              onClick={() => setView("insider")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border ${
                view === "insider"
                  ? "bg-amber-500/15 border-amber-400/60 text-amber-300"
                  : "border-zinc-800 text-zinc-400"
              }`}
            >
              🔐 Insider Pro
            </button>
          </div>

          {view === "insider" ? (
            <div className="space-y-5 max-w-4xl">
              <div className="panel rounded-2xl p-5 border border-amber-500/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10 pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-amber-400/80">Portal Protocol</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">PRO</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Insider Access</h2>
                  <p className="text-sm text-zinc-400 max-w-xl mb-4">
                    Best EV ranks, avoid lists, deeper odds notes, and early set data — built for people who want an edge before they rip.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 rounded-xl text-sm font-medium bg-amber-500/20 border border-amber-400/50 text-amber-200 hover:bg-amber-500/30 transition">
                      Join Insider — $4.99/mo
                    </button>
                    <button className="px-4 py-2 rounded-xl text-sm border border-zinc-700 text-zinc-400">
                      Waitlist
                    </button>
                  </div>
                </div>
              </div>

              <div className="panel rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">Best EV Packs This Week</h3>
                  <span className="text-[10px] text-zinc-500">Sample preview</span>
                </div>
                <div className="space-y-2">
                  {[
                    { rank: 1, name: "Journey Together Pack", price: 3.75, ev: 4.1, roi: 9, note: "Strong IR/SIR floor at current prices" },
                    { rank: 2, name: "Surging Sparks Pack", price: 4.25, ev: 4.6, roi: 8, note: "Consistent modern value" },
                    { rank: 3, name: "OP-16 Booster Box", price: 95, ev: 102, roi: 7, note: "Box math cleaner than singles" },
                    { rank: 4, name: "2026 Topps Series 1 Blaster", price: 25, ev: 26.5, roi: 6, note: "Cheap entry, low downside" },
                    { rank: 5, name: "Obsidian Flames Pack", price: 3.5, ev: 3.7, roi: 6, note: "Older set, fair secondary" },
                  ].map((row) => (
                    <div key={row.rank} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-300">
                        {row.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-zinc-100 font-medium truncate">{row.name}</div>
                        <div className="text-[11px] text-zinc-500 truncate">{row.note}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-mono text-green-400">+{row.roi}%</div>
                        <div className="text-[10px] text-zinc-500">${row.price} → ${row.ev}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">Avoid These (Overpriced)</h3>
                  <span className="text-[10px] text-red-400/70">High premium</span>
                </div>
                <div className="space-y-2">
                  {[
                    { name: "Ascended Heroes Pack", price: 14, ev: 8.3, roi: -41, note: "Chase tax — fun, not EV" },
                    { name: "Prismatic Evolutions Pack", price: 15, ev: 7.2, roi: -52, note: "Still inflated secondary" },
                    { name: "Chrome Update Hobby", price: 950, ev: 720, roi: -24, note: "Need huge hits to win" },
                  ].map((row) => (
                    <div key={row.name} className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                      <div className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-xs text-red-300">
                        ✕
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-zinc-100 font-medium truncate">{row.name}</div>
                        <div className="text-[11px] text-zinc-500 truncate">{row.note}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-mono text-red-400">{row.roi}%</div>
                        <div className="text-[10px] text-zinc-500">${row.price} → ${row.ev}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: "Deeper Odds Notes", desc: "Line-by-line variance and hit rate context per set." },
                  { title: "Collection / Pull Tracker", desc: "Log pulls and see personal EV over time." },
                  { title: "Early Set Data", desc: "First-look EV models when new products drop." },
                  { title: "Custom Simulations", desc: "Run box/case sims before you buy." },
                ].map((f) => (
                  <div key={f.title} className="panel rounded-xl p-4 border border-zinc-800">
                    <div className="text-sm font-medium text-zinc-200 mb-1">{f.title}</div>
                    <div className="text-[12px] text-zinc-500">{f.desc}</div>
                    <div className="mt-2 text-[10px] text-amber-400/70 uppercase tracking-wide">Insider soon</div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-zinc-600">
                Preview data is illustrative. Live Insider rankings will update weekly. Free calculator stays free forever.
              </p>
            </div>
          ) : effectiveProduct ? (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">
                  Select Pack / Box
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory lg:grid lg:grid-cols-3 xl:grid-cols-4 lg:overflow-visible">
                  {categoryProducts.map((p) => {
                    const isTrending =
                      p.id.includes("ascended") || p.id.includes("chrome-update");
                    const isActive = effectiveProduct.id === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSelectProduct(p.id)}
                        className={`
                          snap-start flex-shrink-0 w-[140px] lg:w-auto text-left rounded-xl border overflow-hidden transition-all card-hover
                          ${
                            isActive
                              ? "border-green-400/70 portal-glow ring-1 ring-green-400/30"
                              : "border-zinc-800/80 hover:border-green-500/30"
                          }
                        `}
                      >
                        <div
                          className={`h-24 lg:h-20 bg-gradient-to-br ${
                            p.accent || "from-zinc-700 to-zinc-800"
                          } flex items-center justify-center relative overflow-hidden`}
                        >
                          {p.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.image}
                              alt={p.name}
                              className="h-full w-full object-contain p-1"
                            />
                          ) : (
                            <span className="text-3xl drop-shadow-lg">{p.emoji || "📦"}</span>
                          )}
                          {(p.tag === "value" || p.tag === "hot" || isTrending) && (
                            <span className={`absolute top-1.5 right-1.5 text-[8px] px-1.5 py-0.5 rounded font-medium border ${
                              p.tag === "value"
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                : "bg-black/50 text-green-300 border-green-500/40"
                            }`}>
                              {p.tag === "value" ? "VALUE" : "HOT"}
                            </span>
                          )}
                        </div>
                        <div className="p-2.5 bg-zinc-900/90">
                          <div className="font-semibold text-zinc-100 text-xs leading-tight line-clamp-2">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-0.5 truncate">
                            {p.format}
                          </div>
                          <div className="text-[11px] text-green-400/80 mt-1 font-mono">
                            ~${p.defaultPrice.toFixed(2)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div ref={resultsRef} className="grid lg:grid-cols-12 gap-5 scroll-mt-20">
                <div className="lg:col-span-8 space-y-4">
                  <div className="panel rounded-2xl p-4 md:p-5 portal-border">
                    <div className="flex gap-3 md:gap-4 mb-4">
                      <div
                        className={`w-16 h-24 md:w-20 md:h-28 rounded-xl bg-gradient-to-br ${
                          effectiveProduct.accent || "from-zinc-700 to-zinc-800"
                        } flex items-center justify-center text-3xl md:text-4xl shrink-0 shadow-lg border border-white/10 overflow-hidden`}
                      >
                        {effectiveProduct.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={effectiveProduct.image}
                            alt={effectiveProduct.name}
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          effectiveProduct.emoji || "📦"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg md:text-xl font-bold text-white leading-tight">
                          {effectiveProduct.name}
                        </h2>
                        <p className="text-sm text-zinc-400 mt-0.5">
                          {effectiveProduct.format}
                        </p>
                        <div className="flex flex-wrap items-end gap-3 mt-3">
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wider">
                              Your Price ($)
                            </label>
                            <input
                              type="number"
                              inputMode="decimal"
                              step="0.01"
                              min="0"
                              value={customPrice !== "" ? customPrice : price}
                              onChange={(e) => setCustomPrice(e.target.value)}
                              className="w-28 bg-black/70 border border-zinc-700 rounded-lg px-3 py-2.5 text-right text-green-300 font-mono text-sm focus:outline-none focus:border-green-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wider">
                              Qty
                            </label>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-9 h-10 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-lg"
                              >
                                −
                              </button>
                              <span className="w-9 text-center font-mono text-sm">
                                {quantity}
                              </span>
                              <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-9 h-10 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-lg"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {result && (
                      <div
                        className={`rounded-xl p-4 mb-4 border ${
                          totalProfit >= 0
                            ? "bg-green-500/10 border-green-400/40 portal-glow"
                            : "bg-red-500/10 border-red-400/30"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1">
                              Expected Value
                            </div>
                            <div className="text-3xl md:text-4xl font-bold font-mono text-white tracking-tight">
                              ${result.totalEV.toFixed(2)}
                            </div>
                            <div className="text-sm text-zinc-400 mt-1">
                              per unit
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
                              vs Price
                            </div>
                            <div
                              className={`text-xl md:text-2xl font-bold font-mono ${
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

                          <div className="flex flex-col items-center">
                            <svg width="64" height="64" className="-rotate-90">
                              <circle
                                cx="32"
                                cy="32"
                                r="26"
                                fill="none"
                                stroke="#1a1a24"
                                strokeWidth="5"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="26"
                                fill="none"
                                stroke={roi >= 0 ? "#39ff14" : "#f87171"}
                                strokeWidth="5"
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 26}
                                strokeDashoffset={
                                  2 * Math.PI * 26 -
                                  (roiVisual / 100) * 2 * Math.PI * 26
                                }
                                className="transition-all duration-500"
                              />
                            </svg>
                            <span
                              className={`text-xs font-bold font-mono -mt-9 ${
                                roi >= 0 ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              {roi >= 0 ? "+" : ""}
                              {Math.round(roi)}%
                            </span>
                            <span className="text-[9px] text-zinc-500 mt-4">ROI</span>
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
                      <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">
                        Value Breakdown
                      </h3>
                      <div className="space-y-0.5">
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

                <div className="lg:col-span-4 space-y-4">
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
                  </div>

                  <div className="panel rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                        Recent Rips
                      </h3>
                      <span className="text-[9px] text-zinc-600">Sample</span>
                    </div>
                    <div className="space-y-2.5">
                      {RECENT_RIPS.map((r, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-sm border-b border-zinc-800/40 pb-2 last:border-0 last:pb-0"
                        >
                          <div className="min-w-0">
                            <div className="text-zinc-200 truncate text-[12px]">
                              {r.set}
                            </div>
                            <div className="text-[10px] text-zinc-500">
                              {r.packs} pack{r.packs > 1 ? "s" : ""}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-mono text-[12px] text-zinc-300">
                              ${r.ev.toFixed(2)}
                            </div>
                            <div
                              className={`text-[10px] font-mono ${
                                r.roi >= 0 ? "text-green-400" : "text-red-400/80"
                              }`}
                            >
                              {r.roi >= 0 ? "+" : ""}
                              {r.roi}%
                            </div>
                          </div>
                        </div>
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
                    </div>
                  )}

                  <p className="text-[10px] text-zinc-600 leading-relaxed px-1">
                    Values are approximate. Decision aid only — not financial advice.
                  </p>
                </div>
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
