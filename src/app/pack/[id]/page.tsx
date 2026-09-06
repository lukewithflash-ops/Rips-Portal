import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { products, calculateEV, categories } from "@/lib/products";
import PackRedirect from "./PackRedirect";
import BuyLinks, { AffiliateDisclosure } from "@/components/BuyLinks";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) {
    return { title: "Pack not found" };
  }
  const { totalEV, roi } = calculateEV(product, product.defaultPrice);
  const roiLabel = `${roi >= 0 ? "+" : ""}${roi.toFixed(1)}% ROI`;
  const title = `${product.name} · ${product.format}`;
  const description = `Price $${product.defaultPrice.toFixed(2)} · EV $${totalEV.toFixed(2)} · ${roiLabel}. Know before you rip — Rip Portal.`;
  const url = `https://ripsportal.com/pack/${product.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} · Rip Portal`,
      description,
      url,
      siteName: "Rip Portal",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · Rip Portal`,
      description,
    },
  };
}

function fmtMoney(n: number): string {
  const abs = Math.abs(n);
  const body = abs >= 100 ? abs.toFixed(0) : abs.toFixed(2);
  return `${n < 0 ? "-" : ""}$${body}`;
}

export default async function PackSharePage({ params }: Props) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) notFound();

  const { totalEV, roi, profit } = calculateEV(product, product.defaultPrice);
  const dest = `/?pack=${encodeURIComponent(product.id)}`;
  const cat = categories.find((c) => c.id === product.category);

  return (
    <div className="min-h-screen portal-bg flex flex-col">
      <PackRedirect href={dest} />
      <main className="flex-1 mx-auto w-full max-w-lg px-4 py-12">
        <div className="panel rounded-2xl p-6 border border-emerald-500/30 space-y-4">
          <div className="text-[10px] uppercase tracking-widest text-emerald-400/90 font-semibold">
            Pack share
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {product.emoji ?? "📦"} {product.name}
          </h1>
          <p className="text-sm text-zinc-400">
            {product.format}
            {cat ? ` · ${cat.label}` : ""}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-black/40 border border-zinc-800 px-3 py-2 text-center">
              <div className="text-[9px] uppercase text-zinc-600">Price</div>
              <div className="font-mono text-sm text-zinc-100">
                {fmtMoney(product.defaultPrice)}
              </div>
            </div>
            <div className="rounded-xl bg-black/40 border border-zinc-800 px-3 py-2 text-center">
              <div className="text-[9px] uppercase text-zinc-600">EV</div>
              <div className="font-mono text-sm text-zinc-100">
                {fmtMoney(totalEV)}
              </div>
            </div>
            <div
              className={`rounded-xl px-3 py-2 text-center border ${
                profit > 0
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-black/40 border-zinc-800"
              }`}
            >
              <div className="text-[9px] uppercase text-zinc-600">ROI</div>
              <div
                className={`font-mono text-sm ${
                  profit > 0 ? "text-emerald-300" : "text-zinc-100"
                }`}
              >
                {roi >= 0 ? "+" : ""}
                {roi.toFixed(1)}%
              </div>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">
              Buy
            </div>
            <BuyLinks query={product.name} />
            <AffiliateDisclosure className="mt-1" />
          </div>
          <Link
            href={dest}
            className="inline-flex text-sm px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-100"
          >
            Open in calculator →
          </Link>
          <p className="text-[11px] text-zinc-600 leading-relaxed">
            Redirecting to the EV calculator. Estimates only — not financial
            advice.
          </p>
        </div>
      </main>
    </div>
  );
}
