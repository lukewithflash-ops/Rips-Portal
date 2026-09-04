"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  categories,
  products,
  type Category,
  type Product,
} from "@/lib/products";
import {
  RIP_LOG_DISCLAIMER,
  buildSession,
  computeRipLogStats,
  decodeSession,
  encodeSession,
  findProduct,
  fmtMoney,
  fmtPct,
  loadLocalSessions,
  saveSessionLocal,
  sessionSharePath,
  type RipLogSessionV1,
} from "@/lib/riplog";
import { computeKeeperEV } from "@/lib/keeper";

function emptyCounts(product: Product | null): number[] {
  return product ? product.slots.map(() => 0) : [];
}

function LogInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const packFromUrl = searchParams.get("pack");
  const sessionFromUrl = searchParams.get("s");
  const qtyFromUrl = searchParams.get("qty");

  const [category, setCategory] = useState<Category>("pokemon");
  const [productId, setProductId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [priceStr, setPriceStr] = useState("");
  const [counts, setCounts] = useState<number[]>([]);
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [localSessions, setLocalSessions] = useState<
    { e: string; label: string; at: number }[]
  >([]);
  const [hydratedFromShare, setHydratedFromShare] = useState(false);

  const product: Product | null = useMemo(() => {
    if (productId) return findProduct(productId) ?? null;
    return products.find((p) => p.category === category) ?? null;
  }, [productId, category]);

  const price =
    priceStr !== ""
      ? parseFloat(priceStr) || 0
      : product?.defaultPrice ?? 0;

  // Hydrate from share payload or ?pack=
  useEffect(() => {
    if (sessionFromUrl) {
      const decoded = decodeSession(sessionFromUrl);
      if (decoded) {
        const p = findProduct(decoded.p);
        if (p) {
          setCategory(p.category);
          setProductId(p.id);
          setQuantity(decoded.q);
          setPriceStr(String(decoded.pr));
          setCounts(
            p.slots.map((_, i) => Math.max(0, Math.floor(decoded.c[i] ?? 0)))
          );
          setNote(decoded.n ?? "");
          setHydratedFromShare(true);
          return;
        }
      }
    }
    if (packFromUrl) {
      const p = findProduct(packFromUrl);
      if (p) {
        setCategory(p.category);
        setProductId(p.id);
        setPriceStr("");
        setCounts(emptyCounts(p));
        const q = qtyFromUrl ? parseInt(qtyFromUrl, 10) : NaN;
        if (Number.isFinite(q) && q >= 1) setQuantity(Math.min(9999, q));
      }
    }
  }, [sessionFromUrl, packFromUrl, qtyFromUrl]);

  useEffect(() => {
    setLocalSessions(loadLocalSessions());
  }, []);

  // Keep counts aligned when product changes (manual pick)
  const selectProduct = useCallback((p: Product) => {
    setCategory(p.category);
    setProductId(p.id);
    setPriceStr("");
    setCounts(emptyCounts(p));
    setHydratedFromShare(false);
    const params = new URLSearchParams();
    params.set("pack", p.id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router]);

  useEffect(() => {
    if (!product) return;
    if (counts.length !== product.slots.length) {
      setCounts(emptyCounts(product));
    }
  }, [product, counts.length]);

  const session: RipLogSessionV1 | null = useMemo(() => {
    if (!product) return null;
    return buildSession(product, quantity, price, counts, note);
  }, [product, quantity, price, counts, note]);

  const stats = useMemo(
    () => (session ? computeRipLogStats(session) : null),
    [session]
  );

  const categoryProducts = useMemo(
    () => products.filter((p) => p.category === category),
    [category]
  );

  const bumpCount = (index: number, delta: number) => {
    setCounts((prev) => {
      const next = [...prev];
      next[index] = Math.max(0, Math.min(99999, (next[index] ?? 0) + delta));
      return next;
    });
    setHydratedFromShare(false);
  };

  const setCountAt = (index: number, value: string) => {
    const n = parseInt(value, 10);
    setCounts((prev) => {
      const next = [...prev];
      next[index] = Number.isFinite(n)
        ? Math.max(0, Math.min(99999, n))
        : 0;
      return next;
    });
    setHydratedFromShare(false);
  };

  const handleShare = async () => {
    if (!session || !stats) return;
    const encoded = encodeSession(session);
    const path = sessionSharePath(encoded);
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard?.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
    saveSessionLocal(
      encoded,
      `${stats.product.name} ×${stats.quantity}`
    );
    setLocalSessions(loadLocalSessions());
    router.replace(path, { scroll: false });
  };

  const loadEncoded = (encoded: string) => {
    router.replace(sessionSharePath(encoded), { scroll: false });
  };

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
              <div className="font-bold text-green-400 neon-text text-sm leading-tight">
                Rip Log
              </div>
              <div className="text-[10px] text-zinc-500 tracking-wider truncate">
                SESSION VS EXPECTED EV
              </div>
            </div>
          </div>
          <Link
            href={product ? `/?pack=${product.id}` : "/"}
            className="text-[11px] text-emerald-400/90 hover:text-emerald-300 underline-offset-2 hover:underline shrink-0"
          >
            ← Calculator
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 md:px-6 py-5 max-w-3xl mx-auto w-full space-y-4 pb-24">
        {hydratedFromShare && stats && (
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-[12px] text-cyan-200">
            Viewing a shared rip session — edit anything to make it yours, then
            share again.
          </div>
        )}

        {/* Product picker */}
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
                    ? "bg-green-500/15 border-green-400/50 text-green-300"
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
                      ? "border-green-400/60 bg-green-500/10"
                      : "border-zinc-800 bg-black/40"
                  }`}
                >
                  <div
                    className={`w-10 h-14 rounded-lg bg-gradient-to-br ${
                      p.accent || "from-zinc-700 to-zinc-800"
                    } flex items-center justify-center text-lg shrink-0 overflow-hidden border border-white/10`}
                  >
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image}
                        alt=""
                        className="h-full w-full object-contain p-0.5"
                      />
                    ) : (
                      p.emoji || "📦"
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-zinc-100 truncate">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate">
                      {p.format}
                    </div>
                    <div className="text-[11px] font-mono text-green-400/80">
                      ~${p.defaultPrice.toFixed(2)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Qty + price */}
        <section className="panel rounded-2xl p-4 space-y-3">
          <h2 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
            2 · Session size
          </h2>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wider">
                Qty ripped
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setQuantity((q) => Math.max(1, q - 1));
                    setHydratedFromShare(false);
                  }}
                  className="w-11 h-11 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-lg"
                >
                  −
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={9999}
                  value={quantity}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    setQuantity(
                      Number.isFinite(n) ? Math.max(1, Math.min(9999, n)) : 1
                    );
                    setHydratedFromShare(false);
                  }}
                  className="w-16 bg-black/70 border border-zinc-700 rounded-lg px-2 py-2.5 text-center text-green-300 font-mono text-sm focus:outline-none focus:border-green-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    setQuantity((q) => Math.min(9999, q + 1));
                    setHydratedFromShare(false);
                  }}
                  className="w-11 h-11 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-lg"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wider">
                Price / unit ($)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={priceStr !== "" ? priceStr : price}
                onChange={(e) => {
                  setPriceStr(e.target.value);
                  setHydratedFromShare(false);
                }}
                className="w-32 bg-black/70 border border-zinc-700 rounded-lg px-3 py-2.5 text-right text-green-300 font-mono text-sm focus:outline-none focus:border-green-400 h-11"
              />
            </div>
          </div>
        </section>

        {/* Hits */}
        <section className="panel rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
              3 · Hits (tier totals)
            </h2>
            <button
              type="button"
              onClick={() => {
                setCounts(emptyCounts(product));
                setHydratedFromShare(false);
              }}
              className="text-[11px] text-zinc-500 hover:text-zinc-300"
            >
              Reset
            </button>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Tap +/− for how many of each catalog tier you pulled. Value uses the
            same slot averages as the EV calculator — dead simple on mobile.
          </p>
          <div className="space-y-2">
            {product?.slots.map((slot, i) => (
              <div
                key={`${product.id}-${i}`}
                className="flex items-center gap-2 border-b border-zinc-800/50 pb-2 last:border-0 last:pb-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-zinc-200 truncate">
                    {slot.name}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono">
                    ~${slot.avgValue.toFixed(2)} avg · odds {slot.odds}
                    {stats && (
                      <span className="text-zinc-600">
                        {" "}
                        · exp ~{stats.slotRows[i]?.expectedCount.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => bumpCount(i, -1)}
                    className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-lg"
                    aria-label={`Decrease ${slot.name}`}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={counts[i] ?? 0}
                    onChange={(e) => setCountAt(i, e.target.value)}
                    className="w-12 bg-black/70 border border-zinc-700 rounded-lg px-1 py-2 text-center text-green-300 font-mono text-sm focus:outline-none focus:border-green-400"
                  />
                  <button
                    type="button"
                    onClick={() => bumpCount(i, 1)}
                    className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-lg"
                    aria-label={`Increase ${slot.name}`}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wider">
              Note (optional)
            </label>
            <input
              type="text"
              maxLength={120}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setHydratedFromShare(false);
              }}
              placeholder="e.g. LGS rip night"
              className="w-full bg-black/70 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-green-400"
            />
          </div>
        </section>

        {/* Results */}
        {stats && (
          <section
            className={`rounded-2xl p-4 border ${
              stats.vsExpected >= 0
                ? "bg-green-500/10 border-green-400/40 portal-glow"
                : "bg-red-500/10 border-red-400/30"
            }`}
          >
            <h2 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">
              4 · Results vs EV
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                  Cost paid
                </div>
                <div className="text-xl font-mono font-bold text-white">
                  {fmtMoney(stats.costPaid)}
                </div>
                <div className="text-[10px] text-zinc-500">
                  {stats.quantity} × {fmtMoney(stats.pricePerUnit)}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                  Expected EV
                </div>
                <div className="text-xl font-mono font-bold text-zinc-200">
                  {fmtMoney(stats.expectedEV)}
                </div>
                <div className="text-[10px] text-zinc-500">
                  catalog model × qty
                </div>
                {(() => {
                  const per = stats.expectedEV / Math.max(1, stats.quantity);
                  const k = computeKeeperEV(per, stats.pricePerUnit, 13);
                  return (
                    <div className="text-[10px] text-cyan-500/80 mt-1 font-mono">
                      Keeper net ~{fmtMoney(k.netEV * stats.quantity)} @13% fee
                      est.
                    </div>
                  );
                })()}
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                  Actual logged
                </div>
                <div className="text-xl font-mono font-bold text-white">
                  {fmtMoney(stats.actualValue)}
                </div>
                <div
                  className={`text-[10px] font-mono ${
                    stats.profitVsCost >= 0
                      ? "text-green-400"
                      : "text-red-400/80"
                  }`}
                >
                  {fmtMoney(stats.profitVsCost)} vs cost ·{" "}
                  {fmtPct(stats.roiVsCost)} ROI
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                  vs Expected
                </div>
                <div
                  className={`text-xl font-mono font-bold ${
                    stats.vsExpected >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {stats.vsExpected >= 0 ? "+" : ""}
                  {fmtMoney(stats.vsExpected)}
                </div>
                <div
                  className={`text-[10px] font-mono ${
                    stats.vsExpected >= 0
                      ? "text-green-400/80"
                      : "text-red-400/80"
                  }`}
                >
                  {stats.vsExpectedPct != null
                    ? fmtPct(stats.vsExpectedPct)
                    : "—"}{" "}
                  vs model
                </div>
              </div>
            </div>
            <p className="text-[12px] text-zinc-300 leading-relaxed">
              {stats.vsExpected >= 0
                ? `You logged ${fmtMoney(stats.vsExpected)} above expected EV for this qty — lucky variance, not a new EV.`
                : `You logged ${fmtMoney(Math.abs(stats.vsExpected))} under expected EV — normal for −EV / chase opens.`}
            </p>
          </section>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={handleShare}
            disabled={!session}
            className="flex-1 rounded-xl bg-green-500/20 border border-green-400/50 text-green-300 font-semibold py-3.5 text-sm portal-glow hover:bg-green-500/30 disabled:opacity-40"
          >
            {copied ? "Link copied ✓" : "Share session link"}
          </button>
          {product && (
            <Link
              href={`/?pack=${product.id}`}
              className="sm:w-auto rounded-xl border border-zinc-700 bg-black/50 text-zinc-300 text-center py-3.5 px-4 text-sm hover:border-green-500/40"
            >
              Open in calculator
            </Link>
          )}
        </div>

        {localSessions.length > 0 && (
          <section className="panel rounded-2xl p-4 space-y-2">
            <h2 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
              Recent on this device
            </h2>
            <div className="space-y-1.5">
              {localSessions.map((row) => (
                <button
                  key={row.e}
                  type="button"
                  onClick={() => loadEncoded(row.e)}
                  className="w-full text-left rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 text-[12px] text-zinc-300 hover:border-green-500/40 flex justify-between gap-2"
                >
                  <span className="truncate">{row.label}</span>
                  <span className="text-zinc-600 shrink-0 text-[10px]">
                    {new Date(row.at).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-zinc-300">
          <p className="font-medium text-amber-300">Personal log — not advice</p>
          <p className="mt-1 leading-relaxed text-zinc-400 text-[12px]">
            {RIP_LOG_DISCLAIMER}
          </p>
        </div>
      </main>
    </div>
  );
}

export default function LogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen portal-bg flex items-center justify-center text-zinc-500 text-sm">
          Loading Rip Log…
        </div>
      }
    >
      <LogInner />
    </Suspense>
  );
}
