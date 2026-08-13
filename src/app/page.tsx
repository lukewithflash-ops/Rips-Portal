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

  const categoryProducts = useMemo(
    () => products.filter((p) => p.category === activeCategory),
    [activeCategory]
  );

  const selectedProduct: Product | null = useMemo(() => {
    if (!selectedId) return categoryProducts[0] ?? null;
    return products.find((p) => p.id === selectedId) ?? null;
  }, [selectedId, categoryProducts]);

  // Keep selected product in sync when category changes
  const effectiveProduct = selectedProduct && selectedProduct.category === activeCategory
    ? selectedProduct
    : categoryProducts[0] ?? null;

  const price = customPrice !== ""
    ? parseFloat(customPrice) || 0
    : effectiveProduct?.defaultPrice ?? 0;

  const result = effectiveProduct
    ? calculateEV(effectiveProduct, price)
    : null;

  const handleCategory = (cat: Category) => {
    setActiveCategory(cat);
    setSelectedId(null);
    setCustomPrice("");
  };

  const handleSelectProduct = (id: string) => {
    setSelectedId(id);
    setCustomPrice("");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-green-500/20 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 portal-glow flex items-center justify-center text-xl font-bold text-black">
              🌀
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight neon-text text-green-400">
                Rip Portal
              </h1>
              <p className="text-xs text-zinc-500">Multiverse Pack EV Calculator</p>
            </div>
          </div>
          <div className="text-xs text-zinc-500 hidden sm:block">
            Approximate math • Update prices often
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategory(cat.id)}
              className={`
                px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                border card-hover
                ${
                  activeCategory === cat.id
                    ? "bg-green-500/20 border-green-400 text-green-300 portal-glow"
                    : "bg-zinc-900/60 border-zinc-700 text-zinc-400 hover:border-green-500/50 hover:text-green-300"
                }
              `}
            >
              <span className="mr-1.5">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {effectiveProduct ? (
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Product List */}
            <div className="lg:col-span-2 space-y-3">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Products
              </h2>
              {categoryProducts.map((p) => {
                const isTrending =
                  p.id.includes("ascended") || p.id.includes("chrome-update");
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProduct(p.id)}
                    className={`
                      w-full text-left p-4 rounded-xl border transition-all duration-200 card-hover
                      ${
                        effectiveProduct.id === p.id
                          ? "bg-green-500/10 border-green-400/60 portal-glow"
                          : "bg-zinc-900/50 border-zinc-800 hover:border-green-500/40"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-zinc-100">{p.name}</div>
                      {isTrending && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-300 border border-green-500/40 font-medium">
                          TRENDING
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-zinc-500 mt-0.5">{p.format}</div>
                    <div className="text-xs text-green-400/80 mt-2">
                      Default ~${p.defaultPrice.toFixed(2)}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Calculator Panel */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-green-500/30 bg-zinc-900/70 backdrop-blur p-6 portal-border">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {effectiveProduct.name}
                    </h2>
                    <p className="text-zinc-400 text-sm mt-1">
                      {effectiveProduct.format}
                    </p>
                  </div>
                  <div className="text-right">
                    <label className="block text-xs text-zinc-500 mb-1">
                      Your Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={customPrice !== "" ? customPrice : price}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      className="w-28 bg-black/60 border border-zinc-700 rounded-lg px-3 py-2 text-right text-green-300 font-mono focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/50"
                    />
                  </div>
                </div>

                {/* EV Result */}
                {result && (
                  <div
                    className={`
                      rounded-xl p-5 mb-6 border
                      ${
                        result.profit >= 0
                          ? "bg-green-500/10 border-green-400/50"
                          : "bg-red-500/10 border-red-400/40"
                      }
                    `}
                  >
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-zinc-400 mb-1">
                          Expected Value
                        </div>
                        <div className="text-3xl font-bold font-mono text-white">
                          ${result.totalEV.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs uppercase tracking-wider text-zinc-400 mb-1">
                          vs Your Price
                        </div>
                        <div
                          className={`text-2xl font-bold font-mono ${
                            result.profit >= 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {result.profit >= 0 ? "+" : ""}
                          ${result.profit.toFixed(2)}
                          <span className="text-base ml-2 opacity-80">
                            ({result.roi >= 0 ? "+" : ""}
                            {result.roi.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm">
                      {result.profit >= 0 ? (
                        <span className="text-green-300">
                          ▲ Positive EV territory — math favors opening on average
                        </span>
                      ) : (
                        <span className="text-red-300">
                          ▼ Negative EV — you&apos;re paying a premium for the chase / fun
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Breakdown */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                    Value Breakdown (approx)
                  </h3>
                  <div className="space-y-2">
                    {effectiveProduct.slots.map((slot, i) => {
                      const contribution = slot.oddsNum * slot.avgValue;
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between text-sm py-2 border-b border-zinc-800/80 last:border-0"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-zinc-200 truncate">{slot.name}</div>
                            <div className="text-xs text-zinc-500">
                              Odds {slot.odds}
                            </div>
                          </div>
                          <div className="text-right font-mono text-zinc-300">
                            ${contribution.toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {effectiveProduct.notes && (
                  <p className="mt-5 text-xs text-zinc-500 leading-relaxed">
                    {effectiveProduct.notes}
                  </p>
                )}
              </div>

              {/* Disclaimer */}
              <p className="mt-4 text-xs text-zinc-600 text-center leading-relaxed max-w-lg mx-auto">
                All values and odds are approximate community estimates and change
                constantly. This is a decision aid, not financial advice. Ripping is
                for fun — treat it that way.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center text-zinc-500 py-20">
            No products in this category yet.
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-800/80 py-6 text-center text-xs text-zinc-600">
        <div className="max-w-5xl mx-auto px-4">
          Rip Portal — Built for collectors who want the math before the dopamine.
          <br />
          <span className="text-zinc-700">Not affiliated with any card company or Pokémon / One Piece / Topps.</span>
        </div>
      </footer>
    </div>
  );
}
