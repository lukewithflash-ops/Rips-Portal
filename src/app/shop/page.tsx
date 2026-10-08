"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { productDisplayName } from "@/lib/products";
import {
  loadShopRows,
  parseShopPaste,
  saveShopRows,
  withMath,
  type ShopRow,
} from "@/lib/shopInventory";

const PLACEHOLDER = "poke-ascended-pack, 1, 10.64";

function fmtMoney(n: number): string {
  const abs = Math.abs(n);
  const body = abs >= 100 ? abs.toFixed(0) : abs.toFixed(2);
  return `${n < 0 ? "-" : ""}$${body}`;
}

function fmtRoi(roi: number): string {
  return `${roi >= 0 ? "+" : ""}${roi.toFixed(1)}%`;
}

export default function ShopPage() {
  const [paste, setPaste] = useState("");
  const [rows, setRows] = useState<ShopRow[]>([]);
  const [ready, setReady] = useState(false);
  const [pasteNote, setPasteNote] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setRows(loadShopRows());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveShopRows(rows);
  }, [rows, ready]);

  const lines = useMemo(() => rows.map(withMath), [rows]);
  const counted = lines.filter((l) => l.lineEv != null && l.lineCost != null);
  const totalCost = counted.reduce((s, l) => s + (l.lineCost || 0), 0);
  const totalEv = counted.reduce((s, l) => s + (l.lineEv || 0), 0);
  const totalQty = counted.reduce((s, l) => s + l.qty, 0);
  const totalRoi = totalCost > 0 ? ((totalEv - totalCost) / totalCost) * 100 : 0;

  const applyPaste = () => {
    const parsed = parseShopPaste(paste);
    if (!parsed.length) {
      setPasteNote("Nothing to add. Use product, quantity, price on each line.");
      return;
    }
    setRows((prev) => [...parsed, ...prev].slice(0, 500));
    setPaste("");
    const missed = parsed.filter((r) => r.note).length;
    setPasteNote(
      missed
        ? `Added ${parsed.length}. ${missed} need a catalog match before they count.`
        : `Added ${parsed.length}.`
    );
  };

  return (
    <div className="flex min-h-screen portal-bg flex-col">
      <header className="border-b border-purple-500/20 bg-black/40 backdrop-blur-md sticky top-0 z-40 site-chrome">
        <div className="px-4 md:px-6 py-3 flex items-center justify-between gap-3 max-w-3xl mx-auto w-full">
          <BrandLogo height={34} compact />
          <Link
            href="/"
            className="text-[11px] text-emerald-400/90 hover:text-emerald-300 underline-offset-2 hover:underline"
          >
            ← Calculator
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 md:px-6 py-5 max-w-3xl mx-auto w-full space-y-4 pb-24">
        <section className="panel rounded-2xl p-4 border border-zinc-800">
          <h1 className="text-xl font-bold text-white tracking-tight">Shop</h1>
          <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
            Paste inventory as product, quantity, your price. EV uses the same
            catalog math as the calculator. Nothing here is an account, and it
            stays on this device.
          </p>
          <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
            Example line (catalog id and sheet price, not your stock):{" "}
            <span className="font-mono text-zinc-400">{PLACEHOLDER}</span>
          </p>
        </section>

        <section className="panel rounded-2xl p-4 border border-zinc-800 space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-zinc-500" htmlFor="shop-paste">
            Paste rows
          </label>
          <textarea
            id="shop-paste"
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            rows={5}
            placeholder={PLACEHOLDER}
            className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-emerald-400/50"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={applyPaste}
              disabled={!paste.trim()}
              className="px-3 py-2 rounded-lg text-[12px] font-medium bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 disabled:opacity-40"
            >
              Add to inventory
            </button>
            {rows.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setRows([]);
                  setPasteNote("Cleared on this device.");
                }}
                className="px-3 py-2 rounded-lg text-[12px] text-zinc-400 border border-zinc-700"
              >
                Clear
              </button>
            )}
            {pasteNote && <span className="text-[11px] text-zinc-500">{pasteNote}</span>}
          </div>
        </section>

        <section className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Units", value: String(totalQty) },
            { label: "Your cost", value: fmtMoney(totalCost) },
            { label: "Catalog EV", value: fmtMoney(totalEv) },
            { label: "ROI", value: counted.length ? fmtRoi(totalRoi) : "—" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-zinc-800 bg-black/40 px-3 py-2">
              <div className="text-[9px] uppercase tracking-wider text-zinc-500">{s.label}</div>
              <div className="font-mono text-sm text-zinc-100 mt-0.5">{s.value}</div>
            </div>
          ))}
        </section>

        {lines.length === 0 ? (
          <p className="text-sm text-zinc-500">No inventory yet.</p>
        ) : (
          <ul className="space-y-2">
            {lines.map((line) => (
              <li key={line.key} className="panel rounded-2xl p-3.5 border border-zinc-800">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-zinc-100">
                      {line.product
                        ? productDisplayName(line.product)
                        : line.query}
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      {line.product
                        ? `${line.product.format} · qty ${line.qty} · your price ${fmtMoney(line.price)}`
                        : line.query}
                    </div>
                    {line.note && (
                      <p className="text-[11px] text-amber-300/90 mt-1">{line.note}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setRows((prev) => prev.filter((r) => r.key !== line.key))}
                    className="text-[11px] text-zinc-500 hover:text-zinc-200 shrink-0"
                  >
                    Remove
                  </button>
                </div>
                {line.unitEv != null && line.lineEv != null && line.roi != null && (
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-black/40 border border-zinc-800 px-2 py-1.5">
                      <div className="text-[9px] uppercase text-zinc-600">EV each</div>
                      <div className="font-mono text-[12px] text-zinc-200">{fmtMoney(line.unitEv)}</div>
                    </div>
                    <div className="rounded-lg bg-black/40 border border-zinc-800 px-2 py-1.5">
                      <div className="text-[9px] uppercase text-zinc-600">Line EV</div>
                      <div className="font-mono text-[12px] text-zinc-200">{fmtMoney(line.lineEv)}</div>
                    </div>
                    <div className="rounded-lg bg-black/40 border border-zinc-800 px-2 py-1.5">
                      <div className="text-[9px] uppercase text-zinc-600">ROI</div>
                      <div className={`font-mono text-[12px] ${line.roi >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                        {fmtRoi(line.roi)}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className="text-[11px] text-zinc-600 leading-relaxed">
          Catalog estimates only — not financial advice, and not a second app.
          Unmatched rows are kept so you can see them, and they are left out of
          the totals.
        </p>
      </main>
    </div>
  );
}
