import { calculateEV, type Product, type RaritySlot } from "@/lib/products";

export type VerdictKind = "rip" | "singles" | "hold";

export interface VerdictOption {
  kind: VerdictKind;
  label: string;
  /** Short metric line shown on the card */
  metric: string;
  /** Supporting numbers / context */
  detail: string;
}

export interface PortalVerdict {
  primary: VerdictKind;
  rationale: string;
  options: VerdictOption[];
  /** Chase slots used for the singles estimate (transparent) */
  chaseSlots: RaritySlot[];
  singlesEstimate: number;
  expectedCostToPullTop: number | null;
  totalEV: number;
  roi: number;
  profit: number;
}

const BULKISH = /bulk|common|guaranteed|base \+|pack hits/i;

/** Prefer high avgValue / low-odds chase tiers; skip obvious bulk. */
export function pickChaseSlots(product: Product, limit = 3): RaritySlot[] {
  const ranked = [...product.slots].sort((a, b) => b.avgValue - a.avgValue);
  const chase = ranked.filter(
    (s) =>
      !BULKISH.test(s.name) &&
      (s.avgValue >= 8 || s.oddsNum < 0.25)
  );
  if (chase.length > 0) return chase.slice(0, limit);
  return ranked.slice(0, Math.min(limit, ranked.length));
}

function fmtMoney(n: number): string {
  const abs = Math.abs(n);
  const body = abs >= 100 ? abs.toFixed(0) : abs.toFixed(2);
  return `${n < 0 ? "-" : ""}$${body}`;
}

function fmtRoi(roi: number): string {
  return `${roi >= 0 ? "+" : ""}${roi.toFixed(1)}%`;
}

/**
 * Math-first Rip vs Buy singles vs Hold sealed decision layer.
 * Entertainment / model estimate only — not investment advice.
 */
export function computeVerdict(product: Product, price: number): PortalVerdict {
  const { totalEV, roi, profit } = calculateEV(product, price);
  const chaseSlots = pickChaseSlots(product);
  const singlesEstimate = chaseSlots.reduce((sum, s) => sum + s.avgValue, 0);

  const topChase = chaseSlots[0] ?? null;
  const expectedCostToPullTop =
    topChase && topChase.oddsNum > 0 ? price / topChase.oddsNum : null;

  const sealedGap = price - totalEV; // >0 means paying above EV (sealed premium)
  const singlesCheaperThanPull =
    expectedCostToPullTop != null &&
    singlesEstimate > 0 &&
    expectedCostToPullTop > singlesEstimate * 1.15;

  let primary: VerdictKind;
  if (roi >= 5 || profit > Math.max(0.5, price * 0.05)) {
    // Clearly under EV → Rip
    primary = "rip";
  } else if (
    singlesCheaperThanPull &&
    roi < 0 &&
    expectedCostToPullTop != null &&
    expectedCostToPullTop >= price * 3
  ) {
    // Deep −EV and chasing via packs is far more expensive than buying the tiers
    primary = "singles";
  } else if (price >= totalEV || roi <= -5) {
    // Price at/above EV or weak/negative ROI → Hold sealed
    primary = "hold";
  } else if (roi >= 0) {
    primary = "rip";
  } else {
    primary = "hold";
  }

  const chaseNames = chaseSlots.map((s) => s.name).join(", ");

  const options: VerdictOption[] = [
    {
      kind: "rip",
      label: "Rip",
      metric: `${fmtMoney(totalEV)} EV · ${fmtRoi(roi)} ROI`,
      detail: `${fmtMoney(profit)} vs your price of ${fmtMoney(price)} per unit`,
    },
    {
      kind: "singles",
      label: "Buy singles",
      metric: `~${fmtMoney(singlesEstimate)} chase basket`,
      detail:
        expectedCostToPullTop != null && topChase
          ? `Estimate of top tiers (${chaseNames || "chase slots"}). Expected rip cost to hit ${topChase.name}: ~${fmtMoney(expectedCostToPullTop)}`
          : `Estimate from top EV tiers (${chaseNames || "n/a"}) — not a live singles API`,
    },
    {
      kind: "hold",
      label: "Hold sealed",
      metric:
        sealedGap >= 0
          ? `${fmtMoney(sealedGap)} above EV`
          : `${fmtMoney(Math.abs(sealedGap))} under EV`,
      detail: `Price ${fmtMoney(price)} vs EV ${fmtMoney(totalEV)} · ${fmtRoi(roi)} ROI signal`,
    },
  ];

  let rationale: string;
  if (primary === "rip") {
    rationale =
      roi >= 0
        ? `Math leans Rip: EV (${fmtMoney(totalEV)}) clears your price (${fmtMoney(price)}) at ${fmtRoi(roi)} ROI — still variance-heavy, not a guarantee.`
        : `Math is only mildly under EV; if you want the open, Rip is the least-bad of the three on these numbers.`;
  } else if (primary === "singles") {
    rationale = `Buying the listed chase tiers (~${fmtMoney(singlesEstimate)}) looks cheaper than the expected cost to pull the top hit via packs (~${fmtMoney(expectedCostToPullTop ?? 0)}). Estimate only — check live listings.`;
  } else {
    rationale =
      sealedGap >= 0
        ? `Price sits at/above EV (${fmtMoney(price)} vs ${fmtMoney(totalEV)}). Math leans Hold sealed over opening — entertainment rip is fine, +EV is not the story.`
        : `ROI is soft (${fmtRoi(roi)}). Holding sealed keeps optionality vs paying the open premium for chase odds.`;
  }

  return {
    primary,
    rationale,
    options,
    chaseSlots,
    singlesEstimate,
    expectedCostToPullTop,
    totalEV,
    roi,
    profit,
  };
}

export const VERDICT_DISCLAIMER =
  "Portal Verdict is a math estimate for entertainment — not financial, investment, or collecting advice. Markets move; verify live prices before you buy, rip, or hold.";
