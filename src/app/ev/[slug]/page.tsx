import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  calculateEV,
  formatPriceSheetDate,
  buySearchQuery,
  isSportsCategory,
  pricesUpdated,
  type Product,
} from "@/lib/products";
import { computeVerdict, VERDICT_DISCLAIMER, type VerdictKind } from "@/lib/verdict";
import { findSet, listSets } from "@/lib/sets";
import { priceLastMoved } from "@/lib/priceDates";
import { hasLiveUnderEvAffiliate } from "@/lib/affiliate";
import BuyLinks, { AffiliateDisclosure } from "@/components/BuyLinks";
import BrandLogo from "@/components/BrandLogo";
import ProductThumb from "@/components/ProductThumb";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return listSets().map((g) => ({ slug: g.slug }));
}

function fmtMoney(n: number): string {
  const abs = Math.abs(n);
  const body = abs >= 100 ? abs.toFixed(0) : abs.toFixed(2);
  return `${n < 0 ? "-" : ""}$${body}`;
}

function fmtRoi(roi: number): string {
  return `${roi >= 0 ? "+" : ""}${roi.toFixed(1)}%`;
}

function verdictLabel(kind: VerdictKind): string {
  if (kind === "rip") return "Rip";
  if (kind === "singles") return "Buy singles";
  return "Hold sealed";
}

function verdictClass(kind: VerdictKind): string {
  if (kind === "rip") return "bg-green-500/15 text-green-300 border-green-400/40";
  if (kind === "singles") return "bg-cyan-500/15 text-cyan-300 border-cyan-400/40";
  return "bg-amber-500/15 text-amber-300 border-amber-400/40";
}

function rowFor(p: Product) {
  const price = p.defaultPrice;
  const { totalEV, roi, profit } = calculateEV(p, price);
  const verdict = computeVerdict(p, price);
  return { p, price, totalEV, roi, profit, verdict };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const set = findSet(slug);
  if (!set) return { title: "Set not found" };
  const lead = set.products[0]!;
  const r = rowFor(lead);
  const dateLabel = formatPriceSheetDate();
  const title = `${set.name} EV: is it worth opening? | Rip Portal`;
  const description =
    set.products.length > 1
      ? `${set.name} expected value for ${set.products.length} products. ${lead.format}: ${fmtMoney(r.price)} price vs ${fmtMoney(r.totalEV)} EV (${fmtRoi(r.roi)} ROI). Prices ${dateLabel}. Know before you rip.`
      : `${set.name} ${lead.format}: ${fmtMoney(r.price)} price vs ${fmtMoney(r.totalEV)} EV (${fmtRoi(r.roi)} ROI), verdict ${verdictLabel(r.verdict.primary)}. Prices ${dateLabel}. Know before you rip.`;
  const url = `${SITE_URL}/ev/${set.slug}`;
  const og = `${SITE_URL}/api/verdict?id=${encodeURIComponent(lead.id)}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Rip Portal",
      type: "article",
      images: [{ url: og, width: 1200, height: 630, alt: `${set.name} verdict` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [og],
    },
  };
}

export default async function SetEvPage({ params }: Props) {
  const { slug } = await params;
  const set = findSet(slug);
  if (!set) notFound();

  const rows = set.products.map(rowFor);
  const dateLabel = formatPriceSheetDate();
  const showBuy = hasLiveUnderEvAffiliate();
  const sports = isSportsCategory(set.category);
  const underEv = rows.filter((r) => r.profit > 0);
  const others = listSets()
    .filter((g) => g.slug !== set.slug && g.category === set.category)
    .slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${set.name} expected value`,
    itemListElement: rows.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${set.name} ${r.p.format}`,
      url: `${SITE_URL}/pack/${r.p.id}`,
    })),
  };

  return (
    <div className="min-h-screen portal-bg flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="mx-auto w-full max-w-2xl px-4 pt-6">
        <Link href="/" aria-label="Rip Portal home">
          <BrandLogo height={32} compact />
        </Link>
      </header>
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8 space-y-6">
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-widest text-emerald-400/90 font-semibold">
            {set.categoryLabel} · Set EV
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {set.name} EV: is it worth opening?
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {underEv.length > 0
              ? `${underEv.length} of ${rows.length} ${set.name} product${rows.length === 1 ? "" : "s"} price below modeled EV right now.`
              : `Every ${set.name} product here prices above its modeled EV right now — fun to open, not +EV.`}{" "}
            Prices {dateLabel} (TCGplayer market on the Rip Portal price sheet).
          </p>
        </div>

        <ul className="space-y-3">
          {rows.map(({ p, price, totalEV, roi, profit, verdict }) => (
            <li key={p.id} className="panel rounded-2xl p-4 border border-emerald-500/15 space-y-3">
              <div className="flex items-start gap-3">
                <ProductThumb product={{ image: p.image, name: p.name }} className="h-14 w-11" />
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold text-zinc-100">
                    {p.format}
                  </h2>
                  <div className="text-[11px] text-zinc-500">
                    {p.name} · Prices {dateLabel}
                    {priceLastMoved(p.id) ? ` · same price since ${formatPriceSheetDate(priceLastMoved(p.id)!)}` : ""}
                  </div>
                </div>
                <span
                  className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${verdictClass(verdict.primary)}`}
                >
                  {verdictLabel(verdict.primary)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-black/40 border border-zinc-800 px-3 py-2 text-center">
                  <div className="text-[9px] uppercase text-zinc-600">Price</div>
                  <div className="font-mono text-sm text-zinc-100">{fmtMoney(price)}</div>
                </div>
                <div className="rounded-xl bg-black/40 border border-zinc-800 px-3 py-2 text-center">
                  <div className="text-[9px] uppercase text-zinc-600">EV</div>
                  <div className="font-mono text-sm text-zinc-100">{fmtMoney(totalEV)}</div>
                </div>
                <div
                  className={`rounded-xl px-3 py-2 text-center border ${
                    profit > 0
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-black/40 border-zinc-800"
                  }`}
                >
                  <div className="text-[9px] uppercase text-zinc-600">ROI</div>
                  <div className={`font-mono text-sm ${profit > 0 ? "text-emerald-300" : "text-zinc-100"}`}>
                    {fmtRoi(roi)}
                  </div>
                </div>
              </div>
              <p className="text-[12px] text-zinc-400 leading-relaxed">{verdict.rationale}</p>
              {showBuy && (
                <BuyLinks
                  query={buySearchQuery(p)}
                  buyUrl={p.buyUrl}
                  retailer={p.retailer}
                  size="md"
                  compact
                  preferEbay={sports}
                  hideTcgplayer={sports}
                  liveOnly
                  productId={p.id}
                />
              )}
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/?pack=${encodeURIComponent(p.id)}`}
                  className="text-[12px] px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/25"
                >
                  Check your price in the calculator →
                </Link>
                <a
                  href={`/api/verdict?id=${encodeURIComponent(p.id)}`}
                  className="text-[12px] px-3 py-1.5 rounded-lg bg-black/40 border border-zinc-700 text-zinc-300 hover:border-emerald-500/40"
                >
                  Verdict image
                </a>
              </div>
            </li>
          ))}
        </ul>

        {!showBuy && <AffiliateDisclosure />}

        <section className="space-y-2 text-[12px] text-zinc-500 leading-relaxed">
          <h2 className="text-sm font-semibold text-zinc-300">How this is worked out</h2>
          <p>
            EV is the sum of each rarity slot&apos;s odds times its average card
            value. ROI compares that EV to the price above. Slot odds and
            averages are estimates from community pull data and market prices —
            open the calculator to see every slot or type in your own price.
          </p>
          <p>{VERDICT_DISCLAIMER}</p>
          <p className="text-zinc-600">Price sheet dated {pricesUpdated}.</p>
        </section>

        <nav className="flex flex-wrap gap-2 text-[12px]">
          <Link href="/deals" className="px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-300">
            Under-EV Watch →
          </Link>
          <Link href="/ev" className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300">
            All set EV pages
          </Link>
          {others.map((g) => (
            <Link
              key={g.slug}
              href={`/ev/${g.slug}`}
              className="px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-200"
            >
              {g.name} EV
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
