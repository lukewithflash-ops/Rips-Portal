"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  getArtStatus,
  isFeaturedOpenProduct,
} from "@/lib/cardPools";
import {
  OPEN_SIM_DISCLAIMER,
  OPEN_CARD_ART_DISCLAIMER,
  buildDropTable,
  simulateOpen,
  fmtMoney,
  fmtPct,
  type SimSession,
  type SimPull,
  type PackResult,
} from "@/lib/simulate";
import CardZoomModal, {
  type CardZoomTier,
} from "@/components/CardZoomModal";
import {
  downloadOpenShareImage,
  shareOrDownloadOpenImage,
} from "@/lib/openShareImage";
import BrandLogo from "@/components/BrandLogo";

type Phase = "idle" | "tearing" | "reveal";

type RarityTier = "common" | "uncommon" | "rare" | "chase";

/** Open v2 screens — pick product, stage the rip, then results (no bounce to Product). */
type OpenScreen = "pick" | "stage" | "results";

type SessionChip = {
  packs: number;
  spent: number;
  hits: number;
  vsEV: number;
};

/** Soft hit frame for IR / SIR / MHR (and sports parallel / auto equiv). */
function isSoftHitPull(pull: SimPull): boolean {
  const blob = `${pull.slotName} ${pull.cardName} ${pull.name}`.toLowerCase();
  return /\b(ir|sir|mhr|illustration rare|special illustration|mega hyper|hyper rare|manga|sec\b|parallel|refractor|auto)\b/.test(
    blob
  );
}

function countHits(session: SimSession): number {
  let n = 0;
  for (const pack of session.packs) {
    for (const pull of pack.pulls) {
      if (isSoftHitPull(pull) || rarityTier(pull, session.pricePerUnit) === "chase") {
        n += 1;
      }
    }
  }
  return n;
}

function playWhoosh(reduced: boolean) {
  if (reduced || typeof window === "undefined") return;
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(420, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.22);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.24);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.26);
    window.setTimeout(() => void ctx.close(), 400);
  } catch {
    /* ignore audio failures */
  }
}

function hapticPulse(pattern: number | number[], reduced: boolean) {
  if (reduced || typeof navigator === "undefined" || !navigator.vibrate) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}

/** Set-art thumb or generic pack silhouette — never a huge emoji crowding the title. */
function ProductRowIcon({ product }: { product: Product }) {
  if (product.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={product.image}
        alt=""
        width={40}
        height={56}
        className="h-14 w-10 shrink-0 rounded-md object-cover border border-zinc-700/80 bg-black/40"
        loading="lazy"
        decoding="async"
      />
    );
  }
  return (
    <span
      className="pack-silhouette h-14 w-10 shrink-0 rounded-md border border-zinc-700/70 bg-gradient-to-b from-zinc-800/80 to-zinc-950/90"
      aria-hidden
    />
  );
}


function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/** Rarity-weighted intensity from EV model inputs (does not change odds math). */
function pullValue(pull: SimPull): number {
  return pull.estValue ?? pull.avgValue;
}

function rarityTier(pull: SimPull, unitPrice: number): RarityTier {
  const value = pullValue(pull);
  const valueScore = unitPrice > 0 ? value / unitPrice : value / 50;
  const rarityScore =
    pull.oddsNum > 0 ? Math.min(4, 0.08 / pull.oddsNum) : 0;
  const score = valueScore * 0.65 + rarityScore * 0.35;
  if (score >= 1.15 || value >= unitPrice * 1.5) return "chase";
  if (score >= 0.55 || value >= unitPrice * 0.6) return "rare";
  if (score >= 0.22 || value >= 15) return "uncommon";
  return "common";
}

function packRarity(pack: PackResult, unitPrice: number): RarityTier {
  if (!pack.highlight) return "common";
  return rarityTier(pack.highlight, unitPrice);
}

function useCountUp(
  target: number,
  active: boolean,
  durationMs: number,
  reduced: boolean
): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    if (reduced || durationMs <= 0) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, durationMs, reduced]);
  return value;
}

const CONFETTI_COLORS = [
  "#22d3ee",
  "#39ff14",
  "#facc15",
  "#bf00ff",
  "#f472b6",
  "#ffffff",
];

function ConfettiBurst({ show }: { show: boolean }) {
  const bits = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 14 + (i % 3) * 0.2;
      const dist = 48 + (i % 5) * 14;
      return {
        id: i,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length]!,
        cx: `${Math.cos(angle) * dist}px`,
        cy: `${Math.sin(angle) * dist - 20}px`,
        cr: `${(i * 47) % 360}deg`,
        delay: `${(i % 6) * 28}ms`,
        w: 4 + (i % 3) * 2,
        h: 4 + ((i + 1) % 3) * 2,
      };
    });
  }, []);

  if (!show) return null;
  return (
    <div className="confetti-burst" aria-hidden>
      {bits.map((b) => (
        <span
          key={b.id}
          style={{
            background: b.color,
            width: b.w,
            height: b.h,
            ["--cx" as string]: b.cx,
            ["--cy" as string]: b.cy,
            ["--cr" as string]: b.cr,
            animationDelay: b.delay,
          }}
        />
      ))}
    </div>
  );
}

function OpenInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const packFromUrl = searchParams.get("pack");
  const reducedMotion = usePrefersReducedMotion();

  const [category, setCategory] = useState<Category>("pokemon");
  const [productId, setProductId] = useState<string | null>(null);
  const [qtyMode, setQtyMode] = useState<"1" | "5" | "10" | "custom">("1");
  const [customQty, setCustomQty] = useState(3);
  const [priceStr, setPriceStr] = useState("");
  const [session, setSession] = useState<SimSession | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [revealIdx, setRevealIdx] = useState(0);
  const [reelLabel, setReelLabel] = useState("?");
  const [showConfetti, setShowConfetti] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const [showSaveFallback, setShowSaveFallback] = useState(false);
  const [imageShareBusy, setImageShareBusy] = useState(false);
  const [summaryReady, setSummaryReady] = useState(false);
  const [zoomCard, setZoomCard] = useState<{
    pull: SimPull;
    tier: CardZoomTier;
  } | null>(null);
  const [screen, setScreen] = useState<OpenScreen>("pick");
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showOdds, setShowOdds] = useState(false);
  const [sessionChip, setSessionChip] = useState<SessionChip>({
    packs: 0,
    spent: 0,
    hits: 0,
    vsEV: 0,
  });
  const [sessionXp, setSessionXp] = useState(0);
  const timersRef = useRef<Array<{ id: number; kind: "t" | "i" }>>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(({ id, kind }) => {
      if (kind === "i") window.clearInterval(id);
      else window.clearTimeout(id);
    });
    timersRef.current = [];
  }, []);

  const trackTimeout = useCallback((id: number) => {
    timersRef.current.push({ id, kind: "t" });
    return id;
  }, []);

  const trackInterval = useCallback((id: number) => {
    timersRef.current.push({ id, kind: "i" });
    return id;
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

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
      setSummaryReady(false);
      setShowConfetti(false);
      setZoomCard(null);
      setScreen("stage");
    }
  }, [packFromUrl]);

  const selectProduct = useCallback(
    (p: Product) => {
      setCategory(p.category);
      setProductId(p.id);
      setPriceStr("");
      setSession(null);
      setPhase("idle");
      setSummaryReady(false);
      setShowConfetti(false);
      setZoomCard(null);
      setScreen("stage");
      setShowOdds(false);
      setSessionChip({ packs: 0, spent: 0, hits: 0, vsEV: 0 });
      setSessionXp(0);
      const params = new URLSearchParams();
      params.set("pack", p.id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router]
  );

  const categoryProducts = useMemo(() => {
    const list = products.filter((p) => p.category === category);
    return [...list].sort((a, b) => {
      const af = isFeaturedOpenProduct(a) ? 0 : 1;
      const bf = isFeaturedOpenProduct(b) ? 0 : 1;
      if (af !== bf) return af - bf;
      return 0;
    });
  }, [category]);

  /** Cap multi-open reveal total ~2–3s for 10 packs. */
  const revealStepMs = useCallback(
    (qty: number) => {
      if (reducedMotion) return 0;
      if (qty <= 1) return 0;
      if (qty <= 5) return Math.min(280, Math.floor(2200 / qty));
      return Math.min(220, Math.floor(2600 / qty));
    },
    [reducedMotion]
  );

  const tearDurationMs = reducedMotion ? 0 : 520;

  const runOpen = useCallback(() => {
    if (!product || phase === "tearing") return;
    clearTimers();
    const next = simulateOpen(product, quantity, price);
    setSession(next);
    setPhase("tearing");
    setRevealIdx(0);
    setSummaryReady(false);
    setShowConfetti(false);
    setZoomCard(null);
    setScreen("results");
    setSessionChip((prev) => ({
      packs: prev.packs + next.quantity,
      spent: prev.spent + next.costPaid,
      hits: prev.hits + countHits(next),
      vsEV: prev.vsEV + next.vsExpected,
    }));
    setSessionXp((x) => x + next.quantity);
    playWhoosh(reducedMotion);
    hapticPulse([18, 40, 28], reducedMotion);

    const labels = product.slots.map((s) => s.name);
    const hi = next.packs[0]?.highlight?.cardName ?? next.packs[0]?.highlight?.name ?? labels[0] ?? "Pull";

    const finishReveal = (sess: SimSession) => {
      setPhase("reveal");
      setRevealIdx(Math.max(0, sess.packs.length - 1));
      setSummaryReady(true);
      const hasChase = sess.packs.some(
        (pk) => packRarity(pk, price) === "chase"
      );
      setShowConfetti(hasChase);
      if (hasChase) hapticPulse([12, 30, 12, 30, 40], reducedMotion);
    };

    if (reducedMotion) {
      setReelLabel(hi);
      finishReveal(next);
      return;
    }

    // Brief reel flicker during tear
    let ticks = 0;
    const flicker = trackInterval(
      window.setInterval(() => {
        setReelLabel(labels[Math.floor(Math.random() * labels.length)] ?? "?");
        ticks += 1;
        if (ticks > 8) window.clearInterval(flicker);
      }, 55)
    );

    trackTimeout(
      window.setTimeout(() => {
        window.clearInterval(flicker);
        setReelLabel(hi);
        setPhase("reveal");

        // Chase confetti if any pack is a chase hit
        const hasChase = next.packs.some(
          (pk) => packRarity(pk, price) === "chase"
        );
        if (hasChase) {
          setShowConfetti(true);
          hapticPulse([12, 30, 12, 30, 40], reducedMotion);
          trackTimeout(
            window.setTimeout(() => setShowConfetti(false), 1100)
          );
        }

        if (next.packs.length <= 1) {
          setRevealIdx(0);
          setSummaryReady(true);
          return;
        }

        // Sequential reveal — rares linger a beat longer than bulk
        const base = revealStepMs(next.packs.length);
        let i = 0;
        const advance = () => {
          i += 1;
          if (i >= next.packs.length) {
            setRevealIdx(next.packs.length - 1);
            setSummaryReady(true);
            return;
          }
          setRevealIdx(i);
          const pk = next.packs[i];
          const tier = pk ? packRarity(pk, price) : "common";
          if (pk && tier === "chase") {
            setShowConfetti(true);
            hapticPulse(30, reducedMotion);
            trackTimeout(
              window.setTimeout(() => setShowConfetti(false), 900)
            );
          }
          const step =
            tier === "chase" ? Math.round(base * 1.85) :
            tier === "rare" ? Math.round(base * 1.35) :
            Math.max(90, Math.round(base * 0.75));
          trackTimeout(window.setTimeout(advance, step));
        };
        trackTimeout(window.setTimeout(advance, base));
      }, tearDurationMs)
    );
  }, [
    product,
    quantity,
    price,
    phase,
    reducedMotion,
    clearTimers,
    revealStepMs,
    tearDurationMs,
    trackTimeout,
    trackInterval,
  ]);

  const shareToInstagram = useCallback(async () => {
    if (!session || imageShareBusy) return;
    setImageShareBusy(true);
    setShareNote("Building story image…");
    setShowSaveFallback(false);
    try {
      const result = await shareOrDownloadOpenImage(session, "story");
      if (result === "shared") {
        setShareNote("Pick Instagram Stories in the share sheet");
      } else if (result === "downloaded") {
        setShowSaveFallback(true);
        setShareNote("Saved image — open IG → add to Story");
      } else if (result === "unsupported") {
        setShowSaveFallback(true);
        setShareNote("Share not available here — save the image instead");
      } else {
        // cancelled
        setShowSaveFallback(true);
        setShareNote(null);
      }
    } catch {
      setShowSaveFallback(true);
      setShareNote("Couldn’t share — try Save image");
    } finally {
      setImageShareBusy(false);
      window.setTimeout(() => setShareNote(null), 3200);
    }
  }, [session, imageShareBusy]);

  const saveStoryImage = useCallback(async () => {
    if (!session || imageShareBusy) return;
    setImageShareBusy(true);
    setShareNote("Saving…");
    try {
      await downloadOpenShareImage(session, "story");
      setShareNote("Saved — open IG and add to Story");
    } catch {
      setShareNote("Couldn’t save image — try again");
    } finally {
      setImageShareBusy(false);
      window.setTimeout(() => setShareNote(null), 2800);
    }
  }, [session, imageShareBusy]);

  const shownPacks =
    session && phase === "reveal"
      ? session.packs.slice(0, Math.max(1, revealIdx + 1))
      : [];

  const allRevealed =
    !!session &&
    phase === "reveal" &&
    (summaryReady || revealIdx >= session.packs.length - 1);

  useEffect(() => {
    setShareNote(null);
    const shareOk =
      typeof navigator !== "undefined" && typeof navigator.share === "function";
    // Fresh result: hide Save unless Web Share is missing entirely.
    setShowSaveFallback(allRevealed && !shareOk);
  }, [allRevealed, session?.product.id, session?.quantity, session?.totalSimValue]);

  const countedSim = useCountUp(
    session?.totalSimValue ?? 0,
    allRevealed && !!session,
    reducedMotion ? 0 : 700,
    reducedMotion
  );
  const countedEV = useCountUp(
    session?.expectedEV ?? 0,
    allRevealed && !!session,
    reducedMotion ? 0 : 700,
    reducedMotion
  );
  const countedVs = useCountUp(
    session?.vsExpected ?? 0,
    allRevealed && !!session,
    reducedMotion ? 0 : 750,
    reducedMotion
  );

  const packStageClass =
    phase === "idle"
      ? "pack-idle"
      : phase === "tearing"
        ? "pack-tear"
        : phase === "reveal"
          ? "pack-flip-reveal"
          : "";

  const artStatus = product ? getArtStatus(product) : "none";
  const onResults = screen === "results" && !!session;
  const onStage = screen === "stage" || onResults;
  const showPicker = screen === "pick";

  return (
    <div className="flex min-h-screen portal-bg flex-col">
      <header className="border-b border-purple-500/20 bg-black/40 backdrop-blur-md sticky top-0 z-40 site-chrome">
        <div className="px-4 md:px-6 py-3 flex items-center justify-between gap-3 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-2.5 min-w-0">
            <BrandLogo height={34} compact />
            <div className="min-w-0">
              <div className="font-bold text-cyan-300 neon-text text-sm leading-tight">
                Free Pack Opener
              </div>
              <div className="text-[10px] text-zinc-500 tracking-wider">
                SIM · Know before you rip
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowDisclaimer(true)}
              className="h-8 w-8 rounded-full border border-zinc-700 text-zinc-400 hover:text-cyan-300 hover:border-cyan-500/40 text-sm"
              aria-label="Simulation info"
              title="Info"
            >
              ⓘ
            </button>
            <Link
              href={product ? `/?pack=${product.id}` : "/"}
              className="text-[11px] text-green-400/90 hover:text-green-300 underline-offset-2 hover:underline"
            >
              ← Calc
            </Link>
          </div>
        </div>
        {/* Session chip — always visible once any opens this sitting */}
        {(sessionChip.packs > 0 || onStage) && (
          <div className="px-4 md:px-6 pb-2 max-w-3xl mx-auto w-full">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-purple-500/25 bg-purple-950/30 px-3 py-1.5 text-[11px] text-zinc-300">
              <span className="font-semibold text-purple-200/90">Session</span>
              <span>
                <span className="text-zinc-500">packs</span>{" "}
                <span className="font-mono text-cyan-200">{sessionChip.packs}</span>
              </span>
              <span>
                <span className="text-zinc-500">spent</span>{" "}
                <span className="font-mono">{fmtMoney(sessionChip.spent)}</span>
              </span>
              <span>
                <span className="text-zinc-500">hits</span>{" "}
                <span className="font-mono text-amber-200">{sessionChip.hits}</span>
              </span>
              <span>
                <span className="text-zinc-500">vs EV</span>{" "}
                <span
                  className={`font-mono ${
                    sessionChip.vsEV >= 0 ? "text-emerald-300" : "text-amber-300"
                  }`}
                >
                  {fmtMoney(sessionChip.vsEV)}
                </span>
              </span>
              {sessionXp > 0 && (
                <span className="ml-auto text-[10px] text-zinc-500" title="Sticker XP — not currency">
                  ✦ {sessionXp} rip XP
                </span>
              )}
            </div>
          </div>
        )}
      </header>

      <main
        className={`flex-1 px-4 md:px-6 py-4 max-w-3xl mx-auto w-full space-y-3 ${
          onResults ? "pb-36" : "pb-28"
        }`}
      >
        {showPicker && (
          <section className="panel rounded-2xl p-3.5 portal-border space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                Pick a set
              </h2>
              <p className="text-[10px] text-zinc-600 truncate">
                Featured = solid card art
              </p>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCategory(c.id);
                    setProductId(null);
                  }}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] border ${
                    category === c.id
                      ? "bg-cyan-500/15 border-cyan-400/50 text-cyan-300"
                      : "bg-black/40 border-zinc-700 text-zinc-400"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
              {categoryProducts.map((p) => {
                const active = product?.id === p.id;
                const featured = isFeaturedOpenProduct(p);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectProduct(p)}
                    className={`text-left rounded-xl border px-3 py-2.5 flex gap-3 items-start card-hover ${
                      active
                        ? "border-cyan-400/50 bg-cyan-500/10"
                        : "border-zinc-800 bg-black/30"
                    }`}
                  >
                    <ProductRowIcon product={p} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-zinc-100 font-medium leading-snug break-words whitespace-normal">
                        {p.name}
                        {featured && (
                          <span className="ml-1.5 align-middle text-[9px] uppercase tracking-wider text-fuchsia-300/90 border border-fuchsia-500/40 rounded px-1 py-0.5">
                            Art
                          </span>
                        )}
                      </span>
                      <span className="block text-[11px] text-zinc-500 leading-snug mt-0.5 break-words whitespace-normal">
                        {p.format} · {fmtMoney(p.defaultPrice)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {onStage && product && (
          <>
            {/* Compact product chrome — change set without bouncing to full "1 · Product" */}
            <div className="flex items-center gap-2.5 rounded-xl border border-zinc-800/90 bg-black/35 px-3 py-2">
              <ProductRowIcon product={product} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-zinc-100 leading-snug break-words">
                  {product.name}
                </div>
                <div className="text-[11px] text-zinc-500 leading-snug break-words">
                  {product.format} · {fmtMoney(price)}
                  {artStatus === "complete" ? " · full art" : " · rarity view"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setScreen("pick");
                  setPhase("idle");
                  setSession(null);
                  setSummaryReady(false);
                }}
                className="shrink-0 text-[11px] px-2.5 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200"
              >
                Change
              </button>
            </div>

            {!onResults && (
              <section className="panel rounded-2xl p-4 space-y-4 flex flex-col min-h-[52vh]">
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
                      {m === "custom"
                        ? "Custom"
                        : `${m} pack${m === "1" ? "" : "s"}`}
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
                          Math.max(
                            1,
                            Math.min(100, parseInt(e.target.value, 10) || 1)
                          )
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
                  className={`pack-stage relative mx-auto w-full flex-1 min-h-[220px] max-w-md rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-black to-emerald-950/30 flex items-center justify-center overflow-hidden ${packStageClass}`}
                >
                  <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.35),transparent_70%)]" />
                  {phase === "tearing" && (
                    <div className="pack-tear-flash" aria-hidden />
                  )}
                  <ConfettiBurst show={showConfetti && !reducedMotion} />
                  <div className="relative z-10 text-center px-4">
                    <div className="text-[10px] uppercase tracking-widest text-cyan-500/80 mb-1">
                      {phase === "tearing"
                        ? "Opening…"
                        : phase === "reveal"
                          ? "Reveal"
                          : "Ready"}
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-white leading-snug break-words max-w-[300px] mx-auto">
                      {phase === "idle" ? product.name : reelLabel}
                    </div>
                    {phase === "idle" && (
                      <div className="mt-1.5 text-[10px] text-zinc-500 tracking-wide">
                        Tap Open · free educational sim
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={runOpen}
                  disabled={phase === "tearing"}
                  className={`w-full py-3.5 rounded-xl text-sm font-semibold bg-cyan-500/20 border border-cyan-400/50 text-cyan-100 hover:bg-cyan-500/30 disabled:opacity-50 portal-glow transition-colors ${
                    phase === "idle" ? "open-cta-pulse" : ""
                  }`}
                >
                  {phase === "tearing"
                    ? "Opening…"
                    : `Open ${quantity} simulated pack${quantity === 1 ? "" : "s"}`}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowOdds((v) => !v)}
                    className="text-[11px] px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-cyan-200 hover:border-cyan-500/40"
                    aria-expanded={showOdds}
                  >
                    Odds {showOdds ? "▾" : "▸"}
                  </button>
                  <p className="text-[11px] text-zinc-600 flex-1 truncate">
                    Unit EV {fmtMoney(unitEV)} · not gambling
                  </p>
                </div>

                {showOdds && (
                  <div className="rounded-xl border border-zinc-800 bg-black/30 p-3 space-y-2">
                    <div className="overflow-x-auto -mx-1">
                      <table className="w-full text-left text-[12px] min-w-[320px]">
                        <thead>
                          <tr className="text-[10px] uppercase tracking-wider text-zinc-600 border-b border-zinc-800">
                            <th className="py-2 px-1 font-medium">Tier</th>
                            <th className="py-2 px-1 font-medium">Odds</th>
                            <th className="py-2 px-1 font-medium text-right">
                              Avg $
                            </th>
                            <th className="py-2 px-1 font-medium text-right">
                              EV $
                            </th>
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
                      Simulated odds = catalog oddsNum (same as calculator EV).
                      Not official published rates.
                    </p>
                  </div>
                )}
              </section>
            )}
          </>
        )}

        {session && onResults && (phase === "reveal" || phase === "tearing") && (
          <section className="panel rounded-2xl p-4 space-y-4 border border-emerald-500/25">
            <div
              className={`pack-stage relative mx-auto w-full max-w-sm h-24 rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/30 via-black to-emerald-950/20 flex items-center justify-center overflow-hidden ${packStageClass}`}
            >
              {phase === "tearing" && (
                <div className="pack-tear-flash" aria-hidden />
              )}
              <ConfettiBurst show={showConfetti && !reducedMotion} />
              <div className="relative z-10 text-center px-3">
                <div className="text-[10px] uppercase tracking-widest text-cyan-500/80">
                  {summaryReady ? "Pulled" : "Revealing…"}
                </div>
                <div className="text-base font-bold text-white leading-snug break-words">
                  {reelLabel}
                </div>
              </div>
            </div>

            {allRevealed && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 summary-punch">
                <div className="rounded-xl bg-black/40 border border-zinc-800 px-3 py-2.5">
                  <div className="text-[9px] uppercase tracking-wider text-zinc-600">
                    Sim value
                  </div>
                  <div className="text-sm font-mono text-white count-up-glow">
                    {fmtMoney(countedSim)}
                  </div>
                </div>
                <div className="rounded-xl bg-black/40 border border-zinc-800 px-3 py-2.5">
                  <div className="text-[9px] uppercase tracking-wider text-zinc-600">
                    Expected EV
                  </div>
                  <div className="text-sm font-mono text-zinc-200 count-up-glow">
                    {fmtMoney(countedEV)}
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
                    className={`text-sm font-mono count-up-glow ${
                      session.vsExpected >= 0
                        ? "text-emerald-300"
                        : "text-amber-300"
                    }`}
                  >
                    {fmtMoney(countedVs)} (
                    {fmtPct(
                      session.expectedEV > 0
                        ? (session.vsExpected / session.expectedEV) * 100
                        : 0
                    )}
                    )
                  </div>
                </div>
              </div>
            )}

            {allRevealed && (
              <p className="text-[12px] text-zinc-400 summary-punch">
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
            )}

            <ul className="space-y-2 max-h-[50vh] overflow-y-auto">
              {shownPacks.map((pack, listIdx) => {
                const tier = packRarity(pack, session.pricePerUnit);
                const isLatest = listIdx === shownPacks.length - 1;
                return (
                  <li
                    key={pack.packIndex}
                    className={`rounded-xl border px-3 py-2.5 hit-reveal rarity-${tier} ${
                      isLatest && tier === "chase" ? "hit-reveal-flip" : ""
                    }`}
                    style={
                      reducedMotion
                        ? undefined
                        : { animationDelay: `${Math.min(listIdx, 4) * 40}ms` }
                    }
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-semibold text-cyan-300/90">
                        Pack {pack.packIndex}
                        {tier === "chase" && (
                          <span className="ml-1.5 text-[9px] uppercase tracking-wider text-amber-300/90">
                            Chase
                          </span>
                        )}
                        {tier === "rare" && (
                          <span className="ml-1.5 text-[9px] uppercase tracking-wider text-cyan-400/80">
                            Hit
                          </span>
                        )}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-300">
                        {fmtMoney(pack.packValue)}
                      </span>
                    </div>
                    {pack.pulls.length > 0 && (
                      <div
                        className="pack-strip"
                        aria-label={`Pack ${pack.packIndex} cards`}
                      >
                        {pack.pulls.map((pull, i) => {
                          const pt = rarityTier(pull, session.pricePerUnit);
                          const stripTitle =
                            pull.cardName || pull.name || pull.slotName;
                          const soft = isSoftHitPull(pull);
                          return (
                            <button
                              type="button"
                              key={`strip-${pack.packIndex}-${i}`}
                              className={`pack-strip-card ${
                                pt === "chase" ? "pack-strip-card-chase" : ""
                              } ${soft ? "soft-hit-frame" : ""}`}
                              title={stripTitle}
                              aria-label={`View details for ${stripTitle}`}
                              onClick={() => setZoomCard({ pull, tier: pt })}
                            >
                              {pull.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={pull.imageUrl}
                                  alt=""
                                  loading="lazy"
                                  decoding="async"
                                  onError={(e) => {
                                    const el = e.currentTarget;
                                    el.style.display = "none";
                                    const fb =
                                      el.nextElementSibling as HTMLElement | null;
                                    if (fb) fb.style.display = "flex";
                                  }}
                                />
                              ) : null}
                              <span
                                className="pack-strip-fallback"
                                style={{
                                  display: pull.imageUrl ? "none" : "flex",
                                }}
                                aria-hidden
                              >
                                ◆
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {pack.pulls.length === 0 ? (
                      <div className="text-[12px] text-zinc-500">
                        Quiet pack — still shuffled for the feel
                      </div>
                    ) : (
                      <ul className="space-y-1.5">
                        {pack.pulls.map((pull, i) => {
                          const pt = rarityTier(pull, session.pricePerUnit);
                          const value = pullValue(pull);
                          const title =
                            pull.cardName || pull.name || pull.slotName;
                          const isFiller =
                            pull.odds === "filler" || value <= 0;
                          const soft = isSoftHitPull(pull);
                          return (
                            <li
                              key={`${pack.packIndex}-${i}`}
                              className={`pull-chip pull-card-row rounded-xl border pull-chip-${pt} ${
                                pt === "chase" || soft
                                  ? "pull-card-chase-frame"
                                  : ""
                              } ${soft && pt !== "chase" ? "soft-hit-row" : ""}`}
                              style={
                                reducedMotion
                                  ? undefined
                                  : {
                                      animationDelay: `${40 + i * 55}ms`,
                                    }
                              }
                            >
                              <button
                                type="button"
                                className="pull-card-row-btn px-2 py-1.5"
                                aria-label={`View details for ${title}`}
                                onClick={() =>
                                  setZoomCard({ pull, tier: pt })
                                }
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className={`pull-card-thumb shrink-0 overflow-hidden rounded-md bg-black/50 ${
                                      pt === "chase" || soft
                                        ? "pull-card-thumb-chase"
                                        : ""
                                    }`}
                                  >
                                    {pull.imageUrl ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={pull.imageUrl}
                                        alt=""
                                        width={40}
                                        height={56}
                                        loading="lazy"
                                        decoding="async"
                                        className="h-14 w-10 object-cover"
                                        onError={(e) => {
                                          const el = e.currentTarget;
                                          el.style.display = "none";
                                          const fallback =
                                            el.nextElementSibling as HTMLElement | null;
                                          if (fallback)
                                            fallback.style.display = "flex";
                                        }}
                                      />
                                    ) : null}
                                    <span
                                      className="h-14 w-10 items-center justify-center text-[10px] text-zinc-500"
                                      style={{
                                        display: pull.imageUrl
                                          ? "none"
                                          : "flex",
                                      }}
                                      aria-hidden
                                    >
                                      ◆
                                    </span>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-[12px] sm:text-[13px] font-semibold text-white leading-snug break-words whitespace-normal">
                                      {title}
                                    </div>
                                    <div className="text-[10px] text-zinc-500 break-words whitespace-normal mt-0.5">
                                      {isFiller
                                        ? "Pack filler · illustrative"
                                        : `${pull.slotName}${
                                            pull.odds ? ` · ${pull.odds}` : ""
                                          }`}
                                    </div>
                                  </div>
                                  <div className="shrink-0 text-right">
                                    <div className="text-[12px] font-mono font-semibold text-emerald-300">
                                      {isFiller ? "—" : fmtMoney(value)}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>

            {allRevealed && (
              <div className="flex flex-col gap-2 pt-1 summary-punch">
                <div className="flex flex-wrap gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => void shareToInstagram()}
                    disabled={imageShareBusy}
                    className="text-[12px] px-3.5 py-2 rounded-xl bg-pink-500/20 border border-pink-400/50 text-pink-50 font-semibold hover:bg-pink-500/30 disabled:opacity-50"
                  >
                    {imageShareBusy ? "Building…" : "Share to Instagram"}
                  </button>
                  {showSaveFallback && (
                    <button
                      type="button"
                      onClick={() => void saveStoryImage()}
                      disabled={imageShareBusy}
                      className="text-[11px] px-2.5 py-1.5 rounded-lg text-zinc-400 border border-zinc-700/80 hover:text-zinc-200 hover:border-zinc-500 disabled:opacity-50"
                    >
                      Save image
                    </button>
                  )}
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
                {shareNote && (
                  <p className="text-[11px] text-pink-200/80 share-toast">
                    {shareNote}
                  </p>
                )}
                <p className="text-[10px] text-zinc-600 leading-snug">
                  Opens your device share sheet with a Stories-sized image —
                  pick Instagram if it appears. Web can&apos;t force the IG
                  Stories camera.
                </p>
              </div>
            )}
          </section>
        )}

        {/* 1-line footer disclaimer */}
        <p className="text-[11px] text-zinc-600 text-center leading-snug pt-1">
          Free educational sim · not gambling · no real-money opens.{" "}
          <button
            type="button"
            className="text-cyan-500/80 hover:text-cyan-300 underline-offset-2 hover:underline"
            onClick={() => setShowDisclaimer(true)}
          >
            Details
          </button>
        </p>
      </main>

      {/* Sticky Open another — same set, no bounce to product step */}
      {onResults && allRevealed && session && (
        <div className="fixed bottom-14 lg:bottom-0 inset-x-0 z-40 px-3 pb-2 pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            <button
              type="button"
              onClick={runOpen}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold bg-cyan-500/25 border border-cyan-400/60 text-cyan-50 hover:bg-cyan-500/35 portal-glow open-cta-pulse shadow-lg shadow-cyan-950/50 backdrop-blur-md"
            >
              Open another · {session.product.name}
            </button>
          </div>
        </div>
      )}

      {showDisclaimer && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Simulation disclaimer"
          onClick={() => setShowDisclaimer(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-purple-500/30 bg-zinc-950 p-4 space-y-3 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-cyan-200">
                About this sim
              </h2>
              <button
                type="button"
                className="text-zinc-500 hover:text-zinc-300 text-sm"
                onClick={() => setShowDisclaimer(false)}
              >
                Close
              </button>
            </div>
            <p className="text-[12px] leading-relaxed text-zinc-400">
              {OPEN_SIM_DISCLAIMER}
            </p>
            <p className="text-[12px] leading-relaxed text-zinc-500">
              <span className="text-cyan-400/80 font-medium">Card art · </span>
              {OPEN_CARD_ART_DISCLAIMER}
            </p>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              No IAP for packs. Future VIP (if any) is data/alerts only — never
              paid pack opens.
            </p>
          </div>
        </div>
      )}

      {zoomCard && session && (
        <CardZoomModal
          pull={zoomCard.pull}
          tier={zoomCard.tier}
          productId={session.product.id}
          productName={session.product.name}
          productEmoji={session.product.emoji}
          onClose={() => setZoomCard(null)}
        />
      )}

      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-green-500/15 bg-black/80 backdrop-blur-md lg:hidden">
        <div className="flex max-w-3xl mx-auto px-2 py-2 gap-1">
          <Link
            href="/"
            className="flex-1 py-2 rounded-xl text-[11px] font-medium border border-zinc-800 text-zinc-400 text-center"
          >
            EV
          </Link>
          <Link
            href="/open"
            className="flex-1 py-2 rounded-xl text-[11px] font-medium border border-cyan-400/50 bg-cyan-500/15 text-cyan-200 text-center"
          >
            Open
          </Link>
          <Link
            href="/deals"
            className="flex-1 py-2 rounded-xl text-[11px] font-medium border border-zinc-800 text-zinc-400 text-center"
          >
            Under-EV
          </Link>
          <Link
            href="/log"
            className="flex-1 py-2 rounded-xl text-[11px] font-medium border border-zinc-800 text-zinc-400 text-center"
          >
            Log
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
