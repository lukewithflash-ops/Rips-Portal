"use client";

import { useState } from "react";
import {
  FEE_PRESETS,
  KEEPER_DISCLAIMER,
  clampFeePercent,
  computeKeeperEV,
  type FeePresetId,
} from "@/lib/keeper";

type Props = {
  grossEV: number;
  price: number;
  /** Optional qty for scaled totals (display only) */
  quantity?: number;
  compact?: boolean;
};

export default function KeeperEvPanel({
  grossEV,
  price,
  quantity = 1,
}: Props) {
  const [presetId, setPresetId] = useState<FeePresetId>("ebay");
  const [feeStr, setFeeStr] = useState(
    String(FEE_PRESETS.find((p) => p.id === "ebay")!.feePercent)
  );

  const feePercent = clampFeePercent(parseFloat(feeStr) || 0);
  const m = computeKeeperEV(grossEV, price, feePercent);
  const scale = Math.max(1, quantity);
  const netScaled = m.netEV * scale;

  const selectPreset = (id: FeePresetId) => {
    setPresetId(id);
    if (id !== "custom") {
      const p = FEE_PRESETS.find((x) => x.id === id)!;
      setFeeStr(String(p.feePercent));
    }
  };

  return (
    <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/[0.04] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
          Keeper EV
          <span className="ml-1.5 font-normal normal-case tracking-normal text-zinc-600">
            net of fees
          </span>
        </h3>
        <span className="text-[9px] text-zinc-600 uppercase tracking-wider">
          estimate
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {FEE_PRESETS.map((p) => {
          const active = presetId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => selectPreset(p.id)}
              title={p.hint}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] border transition-colors ${
                active
                  ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-200"
                  : "border-zinc-700/80 bg-black/40 text-zinc-400 hover:border-cyan-500/30"
              }`}
            >
              {p.label}
              {p.id !== "custom" && (
                <span className="ml-1 text-zinc-500 font-mono text-[10px]">
                  ~{p.feePercent}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-end gap-3 mb-3">
        <div>
          <label className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wider">
            Fee %
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            max="50"
            value={feeStr}
            onChange={(e) => {
              setFeeStr(e.target.value);
              setPresetId("custom");
            }}
            className="w-20 bg-black/70 border border-zinc-700 rounded-lg px-2.5 py-2 text-right text-cyan-200 font-mono text-sm focus:outline-none focus:border-cyan-400"
          />
        </div>
        <p className="text-[10px] text-zinc-500 pb-2 max-w-[14rem] leading-snug">
          {FEE_PRESETS.find((p) => p.id === presetId)?.hint ?? "Your rate"} —
          fees vary
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">
            Gross EV
          </div>
          <div className="font-mono text-lg text-zinc-200">
            ${m.grossEV.toFixed(2)}
          </div>
          <div className="text-[10px] text-zinc-600">
            {m.grossRoi >= 0 ? "+" : ""}
            {m.grossRoi.toFixed(1)}% ROI
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">
            Net EV
          </div>
          <div
            className={`font-mono text-lg font-semibold ${
              m.netProfit >= 0 ? "text-cyan-300" : "text-amber-300"
            }`}
          >
            ${m.netEV.toFixed(2)}
          </div>
          <div className="text-[10px] text-zinc-600">
            −${m.fees.toFixed(2)} fees
            {scale > 1 && (
              <span className="text-zinc-500">
                {" "}
                · ${netScaled.toFixed(2)} ×{scale}
              </span>
            )}
          </div>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">
            Net ROI vs price
          </div>
          <div
            className={`font-mono text-lg font-semibold ${
              m.netRoi >= 0 ? "text-green-400" : "text-red-400/90"
            }`}
          >
            {m.netRoi >= 0 ? "+" : ""}
            {m.netRoi.toFixed(1)}%
          </div>
          <div
            className={`text-[10px] font-mono ${
              m.netProfit >= 0 ? "text-green-400/80" : "text-red-400/70"
            }`}
          >
            {m.netProfit >= 0 ? "+" : ""}${m.netProfit.toFixed(2)} after fees
          </div>
        </div>
      </div>

      <p className="mt-3 text-[10px] text-zinc-500 leading-relaxed border-t border-zinc-800/60 pt-2">
        {KEEPER_DISCLAIMER}
      </p>
    </div>
  );
}
