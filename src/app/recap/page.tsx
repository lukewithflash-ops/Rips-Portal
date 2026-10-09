import Link from "next/link";
import type { Metadata } from "next";
import { buildRecap } from "@/lib/recap";
import BrandLogo from "@/components/BrandLogo";
import RecapDownload from "./RecapDownload";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Weekly Under-EV recap | Rip Portal" },
  description:
    "This week's Under-EV list as one Instagram-ready image: products priced below modeled EV, ROI and the price date. Know before you rip.",
  alternates: { canonical: `${SITE_URL}/recap` },
  openGraph: {
    title: "Weekly Under-EV recap | Rip Portal",
    url: `${SITE_URL}/recap`,
    siteName: "Rip Portal",
    images: [{ url: `${SITE_URL}/api/recap`, width: 1080, height: 1350 }],
  },
};

function fmtRoi(roi: number): string {
  return `${roi >= 0 ? "+" : ""}${roi.toFixed(1)}%`;
}

export default function RecapPage() {
  const recap = buildRecap(5);
  const file = `rip-portal-recap-${recap.dateRaw}.png`;
  return (
    <div className="min-h-screen portal-bg flex flex-col">
      <header className="mx-auto w-full max-w-xl px-4 pt-6">
        <Link href="/" aria-label="Rip Portal home">
          <BrandLogo height={32} compact />
        </Link>
      </header>
      <main className="flex-1 mx-auto w-full max-w-xl px-4 py-8 space-y-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">Weekly Under-EV recap</h1>
          <p className="text-sm text-zinc-400">
            Prices {recap.dateLabel} · {recap.underCount} under EV. One 1080×1350 image for
            Instagram, built from the live price sheet.
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/recap?v=${recap.dateRaw}`}
          width={1080}
          height={1350}
          alt={`Rip Portal Under-EV recap, prices ${recap.dateLabel}`}
          className="w-full h-auto rounded-2xl border border-emerald-500/20"
        />
        <RecapDownload src={`/api/recap?v=${recap.dateRaw}`} filename={file} />
        <ul className="text-[12px] text-zinc-400 space-y-1">
          {recap.under.map((r) => (
            <li key={r.product.id}>
              {r.name} · {r.format} · <span className="text-emerald-300">{fmtRoi(r.roi)}</span>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          EV is a modeled estimate from slot odds and market card values — not
          financial advice. When posting, keep it clear Rip Portal is a free
          calculator and any shop links are affiliate links.
        </p>
        <Link href="/deals" className="inline-flex text-[12px] text-emerald-300 underline-offset-2 hover:underline">
          Open Under-EV Watch →
        </Link>
      </main>
    </div>
  );
}
