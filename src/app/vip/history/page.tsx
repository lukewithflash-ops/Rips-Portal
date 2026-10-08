"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { products, productDisplayName, resolveProductId } from "@/lib/products";
import { useLocationSearch, useVip } from "@/lib/useVip";

type Point = { date: string; price: number };

function fmt(n: number): string {
  return n >= 100 ? `$${n.toFixed(0)}` : `$${n.toFixed(2)}`;
}

function Sparkline({ points }: { points: Point[] }) {
  if (points.length < 2) return null;
  const w = 320;
  const h = 80;
  const ys = points.map((p) => p.price);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const span = max - min || 1;
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * (w - 8) + 4;
      const y = h - 6 - ((p.price - min) / span) * (h - 12);
      return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20" role="img" aria-label="Price over time">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-300" />
    </svg>
  );
}

export default function PriceHistoryPage() {
  const vip = useVip();
  const search = useLocationSearch();
  const [picked, setPicked] = useState<string | null>(null);
  const fromUrl = new URLSearchParams(search).get("id");
  const id = picked ?? (fromUrl ? resolveProductId(fromUrl) : products[0]?.id || "");
  const [result, setResult] = useState<
    { id: string; points: Point[]; name: string } | { id: string; err: string } | null
  >(null);
  const current = result && result.id === id ? result : null;
  const points = current && "points" in current ? current.points : null;
  const name = current && "name" in current ? current.name : "";
  const err = current && "err" in current ? current.err : null;

  const options = useMemo(
    () =>
      products.map((p) => ({ id: p.id, label: `${productDisplayName(p)} · ${p.format}` })),
    []
  );

  useEffect(() => {
    if (!id || !vip.loaded || !vip.vip) return;
    fetch(`/api/vip/history?id=${encodeURIComponent(id)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok) setResult({ id, points: d.points as Point[], name: d.name as string });
        else setResult({ id, err: "Couldn't load history." });
      })
      .catch(() => setResult({ id, err: "Network error." }));
  }, [id, vip.loaded, vip.vip]);

  return (
    <div className="min-h-screen portal-bg flex flex-col">
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-10 pb-24">
        <div className="flex items-center justify-between gap-3">
          <BrandLogo height={34} compact />
          <Link href="/vip" className="text-[12px] text-amber-300/90 hover:underline">
            ← VIP
          </Link>
        </div>
        <h1 className="mt-5 text-2xl headline-flare">👑 Price history</h1>
        <p className="mt-1 text-[12px] text-zinc-500">
          Market price on each past Rip Portal price sheet. Not live quotes.
        </p>

        {!vip.loaded ? (
          <p className="mt-6 text-sm text-zinc-500">Loading…</p>
        ) : !vip.vip ? (
          <div className="mt-6 panel rounded-2xl p-4 border border-amber-500/25">
            <p className="text-sm text-zinc-300">Price history is part of VIP.</p>
            <Link href="/vip" className="mt-3 inline-block text-[13px] px-3 py-2 rounded-lg border border-amber-400/50 bg-amber-500/15 text-amber-100">
              See VIP · $5/month or $40/year
            </Link>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <select
              value={id}
              onChange={(e) => setPicked(e.target.value)}
              className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100"
            >
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            {!current && <p className="text-[12px] text-zinc-500">Loading…</p>}
            {err && <p className="text-[12px] text-amber-300">{err}</p>}
            {points && (
              <div className="panel rounded-2xl p-4 border border-amber-500/25">
                <div className="text-sm font-medium text-zinc-100">{name}</div>
                {points.length === 0 ? (
                  <p className="mt-2 text-[12px] text-zinc-500">
                    No sheet prices recorded for this product yet. It uses the catalog default.
                  </p>
                ) : (
                  <>
                    <Sparkline points={points} />
                    <table className="mt-2 w-full text-[12px]">
                      <thead>
                        <tr className="text-zinc-500 text-left">
                          <th className="py-1 font-normal">Sheet date</th>
                          <th className="py-1 font-normal text-right">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...points].reverse().map((p) => (
                          <tr key={p.date} className="border-t border-zinc-800/70">
                            <td className="py-1.5 text-zinc-300">{p.date}</td>
                            <td className="py-1.5 text-right font-mono text-zinc-100">{fmt(p.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
