"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  categories,
  products,
  calculateEV,
  formatPriceSheetDate,
  buySearchQuery,
  isSportsCategory,
  type Category,
  isVerified,
} from "@/lib/products";
import { hasLiveUnderEvAffiliate } from "@/lib/affiliate";
import BrandLogo from "@/components/BrandLogo";
import DealAlertsBanner from "@/components/DealAlertsBanner";
import PushAlertsButton from "@/components/PushAlertsButton";
import BuyLinks from "@/components/BuyLinks";
import ProductThumb from "@/components/ProductThumb";
import VerdictShareButton from "@/components/VerdictShareButton";
import { FREE_UNDER_EV_ROWS, useVip } from "@/lib/useVip";
import { setPathForProduct, productSetName } from "@/lib/sets";
import { priceLastMoved } from "@/lib/priceDates";

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
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyStatus, setNotifyStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [notifyMsg, setNotifyMsg] = useState<string | null>(null);

  const pricesUpdatedLabel = formatPriceSheetDate();
  const vip = useVip();
  /** VIP data plan: free sees the top rows only, once checkout is live. */
  const locked = vip.gatesOn && !vip.vip;

  const copyShareLink = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/deals`
        : "https://www.ripsportal.com/deals";
    try {
      await navigator.clipboard?.writeText(url);
      setCopiedShare(true);
      window.setTimeout(() => setCopiedShare(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const submitNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = notifyEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) return;
    setNotifyStatus("loading");
    setNotifyMsg(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          interests: ["deals"],
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };
      if (res.ok && data.ok) {
        setNotifyStatus("done");
        setNotifyMsg("Saved. Flip emails send only when a row enters or leaves Under-EV, once mail delivery is on.");
      } else {
        setNotifyStatus("error");
        setNotifyMsg(
          data.message ||
            "Could not reach the waitlist. Try /waitlist or email lukewithflash@gmail.com."
        );
      }
    } catch {
      setNotifyStatus("error");
      setNotifyMsg("Network error — try again or use /waitlist.");
    }
  };


  const underEv = useMemo(() => {
    const rows = products
      .map((p) => {
        const { totalEV, roi, profit } = calculateEV(p, p.defaultPrice);
        return { product: p, totalEV, roi, profit, price: p.defaultPrice };
      })
      .filter((row) => row.profit > 0 && isVerified(row.product));

    rows.sort((a, b) =>
      sortKey === "edge" ? b.profit - a.profit : b.roi - a.roi
    );
    return rows;
  }, [sortKey]);

  const filtered = useMemo(() => {
    if (categoryFilter === "all") return underEv;
    return underEv.filter((row) => row.product.category === categoryFilter);
  }, [underEv, categoryFilter]);

  // Free rows = top N by ROI, fixed so sort/filter can't page past them.
  const freeIds = useMemo(
    () =>
      new Set(
        [...underEv]
          .sort((a, b) => b.roi - a.roi)
          .slice(0, FREE_UNDER_EV_ROWS)
          .map((r) => r.product.id)
      ),
    [underEv]
  );
  const visible = useMemo(
    () => (locked ? filtered.filter((r) => freeIds.has(r.product.id)) : filtered),
    [locked, filtered, freeIds]
  );
  const hiddenCount = locked ? underEv.length - freeIds.size : 0;

  const catLabel = (id: Category) =>
    categories.find((c) => c.id === id)?.label ?? id;


  return (
    <div className="flex min-h-screen portal-bg flex-col">
      <header className="border-b border-purple-500/20 bg-black/40 backdrop-blur-md sticky top-0 z-40 site-chrome">
        <div className="px-4 md:px-6 py-3 flex items-center justify-between gap-3 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-2.5 min-w-0">
            <BrandLogo height={34} compact />
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
              Under-EV Watch
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Price under expected EV
            </h1>
            <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
              Products where catalog default/market price is below modeled EV —
              ranked by ROI% or $ edge. Multi-hobby. Same math as the calculator.
            </p>
            <p className="text-[11px] text-zinc-500 mt-2">
              Updated {pricesUpdatedLabel} · {underEv.length} under-EV right now
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
            <Link
              href="/recap"
              className="mt-3 ml-2 inline-flex text-[11px] px-2.5 py-1.5 rounded-lg bg-black/40 border border-zinc-700 text-zinc-300 hover:border-emerald-500/40 transition-colors"
            >
              Weekly recap image
            </Link>
          </div>
        </section>

        <div
          className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-[12px] text-amber-100/90 leading-relaxed"
          role="note"
        >
          {DISCLAIMER}
        </div>


        <section className="panel rounded-2xl p-4 border border-purple-500/25">
          <div className="text-[10px] uppercase tracking-widest text-purple-300/90 font-semibold mb-1">
            Under-EV alerts
          </div>
          <h2 className="text-sm font-semibold text-white mb-1">
            Notify when it flips under-EV
          </h2>
          {vip.gatesOn ? (
            <p className="text-[12px] text-zinc-500 mb-3 leading-relaxed">
              An email goes out only when a product flips into or out of
              Under-EV — never on a quiet week. Unsubscribe is in every email.
            </p>
          ) : (
            <p className="text-[12px] text-zinc-500 mb-3 leading-relaxed">
              Same waitlist as the rest of Rip Portal. An email goes out only
              when a product flips into or out of Under-EV — never on a quiet
              week. Delivery stays off until a mail key is connected; your
              address is saved for that. Unsubscribe is in every email.
            </p>
          )}
          {vip.vip ? (
            <p className="text-[12px] text-emerald-300">
              👑 VIP: flip emails go to {vip.email}.
            </p>
          ) : locked ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <p className="text-[12px] text-zinc-400 flex-1">
                Flip emails are part of VIP.
              </p>
              <Link
                href="/vip"
                className="shrink-0 text-center px-4 py-2.5 rounded-xl text-sm font-medium bg-amber-500/15 border border-amber-400/40 text-amber-100 hover:bg-amber-500/25"
              >
                👑 Get flip emails
              </Link>
            </div>
          ) : notifyStatus === "done" ? (
            <p className="text-[12px] text-emerald-300">{notifyMsg}</p>
          ) : (
            <form onSubmit={submitNotify} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                placeholder="you@email.com"
                className="flex-1 bg-black/60 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-400/60"
              />
              <button
                type="submit"
                disabled={notifyStatus === "loading" || !notifyEmail.trim()}
                className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium bg-purple-500/20 border border-purple-400/40 text-purple-100 disabled:opacity-50"
              >
                {notifyStatus === "loading" ? "Saving…" : "Notify me"}
              </button>
            </form>
          )}
          {notifyStatus === "error" && notifyMsg && (
            <p className="mt-2 text-[11px] text-amber-300/90">{notifyMsg}</p>
          )}
          <p className="mt-2 text-[10px] text-zinc-600">
            Or open the full{" "}
            <Link href="/waitlist" className="text-purple-300 hover:underline">
              waitlist
            </Link>
            .
          </p>
        </section>

        <DealAlertsBanner variant="banner" />
        <PushAlertsButton context="deals" />

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

        {visible.length === 0 && !(locked && hiddenCount > 0) ? (
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
            {visible.map(({ product: p, totalEV, roi, profit, price }, idx) => (
              <li key={p.id}>
                <div className="panel rounded-2xl p-3.5 border border-emerald-500/15 hover:border-emerald-400/35 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-300 shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <ProductThumb product={p} className="h-10 w-8" />
                            <div className="text-sm font-medium text-zinc-100 truncate">
                              {p.name}
                            </div>
                          </div>
                          <div className="text-[11px] text-zinc-500 truncate">
                            {p.format} · {catLabel(p.category)}
                          </div>
                          <div className="text-[10px] text-zinc-500">
                            Prices {pricesUpdatedLabel}
                            {(() => {
                              const moved = priceLastMoved(p.id);
                              return moved ? (
                                <span className="text-zinc-600">
                                  {" "}· same price since {formatPriceSheetDate(moved)}
                                </span>
                              ) : null;
                            })()}
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

                      {hasLiveUnderEvAffiliate() && (
                        <div className="mt-3">
                          <div className="text-[10px] uppercase tracking-wider text-emerald-400/80 font-semibold mb-1.5">
                            Buy
                          </div>
                          <BuyLinks
                            query={buySearchQuery(p)}
                            buyUrl={p.buyUrl}
                            retailer={p.retailer}
                            size="lg"
                            compact
                            preferEbay={isSportsCategory(p.category)}
                            hideTcgplayer={
                              isSportsCategory(p.category) ||
                              !hasLiveUnderEvAffiliate()
                            }
                            liveOnly
                            productId={p.id}
                          />
                        </div>
                      )}

                      <div className="mt-2.5 flex flex-wrap gap-2">
                        <Link
                          href={`/?pack=${p.id}`}
                          className="text-[11px] px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/25 transition-colors"
                        >
                          Open calculator
                        </Link>
                        {setPathForProduct(p) && (
                          <Link
                            href={setPathForProduct(p)!}
                            className="text-[11px] px-2.5 py-1.5 rounded-lg bg-black/40 border border-emerald-500/25 text-emerald-200/90 hover:bg-emerald-500/10 transition-colors"
                          >
                            {productSetName(p)} EV page
                          </Link>
                        )}
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
                        <VerdictShareButton productId={p.id} price={price} />
                        {vip.gatesOn && (
                          <Link
                            href={`/vip/history?id=${p.id}`}
                            className="text-[11px] px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200/90 hover:bg-amber-500/20 transition-colors"
                          >
                            👑 Price history
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {locked && hiddenCount > 0 && (
              <li>
                <Link
                  href="/vip"
                  className="block panel rounded-2xl p-4 border border-amber-500/30 text-center hover:border-amber-400/60 transition-colors"
                >
                  <div className="text-sm font-semibold text-amber-100">
                    👑 {hiddenCount} more under-EV {hiddenCount === 1 ? "row" : "rows"} with VIP
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    $5/month or $40/year · flip emails, Log export, price history
                  </div>
                </Link>
              </li>
            )}
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
