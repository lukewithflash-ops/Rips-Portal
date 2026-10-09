import Link from "next/link";
import type { Metadata } from "next";
import { calculateEV, formatPriceSheetDate } from "@/lib/products";
import { listSets } from "@/lib/sets";
import BrandLogo from "@/components/BrandLogo";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Pack EV by set: is it worth opening? | Rip Portal" },
  description:
    "Expected value, ROI and a verdict for every Pokémon, One Piece, Topps baseball and basketball set Rip Portal prices. Know before you rip.",
  alternates: { canonical: `${SITE_URL}/ev` },
};

export default function EvIndexPage() {
  const sets = listSets();
  const dateLabel = formatPriceSheetDate();
  return (
    <div className="min-h-screen portal-bg flex flex-col">
      <header className="mx-auto w-full max-w-2xl px-4 pt-6">
        <Link href="/" aria-label="Rip Portal home">
          <BrandLogo height={32} compact />
        </Link>
      </header>
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8 space-y-5">
        <h1 className="text-2xl font-bold text-white tracking-tight">Pack EV by set</h1>
        <p className="text-sm text-zinc-400">Prices {dateLabel}. Tap a set for price, EV, ROI and the verdict on each product.</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {sets.map((g) => {
            const best = Math.max(
              ...g.products.map((p) => calculateEV(p, p.defaultPrice).roi)
            );
            return (
              <li key={g.slug}>
                <Link
                  href={`/ev/${g.slug}`}
                  className="panel flex items-center justify-between gap-3 rounded-xl px-4 py-3 border border-zinc-800 hover:border-emerald-500/40"
                >
                  <span className="min-w-0">
                    <span className="block text-sm text-zinc-100 truncate">{g.name}</span>
                    <span className="block text-[11px] text-zinc-500">
                      {g.categoryLabel} · {g.products.length} product{g.products.length === 1 ? "" : "s"}
                    </span>
                  </span>
                  <span className={`font-mono text-[12px] ${best > 0 ? "text-emerald-300" : "text-zinc-400"}`}>
                    best {best >= 0 ? "+" : ""}
                    {best.toFixed(0)}%
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
