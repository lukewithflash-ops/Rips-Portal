"use client";

import { useState, useMemo, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  categories,
  products,
  calculateEV,
  pricesUpdated,
  findProduct,
  PRODUCT_ID_ALIASES,
  type Category,
  type Product,
} from "@/lib/products";
import { chaseCards, searchCards, type ChaseCard } from "@/lib/cards";
import { computeVerdict, VERDICT_DISCLAIMER } from "@/lib/verdict";
import { computeKeeperEV } from "@/lib/keeper";
import KeeperEvPanel from "@/components/KeeperEvPanel";
import DealAlertsBanner from "@/components/DealAlertsBanner";
import BuyLinks, { AffiliateDisclosure } from "@/components/BuyLinks";
import { markPackInteracted } from "@/lib/pwa-install";
import BrandLogo from "@/components/BrandLogo";
import {
  shareOrDownloadProductImage,
  downloadProductShareImage,
} from "@/lib/openShareImage";

function HomeInner() {
  const [activeCategory, setActiveCategory] = useState<Category>("pokemon");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customPrice, setCustomPrice] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [view, setView] = useState<"calculator" | "insider" | "cards">("calculator");
  const [cardQuery, setCardQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState<ChaseCard | null>(null);
  const [packQuery, setPackQuery] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);
  const verdictRef = useRef<HTMLDivElement>(null);
  const [verdictHighlight, setVerdictHighlight] = useState(false);
  const [shareImageBusy, setShareImageBusy] = useState(false);
  const [shareImageNote, setShareImageNote] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const packFromUrl = searchParams.get("pack");

  // Deep link: ?pack=<productId>
  useEffect(() => {
    if (!packFromUrl) return;
    const match = findProduct(packFromUrl);
    if (!match) return;
    setActiveCategory(match.category);
    setSelectedId(match.id);
    setCustomPrice("");
    setView("calculator");
    setPackQuery("");
    setVerdictHighlight(true);
    // Install prompt: wait for explicit EV select / calc — not passive deep-link paint
    const t = window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    const clear = window.setTimeout(() => setVerdictHighlight(false), 2600);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(clear);
    };
  }, [packFromUrl]);

  const syncPackToUrl = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pack", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const filteredCards = useMemo(() => searchCards(cardQuery), [cardQuery]);

  const rankedByRoi = useMemo(() => {
    return products
      .map((p) => {
        const { totalEV, roi, profit } = calculateEV(p, p.defaultPrice);
        return { product: p, totalEV, roi, profit };
      })
      .sort((a, b) => b.roi - a.roi);
  }, []);

  const bestEvPacks = useMemo(() => rankedByRoi.slice(0, 5), [rankedByRoi]);
  const avoidPacks = useMemo(
    () => [...rankedByRoi].reverse().slice(0, 3),
    [rankedByRoi]
  );

  /** Best catalog under-EV (price under modeled EV) — teaches the buy-signal mode. */
  const bestUnderEv = useMemo(() => {
    return rankedByRoi.filter((row) => row.profit > 0)[0] ?? null;
  }, [rankedByRoi]);

  const underEvCount = useMemo(
    () => rankedByRoi.filter((row) => row.profit > 0).length,
    [rankedByRoi]
  );

  /**
   * Chase-tax example: popular/hot pack with a deep −ROI so the hero teaches
   * both modes instead of looking like VALUE vs −ROI are random.
   */
  const chaseTaxExample = useMemo(() => {
    const preferredIds = [
      "poke-ascended-pack",
      "poke-prismatic-pack",
      "poke-destined-pack",
      "poke-surging-pack",
    ];
    for (const id of preferredIds) {
      const row = rankedByRoi.find((r) => r.product.id === id);
      if (row && row.roi < -20) return row;
    }
    // Fallback: worst ROI among tagged hot/chase packs
    const tagged = rankedByRoi.filter(
      (r) =>
        r.roi < -20 &&
        (r.product.tag === "hot" || r.product.tag === "chase")
    );
    if (tagged.length) return tagged[tagged.length - 1];
    return rankedByRoi[rankedByRoi.length - 1] ?? null;
  }, [rankedByRoi]);

  const pricesUpdatedLabel = useMemo(() => {
    // pricesUpdated is YYYY-MM-DD from the sheet
    const raw = pricesUpdated;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
    if (!m) return raw;
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const day = String(Number(m[3]));
    return `${day} ${months[Number(m[2]) - 1]}`;
  }, []);

  const marketPulse = useMemo(() => {
    if (!rankedByRoi.length) {
      return { avgRoi: 0, hotSet: "—", bestRoiLabel: "—" };
    }
    const avgRoi =
      rankedByRoi.reduce((sum, row) => sum + row.roi, 0) / rankedByRoi.length;
    const hotSet = [...rankedByRoi].sort(
      (a, b) => b.product.defaultPrice - a.product.defaultPrice
    )[0]?.product.name;
    const best = rankedByRoi[0];
    const bestRoiLabel = `${best.roi >= 0 ? "+" : ""}${best.roi.toFixed(0)}% ${best.product.name}`;
    return {
      avgRoi,
      hotSet: hotSet || "—",
      bestRoiLabel,
    };
  }, [rankedByRoi]);

  const recentRips = useMemo(() => {
    // Illustrative "rip sessions" scaled from catalog EV (not user-submitted logs yet)
    return rankedByRoi.slice(0, 5).map((row, i) => {
      const packs = row.product.format.toLowerCase().includes("box")
        ? 1
        : row.product.format.toLowerCase().includes("etb")
          ? 1
          : [12, 24, 36, 6, 18][i] || 10;
      const perUnit = row.totalEV;
      return {
        set: row.product.name,
        packs,
        ev: Math.round(perUnit * 100) / 100,
        roi: Math.round(row.roi),
      };
    });
  }, [rankedByRoi]);


  const categoryProducts = useMemo(() => {
    const q = packQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (p.category !== activeCategory) return false;
      if (!q) return true;
      const hay = `${p.name} ${p.format}`.toLowerCase();
      if (hay.includes(q)) return true;
      // Legacy misspelled pack IDs resolve to Surging Sparks via aliases
      return Object.entries(PRODUCT_ID_ALIASES).some(
        ([alias, pid]) => alias.includes(q) && pid === p.id
      );
    });
  }, [activeCategory, packQuery]);

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

  const result = effectiveProduct ? calculateEV(effectiveProduct, price) : null;
  const verdict = effectiveProduct ? computeVerdict(effectiveProduct, price) : null;
  const totalEVScaled = result ? result.totalEV * quantity : 0;
  const totalCost = price * quantity;
  const totalProfit = totalEVScaled - totalCost;
  const roi = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  const handleCategory = (cat: Category) => {
    setActiveCategory(cat);
    setSelectedId(null);
    setCustomPrice("");
    setPackQuery("");
  };

  const handleSelectProduct = (id: string) => {
    setSelectedId(id);
    setCustomPrice("");
    syncPackToUrl(id);
    // Successful EV calc path (results panel for this pack) — gates install toast
    markPackInteracted();
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const topSlot = effectiveProduct?.slots
    .slice()
    .sort((a, b) => b.oddsNum * b.avgValue - a.oddsNum * a.avgValue)[0];

  const roiVisual = Math.min(100, Math.max(0, Math.abs(roi)));

  const logPrefillHref = effectiveProduct
    ? `/log?pack=${effectiveProduct.id}&qty=${quantity}&price=${encodeURIComponent(
        String(Math.round(price * 100) / 100)
      )}`
    : "/log";

  const productShareMeta =
    effectiveProduct && result
      ? {
          productId: effectiveProduct.id,
          productName: effectiveProduct.name,
          productFormat: effectiveProduct.format,
          productEmoji: effectiveProduct.emoji,
          price,
          ev: result.totalEV,
          roi,
          quantity,
          dateLabel: pricesUpdatedLabel,
        }
      : null;

  const handleShareProductImage = async () => {
    if (!productShareMeta || shareImageBusy) return;
    setShareImageBusy(true);
    setShareImageNote("Building 9:16 share card…");
    try {
      const outcome = await shareOrDownloadProductImage(productShareMeta, "story");
      if (outcome === "shared") {
        setShareImageNote("Shared — pick Stories / Messages in the sheet");
      } else if (outcome === "downloaded") {
        setShareImageNote("Saved image — ready for Stories");
      } else if (outcome === "unsupported") {
        await downloadProductShareImage(productShareMeta, "story");
        setShareImageNote("Saved image (share sheet unavailable)");
      } else {
        setShareImageNote(null);
      }
    } catch {
      try {
        if (productShareMeta) {
          await downloadProductShareImage(productShareMeta, "story");
          setShareImageNote("Saved image");
        }
      } catch {
        setShareImageNote("Couldn’t build share image");
      }
    } finally {
      setShareImageBusy(false);
      window.setTimeout(() => setShareImageNote(null), 3200);
    }
  };

  return (
    <div className="flex min-h-screen portal-bg">
      <aside className="sidebar w-56 flex-shrink-0 hidden lg:flex flex-col">
        <div className="p-4 border-b border-green-500/10">
          <div className="flex flex-col gap-1">
            <BrandLogo height={40} href={null} />
            <div className="text-[10px] text-purple-300/70 tracking-[0.18em] uppercase pl-0.5">
              Pack EV Calculator
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-2.5 space-y-0.5 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-widest text-zinc-600 px-3 mb-2">
            Tools
          </div>
          {[
            {
              icon: "⚡",
              label: "EV Calculator",
              id: "calculator" as const,
              active: view === "calculator",
            },
            {
              icon: "👑",
              label: "VIP — alerts soon",
              href: "/waitlist" as const,
            },
            {
              icon: "🃏",
              label: "Card Values",
              id: "cards" as const,
              active: view === "cards",
            },
            { icon: "🎁", label: "Open", href: "/open" as const },
            { icon: "📝", label: "Rip Log", href: "/log" as const },
            { icon: "💎", label: "Under-EV Watch", href: "/deals" as const },
            { icon: "📦", label: "Packs & Sets", soon: true },
            { icon: "📊", label: "Market Tracker", soon: true },
            { icon: "⭐", label: "Watchlist", soon: true },
          ].map((item) => {
            const className = `sidebar-item w-full rounded-lg px-3 py-2.5 text-sm flex items-center gap-2.5 text-left ${
              "active" in item && item.active ? "active font-medium" : "text-zinc-500"
            } ${
              "soon" in item && item.soon
                ? "cursor-default"
                : "cursor-pointer hover:text-green-300"
            }`;
            const inner = (
              <>
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
              </>
            );
            if ("href" in item && item.href) {
              return (
                <Link key={item.label} href={item.href} className={className}>
                  {inner}
                </Link>
              );
            }
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if ("id" in item && item.id) setView(item.id);
                }}
                className={className}
              >
                {inner}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-green-500/10">
          <div className="rounded-xl overflow-hidden border border-purple-500/30 purple-glow relative">
            <div className="h-28 bg-gradient-to-br from-purple-900/50 via-black to-green-900/40 flex items-center justify-center relative">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.25),transparent_70%)]" />
              <div className="z-10 drop-shadow-[0_0_24px_rgba(192,38,255,0.45)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/portal-app-icon.png" alt="" width={64} height={64} className="rounded-2xl border border-purple-400/30" />
              </div>
            </div>
            <div className="p-3 bg-black/70">
              <div className="text-xs font-semibold text-purple-300 mb-1">
                ENTER THE RIP
              </div>
              <div className="text-[10px] text-zinc-500 leading-snug mb-2">
                Open packs. Chase hits. Calculate smarter.
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-purple-500/20 bg-black/40 backdrop-blur-md sticky top-0 z-40 site-chrome">
          <div className="px-4 md:px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="lg:hidden flex items-center">
                <BrandLogo height={32} compact href={null} />
              </div>
              <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500">
                <span className="text-purple-300/90 font-medium">MULTIVERSE LAB</span>
                <span className="text-zinc-700">•</span>
                <span>DASHBOARD</span>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-400/35 text-purple-200">
              ⚡ Free Access
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="mb-5">
            <div className="text-[11px] uppercase tracking-[0.22em] text-purple-300/80 mb-1.5">
              Calculate · Rip · Repeat
            </div>
            <h1 className="text-2xl md:text-4xl headline-flare tracking-tight">
              Pack EV. Perfected.
            </h1>
            <p className="text-sm text-zinc-400 mt-2 max-w-lg leading-relaxed">
              Expected value for Pokémon, Sports & One Piece — know before you
              rip. Purple foil energy, green math accents.
            </p>
          </div>

          {view === "calculator" && (
            <div className="mb-5 panel rounded-2xl p-4 border border-emerald-500/35 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-green-500/5 pointer-events-none" />
              <div className="relative space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-emerald-400/90 font-semibold mb-0.5">
                      Under-EV Watch
                    </div>
                    <div className="text-sm font-bold text-white">
                      Today&apos;s best under-EV + a chase-tax example
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1 max-w-xl leading-relaxed">
                      Under-EV = catalog price below modeled EV (math leans buy/rip).
                      Chase tax = popular sealed you still open for fun despite deep −ROI.
                    </p>
                  </div>
                  <div className="shrink-0 text-[11px] text-zinc-500 sm:text-right">
                    Updated {pricesUpdatedLabel} · {underEvCount} under-EV
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {bestUnderEv ? (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategory(bestUnderEv.product.category);
                        setSelectedId(bestUnderEv.product.id);
                        setCustomPrice("");
                        setView("calculator");
                        syncPackToUrl(bestUnderEv.product.id);
                        markPackInteracted();
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/50 border border-emerald-500/35 text-left hover:border-emerald-400/60 transition-colors max-w-full"
                    >
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                        UNDER-EV
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-zinc-100 truncate">
                          {bestUnderEv.product.name}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          +{bestUnderEv.roi.toFixed(0)}% ROI · ~$
                          {bestUnderEv.product.defaultPrice.toFixed(2)} → $
                          {bestUnderEv.totalEV.toFixed(2)}
                        </div>
                      </div>
                    </button>
                  ) : (
                    <Link
                      href="/deals"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/50 border border-emerald-500/25 text-[11px] text-emerald-300"
                    >
                      No under-EV right now — open Under-EV Watch →
                    </Link>
                  )}
                  {chaseTaxExample && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategory(chaseTaxExample.product.category);
                        setSelectedId(chaseTaxExample.product.id);
                        setCustomPrice("");
                        setView("calculator");
                        syncPackToUrl(chaseTaxExample.product.id);
                        markPackInteracted();
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/50 border border-red-500/30 text-left hover:border-red-400/50 transition-colors max-w-full"
                    >
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/40 shrink-0">
                        CHASE TAX
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-zinc-100 truncate">
                          {chaseTaxExample.product.name}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {chaseTaxExample.roi.toFixed(0)}% ROI · fun, not +EV · ~$
                          {chaseTaxExample.product.defaultPrice.toFixed(2)} → $
                          {chaseTaxExample.totalEV.toFixed(2)}
                        </div>
                      </div>
                    </button>
                  )}
                </div>
                <div>
                  <Link
                    href="/deals"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400/90 hover:text-emerald-300 underline-offset-2 hover:underline whitespace-nowrap"
                  >
                    Open Under-EV Watch →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {view === "calculator" && (
            <div className="flex flex-wrap gap-2 mb-5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                    activeCategory === cat.id
                      ? "bg-green-500/15 border-green-400/60 text-green-300 portal-glow"
                      : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-green-500/40 hover:text-green-300"
                  }`}
                >
                  <span className="mr-1">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 mb-4 lg:hidden overflow-x-auto">
            <button
              onClick={() => setView("calculator")}
              className={`flex-1 min-w-[3.5rem] py-2 rounded-xl text-sm font-medium border ${
                view === "calculator"
                  ? "bg-green-500/15 border-green-400/60 text-green-300"
                  : "border-zinc-800 text-zinc-400"
              }`}
            >
              ⚡ EV
            </button>
            <Link
              href="/waitlist"
              className="flex-1 min-w-[3.5rem] py-2 rounded-xl text-sm font-medium border border-zinc-800 text-zinc-400 text-center hover:border-amber-500/40 hover:text-amber-300"
              title="Alerts + custom fees — soon"
            >
              👑 Soon
            </Link>
            <button
              onClick={() => setView("cards")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border ${
                view === "cards"
                  ? "bg-cyan-500/15 border-cyan-400/60 text-cyan-300"
                  : "border-zinc-800 text-zinc-400"
              }`}
            >
              🃏 Cards
            </button>
            <Link
              href="/open"
              className="flex-1 py-2 rounded-xl text-sm font-medium border border-zinc-800 text-zinc-400 text-center hover:border-cyan-500/40 hover:text-cyan-300"
            >
              🎁 Open
            </Link>
            <Link
              href="/log"
              className="flex-1 py-2 rounded-xl text-sm font-medium border border-zinc-800 text-zinc-400 text-center hover:border-cyan-500/40 hover:text-cyan-300"
            >
              📝 Log
            </Link>
            <Link
              href="/deals"
              className="flex-1 py-2 rounded-xl text-sm font-medium border border-zinc-800 text-zinc-400 text-center hover:border-emerald-500/40 hover:text-emerald-300"
            >
              💎 Under-EV
            </Link>
          </div>

          {view === "cards" ? (
            <div className="space-y-5 max-w-4xl">
              <div className="panel rounded-2xl p-5 border border-cyan-500/30">
                <div className="text-[10px] uppercase tracking-widest text-cyan-400/80 mb-1">
                  Card Lookup
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Card Values
                </h2>
                <p className="text-sm text-zinc-400 mb-4">
                  Search chase cards for raw ranges and PSA estimates.
                </p>
                <input
                  type="search"
                  value={cardQuery}
                  onChange={(e) => {
                    setCardQuery(e.target.value);
                    setSelectedCard(null);
                  }}
                  placeholder="Search: Gengar, Pikachu, Kurtz, Ascended..."
                  className="w-full bg-black/60 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400/60"
                />
              </div>

              {selectedCard && (
                <div className="panel rounded-2xl p-5 border border-cyan-500/40 portal-glow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-20 rounded-xl bg-gradient-to-br from-cyan-700 to-purple-600 flex items-center justify-center text-3xl shrink-0 border border-white/10">
                      {selectedCard.emoji || "🃏"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-white">
                        {selectedCard.name}
                      </h3>
                      <div className="text-sm text-zinc-400">
                        {selectedCard.set}
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {selectedCard.number && (
                          <span className="mr-2">#{selectedCard.number}</span>
                        )}
                        {selectedCard.rarity}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-3 text-center">
                      <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                        Raw mid
                      </div>
                      <div className="text-xl font-mono font-bold text-green-400">
                        ${selectedCard.rawMid.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1">
                        ${selectedCard.rawLow}–${selectedCard.rawHigh}
                      </div>
                    </div>
                    <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-3 text-center">
                      <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                        PSA 9
                      </div>
                      <div className="text-xl font-mono font-bold text-cyan-300">
                        {selectedCard.psa9
                          ? `$${selectedCard.psa9.toLocaleString()}`
                          : "—"}
                      </div>
                    </div>
                    <div className="rounded-xl bg-zinc-900/80 border border-amber-500/30 p-3 text-center">
                      <div className="text-[10px] uppercase tracking-wider text-amber-400/80 mb-1">
                        PSA 10
                      </div>
                      <div className="text-xl font-mono font-bold text-amber-300">
                        {selectedCard.psa10
                          ? `$${selectedCard.psa10.toLocaleString()}`
                          : "—"}
                      </div>
                    </div>
                  </div>
                  {selectedCard.notes && (
                    <p className="text-xs text-zinc-500 border-t border-zinc-800 pt-3">
                      {selectedCard.notes}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                  {cardQuery
                    ? `${filteredCards.length} results`
                    : `${chaseCards.length} chase cards`}
                </div>
                {filteredCards.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCard(c)}
                    className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition ${
                      selectedCard?.id === c.id
                        ? "border-cyan-400/60 bg-cyan-500/10"
                        : "border-zinc-800 bg-zinc-900/50 hover:border-cyan-500/30"
                    }`}
                  >
                    <span className="text-xl w-8 text-center">
                      {c.emoji || "🃏"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-zinc-100 truncate">
                        {c.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate">
                        {c.set} {c.number ? `· #${c.number}` : ""}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-mono text-green-400">
                        ${c.rawMid.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        PSA10 {c.psa10 ? `$${c.psa10.toLocaleString()}` : "—"}
                      </div>
                    </div>
                  </button>
                ))}
                {filteredCards.length === 0 && (
                  <div className="text-center text-zinc-500 py-10 text-sm">
                    No cards match. Try Gengar, Pikachu, or Kurtz.
                  </div>
                )}
              </div>
            </div>
          ) : view === "insider" ? (
            <div className="max-w-xl">
              <Link
                href="/waitlist"
                className="panel rounded-2xl p-5 border border-amber-500/30 flex items-start gap-3 hover:border-amber-400/50 transition"
              >
                <span className="text-2xl" aria-hidden>
                  👑
                </span>
                <div>
                  <div className="text-sm font-semibold text-amber-100">
                    VIP
                  </div>
                  <p className="text-sm text-zinc-400 mt-0.5">
                    Alerts + custom fees — soon. Join the waitlist →
                  </p>
                </div>
              </Link>
            </div>
          ) : effectiveProduct ? (
            <div className="flex flex-col gap-5">
              <div>
                <div className="sticky top-0 z-10 -mx-1 px-1 py-2 mb-1 bg-black/80 backdrop-blur-sm border-b border-zinc-900/80 lg:static lg:bg-transparent lg:backdrop-blur-none lg:border-0 lg:py-0 lg:mb-2">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h2 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                      Select Pack / Box
                    </h2>
                    <span className="text-[10px] text-zinc-600 lg:hidden">
                      swipe →
                    </span>
                  </div>
                  <input
                    type="search"
                    value={packQuery}
                    onChange={(e) => setPackQuery(e.target.value)}
                    placeholder="Search set or format…"
                    className="w-full bg-black/70 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-green-400"
                    aria-label="Search packs"
                  />
                  {categoryProducts.length === 0 ? (
                    <div className="text-sm text-zinc-500 py-4 text-center">
                      No packs match “{packQuery}”.
                    </div>
                  ) : null}
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory lg:grid lg:grid-cols-3 xl:grid-cols-4 lg:overflow-visible">
                  {categoryProducts.map((p) => {
                    const isTrending =
                      p.id.includes("ascended") ||
                      p.id.includes("chrome-update");
                    const isActive = effectiveProduct.id === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSelectProduct(p.id)}
                        className={`snap-start flex-shrink-0 w-[152px] sm:w-[160px] lg:w-auto text-left rounded-xl border overflow-hidden transition-all card-hover touch-manipulation ${
                          isActive
                            ? "border-green-400/70 portal-glow ring-1 ring-green-400/30"
                            : "border-zinc-800/80 hover:border-green-500/30"
                        }`}
                      >
                        <div
                          className={`h-28 lg:h-24 bg-gradient-to-br ${
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
                            <span className="text-3xl drop-shadow-lg">
                              {p.emoji || "📦"}
                            </span>
                          )}
                          {(p.tag === "value" ||
                            p.tag === "hot" ||
                            isTrending) && (
                            <span
                              className={`absolute top-1.5 right-1.5 text-[8px] px-1.5 py-0.5 rounded font-medium border ${
                                p.tag === "value"
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                  : "bg-black/50 text-green-300 border-green-500/40"
                              }`}
                            >
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
                            Catalog ${p.defaultPrice.toFixed(2)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                ref={resultsRef}
                className="grid lg:grid-cols-12 gap-5 scroll-mt-20"
              >
                <div className="lg:col-span-8 space-y-4">
                  <DealAlertsBanner variant="compact" />
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
                        <p className="text-[11px] text-zinc-500 mt-1">
                          Updated {pricesUpdatedLabel} · Catalog $
                          {effectiveProduct.defaultPrice.toFixed(2)}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              const url = `${window.location.origin}/pack/${effectiveProduct.id}`;
                              navigator.clipboard?.writeText(url).catch(() => {});
                              syncPackToUrl(effectiveProduct.id);
                            }}
                            className="text-[11px] text-emerald-400/90 hover:text-emerald-300 underline-offset-2 hover:underline"
                          >
                            Copy share link
                          </button>
                          <button
                            type="button"
                            disabled={!result || shareImageBusy}
                            onClick={() => void handleShareProductImage()}
                            className="text-[11px] text-pink-300/90 hover:text-pink-200 underline-offset-2 hover:underline disabled:opacity-40 disabled:no-underline"
                          >
                            {shareImageBusy ? "Building…" : "Share image (9:16)"}
                          </button>
                          <Link
                            href={`/open?pack=${effectiveProduct.id}`}
                            className="text-[11px] text-cyan-400/90 hover:text-cyan-300 underline-offset-2 hover:underline"
                          >
                            Simulate open
                          </Link>
                          <Link
                            href={logPrefillHref}
                            className="text-[11px] text-cyan-400/90 hover:text-cyan-300 underline-offset-2 hover:underline"
                          >
                            Log this rip
                          </Link>
                        </div>
                        {shareImageNote && (
                          <p className="mt-1 text-[10px] text-pink-200/80">{shareImageNote}</p>
                        )}
                        <div className="mt-3">
                          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">
                            Buy
                          </div>
                          <BuyLinks query={effectiveProduct.name} />
                          <AffiliateDisclosure className="mt-1" />
                        </div>
                        <div className="flex flex-wrap items-end gap-3 mt-3">
                          <div>
                            <label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wider">
                              Your price ($)
                            </label>
                            <div className="text-[9px] text-zinc-600 mb-1">
                              ROI source · Catalog $
                              {effectiveProduct.defaultPrice.toFixed(2)}
                            </div>
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
                                onClick={() =>
                                  setQuantity(Math.max(1, quantity - 1))
                                }
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
                                totalProfit >= 0
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {totalProfit >= 0 ? "+" : ""}$
                              {totalProfit.toFixed(2)}
                            </div>
                            <div
                              className={`text-sm font-mono ${
                                roi >= 0
                                  ? "text-green-400/80"
                                  : "text-red-400/80"
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
                            <span className="text-[9px] text-zinc-500 mt-4">
                              ROI
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 text-sm">
                          {totalProfit >= 0 ? (
                            <span className="text-green-300">
                              ▲ Positive EV — math favors opening on average
                            </span>
                          ) : (
                            <span className="text-red-300/90">
                              ▼ Negative EV — paying a premium for the chase /
                              fun
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={shareImageBusy}
                            onClick={() => void handleShareProductImage()}
                            className="inline-flex items-center justify-center rounded-lg border border-pink-500/40 bg-pink-500/10 px-3 py-2 text-[12px] font-medium text-pink-200 hover:bg-pink-500/20 disabled:opacity-40"
                          >
                            {shareImageBusy
                              ? "Building share card…"
                              : "📤 Share EV image (9:16)"}
                          </button>
                          <Link
                            href={logPrefillHref}
                            className="inline-flex items-center justify-center rounded-lg border border-cyan-500/35 bg-cyan-500/10 px-3 py-2 text-[12px] font-medium text-cyan-300 hover:bg-cyan-500/20"
                          >
                            📝 Log this rip
                          </Link>
                        </div>
                      </div>
                    )}


                    {verdict && (
                      <div
                        ref={verdictRef}
                        className={`rounded-xl p-4 mb-4 border transition-shadow duration-500 ${
                          verdictHighlight
                            ? "border-emerald-400/70 portal-glow bg-emerald-500/5"
                            : "border-green-500/25 bg-black/40"
                        }`}
                      >

                        <div className="mb-3 flex flex-wrap items-center gap-1.5" aria-label="Portal Verdict stamp">
                          {([
                            { key: "rip" as const, label: "RIP" },
                            { key: "singles" as const, label: "BUY SINGLES" },
                            { key: "hold" as const, label: "HOLD SEALED" },
                          ]).map((opt) => {
                            const on = verdict.primary === opt.key;
                            const color =
                              opt.key === "rip"
                                ? on
                                  ? "bg-green-500/25 text-green-200 border-green-400/50"
                                  : "bg-zinc-900/60 text-zinc-500 border-zinc-700/80"
                                : opt.key === "singles"
                                  ? on
                                    ? "bg-cyan-500/25 text-cyan-200 border-cyan-400/50"
                                    : "bg-zinc-900/60 text-zinc-500 border-zinc-700/80"
                                  : on
                                    ? "bg-amber-500/25 text-amber-200 border-amber-400/50"
                                    : "bg-zinc-900/60 text-zinc-500 border-zinc-700/80";
                            return (
                              <span
                                key={opt.key}
                                className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded-md border ${color}`}
                              >
                                {opt.label}
                              </span>
                            );
                          })}
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                            Portal Verdict
                          </h3>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              verdict.primary === "rip"
                                ? "bg-green-500/15 text-green-300 border-green-400/40"
                                : verdict.primary === "singles"
                                  ? "bg-cyan-500/15 text-cyan-300 border-cyan-400/40"
                                  : "bg-amber-500/15 text-amber-300 border-amber-400/40"
                            }`}
                          >
                            Primary:{" "}
                            {verdict.primary === "rip"
                              ? "Rip"
                              : verdict.primary === "singles"
                                ? "Buy singles"
                                : "Hold sealed"}
                          </span>
                        </div>

                        <p className="text-sm text-zinc-200 leading-relaxed mb-3">
                          {verdict.rationale}
                        </p>
                        {(() => {
                          const k = computeKeeperEV(verdict.totalEV, price, 13);
                          return (
                            <p className="text-[11px] text-zinc-500 mb-3 font-mono">
                              Keeper lens (eBay ~13% est.): net EV $
                              {k.netEV.toFixed(2)} · net ROI{" "}
                              {k.netRoi >= 0 ? "+" : ""}
                              {k.netRoi.toFixed(1)}% — fees vary; see Keeper EV
                              below.
                            </p>
                          );
                        })()}

                        <div className="grid sm:grid-cols-3 gap-2">
                          {verdict.options.map((opt) => {
                            const isPrimary = opt.kind === verdict.primary;
                            const accent =
                              opt.kind === "rip"
                                ? isPrimary
                                  ? "border-green-400/50 bg-green-500/10"
                                  : "border-zinc-700/80 bg-zinc-900/50"
                                : opt.kind === "singles"
                                  ? isPrimary
                                    ? "border-cyan-400/50 bg-cyan-500/10"
                                    : "border-zinc-700/80 bg-zinc-900/50"
                                  : isPrimary
                                    ? "border-amber-400/50 bg-amber-500/10"
                                    : "border-zinc-700/80 bg-zinc-900/50";
                            return (
                              <div
                                key={opt.kind}
                                className={`rounded-lg border p-3 ${accent} ${
                                  isPrimary ? "ring-1 ring-white/10" : "opacity-90"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="text-xs font-semibold text-zinc-100">
                                    {opt.label}
                                  </span>
                                  {isPrimary && (
                                    <span className="text-[9px] text-zinc-400 uppercase tracking-wider">
                                      pick
                                    </span>
                                  )}
                                </div>
                                <div className="font-mono text-[11px] text-zinc-200 leading-snug">
                                  {opt.metric}
                                </div>
                                <div className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed">
                                  {opt.detail}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <p className="mt-3 text-[10px] text-zinc-500 leading-relaxed border-t border-zinc-800/60 pt-2.5">
                          {VERDICT_DISCLAIMER}
                        </p>
                        <Link
                          href={logPrefillHref}
                          className="mt-3 inline-flex items-center justify-center w-full sm:w-auto rounded-lg border border-cyan-500/35 bg-cyan-500/10 px-3 py-2 text-[12px] font-medium text-cyan-300 hover:bg-cyan-500/20"
                        >
                          📝 Log this rip — compare pulls to EV
                        </Link>
                        <div className="mt-3 pt-3 border-t border-zinc-800/60">
                          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">
                            Buy near this pick
                          </div>
                          <BuyLinks query={effectiveProduct.name} />
                        </div>
                      </div>
                    )}


                    {result && (
                      <div className="mb-4">
                        <KeeperEvPanel
                          grossEV={result.totalEV}
                          price={price}
                          quantity={quantity}
                        />
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
                        {
                          label: "Catalog avg ROI",
                          value: `${marketPulse.avgRoi >= 0 ? "+" : ""}${marketPulse.avgRoi.toFixed(1)}%`,
                          color:
                            marketPulse.avgRoi >= 0
                              ? "text-green-400"
                              : "text-red-400/80",
                        },
                        {
                          label: "Priciest SKU",
                          value: marketPulse.hotSet,
                          color: "text-purple-300",
                        },
                        {
                          label: "Best ROI",
                          value: marketPulse.bestRoiLabel,
                          color: "text-cyan-400",
                        },
                      ].map((row) => (
                        <div
                          key={row.label}
                          className="flex items-center justify-between text-sm gap-3"
                        >
                          <span className="text-zinc-400 shrink-0">{row.label}</span>
                          <span className={`font-medium text-right truncate ${row.color}`}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                      <p className="text-[10px] text-zinc-600 pt-1">
                        From live catalog math · prices sheet {pricesUpdated}
                      </p>
                    </div>
                  </div>

                  <div className="panel rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                        Catalog Rips
                      </h3>
                      <span className="text-[9px] text-zinc-600">From EV model</span>
                    </div>
                    <div className="space-y-2.5">
                      {recentRips.map((r, i) => (
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
                                r.roi >= 0
                                  ? "text-green-400"
                                  : "text-red-400/80"
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
                        $
                        {(topSlot.oddsNum * topSlot.avgValue).toFixed(2)}
                      </div>
                    </div>
                  )}
                  <div className="mb-2 rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-zinc-300">
                    <p className="font-medium text-amber-300">
                      EV is an estimate — not a guarantee
                    </p>
                    <p className="mt-1 leading-relaxed text-zinc-400">
                      Pull rates, card prices, and sealed markets move daily. Expected
                      value is a model, not a promise you&apos;ll profit. Variance is
                      huge on SIRs and hits — most opens still lose money at secondary
                      prices. Always verify live listings before you buy or rip.
                    </p>
                    <p className="mt-2 text-[11px] text-zinc-500">
                      {`Catalog defaults updated: ${pricesUpdated} · Community pack tips welcome`}
                    </p>
                  </div>
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


export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen portal-bg flex items-center justify-center text-zinc-500 text-sm">
          Loading calculator…
        </div>
      }
    >
      <HomeInner />
    </Suspense>
  );
}
