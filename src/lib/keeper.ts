/**
 * Keeper EV — net-of-fees estimates for resale platforms.
 * Fees vary by category, volume, and promotions; treat as entertainment math only.
 */

export type FeePresetId = "ebay" | "tcgplayer" | "whatnot" | "custom";

export interface FeePreset {
  id: FeePresetId;
  label: string;
  /** Default fee percent when this preset is selected */
  feePercent: number;
  hint: string;
}

export const FEE_PRESETS: FeePreset[] = [
  {
    id: "ebay",
    label: "eBay",
    feePercent: 13,
    hint: "~13% FVF estimate",
  },
  {
    id: "tcgplayer",
    label: "TCGPlayer",
    feePercent: 10.5,
    hint: "~10%+ marketplace",
  },
  {
    id: "whatnot",
    label: "Whatnot",
    feePercent: 10,
    hint: "~8–12% typical",
  },
  {
    id: "custom",
    label: "Custom",
    feePercent: 10,
    hint: "Your rate",
  },
];

export const KEEPER_DISCLAIMER =
  "Keeper EV is an estimate — platform fees vary by category, promo, and payment processing. Not financial advice.";

export interface KeeperMetrics {
  grossEV: number;
  netEV: number;
  fees: number;
  feePercent: number;
  grossProfit: number;
  netProfit: number;
  grossRoi: number;
  netRoi: number;
}

/** Clamp fee % to a sane editable range. */
export function clampFeePercent(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  if (n > 50) return 50;
  return Math.round(n * 100) / 100;
}

export function netOfFees(grossEV: number, feePercent: number) {
  const pct = clampFeePercent(feePercent);
  const feeRate = pct / 100;
  const netEV = grossEV * (1 - feeRate);
  const fees = grossEV - netEV;
  return { netEV, fees, feePercent: pct, feeRate };
}

/**
 * Gross EV vs net EV after estimated platform fees, plus net ROI vs purchase price.
 */
export function computeKeeperEV(
  grossEV: number,
  price: number,
  feePercent: number
): KeeperMetrics {
  const { netEV, fees, feePercent: pct } = netOfFees(grossEV, feePercent);
  const grossProfit = grossEV - price;
  const netProfit = netEV - price;
  const grossRoi = price > 0 ? (grossProfit / price) * 100 : 0;
  const netRoi = price > 0 ? (netProfit / price) * 100 : 0;
  return {
    grossEV,
    netEV,
    fees,
    feePercent: pct,
    grossProfit,
    netProfit,
    grossRoi,
    netRoi,
  };
}

export function presetById(id: FeePresetId): FeePreset {
  return FEE_PRESETS.find((p) => p.id === id) ?? FEE_PRESETS[0];
}
