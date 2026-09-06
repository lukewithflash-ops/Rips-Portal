import { calculateEV, type Product, type RaritySlot } from "@/lib/products";
import {
  CARD_POOL_DISCLAIMER,
  emptyPackFillers,
  resolveSlotCard,
} from "@/lib/cardPools";

export const OPEN_SIM_DISCLAIMER =
  "Free educational pack-opening simulation only — no gems, no paid opens, no inventory cash-out, no real-money mystery boxes, and no gambling/wagering. Odds and values come from Rip Portal’s EV model (catalog slot rates × avg values). Entertainment / math estimates only — not official TCG pull rates, not live market quotes, and not financial, investment, or collecting advice.";

export const OPEN_CARD_ART_DISCLAIMER = CARD_POOL_DISCLAIMER;

export interface DropTableRow {
  name: string;
  odds: string;
  oddsNum: number;
  avgValue: number;
  /** Contribution to unit EV: oddsNum × avgValue */
  evContribution: number;
}

export interface SimPull {
  slotIndex: number;
  /** Catalog slot / rarity tier label (secondary in UI). */
  slotName: string;
  /** @deprecated Prefer cardName; kept as alias of display name for older UI. */
  name: string;
  /** Illustrative card title shown as the hero label. */
  cardName: string;
  imageUrl?: string;
  /** Card estimate used for pack totaling (pool-weighted ≈ slot avg). */
  estValue: number;
  /** Slot catalog average (EV model anchor). */
  avgValue: number;
  odds: string;
  oddsNum: number;
}

export interface PackResult {
  packIndex: number;
  pulls: SimPull[];
  packValue: number;
  /** Highest-value pull in this pack (for reveal animation) */
  highlight: SimPull | null;
}

export interface SimSession {
  product: Product;
  quantity: number;
  pricePerUnit: number;
  packs: PackResult[];
  totalSimValue: number;
  expectedEV: number;
  costPaid: number;
  vsExpected: number;
  vsCost: number;
  /** Aggregate hit counts per slot index */
  slotCounts: number[];
}

/** Drop table rows derived from product rarity slots (same inputs as calculateEV). */
export function buildDropTable(product: Product): DropTableRow[] {
  return product.slots.map((slot) => ({
    name: slot.name,
    odds: slot.odds,
    oddsNum: slot.oddsNum,
    avgValue: slot.avgValue,
    evContribution: slot.oddsNum * slot.avgValue,
  }));
}

/**
 * Simulate one product unit using independent Bernoulli draws per slot,
 * matching calculateEV: E[value] = Σ oddsNum × avgValue.
 * For oddsNum ≥ 1: floor(oddsNum) guaranteed hits + fractional chance.
 */
export function simulateSlotHits(
  slot: RaritySlot,
  rng: () => number = Math.random
): number {
  let remaining = Math.max(0, slot.oddsNum);
  let hits = 0;
  while (remaining >= 1) {
    hits += 1;
    remaining -= 1;
  }
  if (remaining > 0 && rng() < remaining) hits += 1;
  return hits;
}

function pullFromSlot(
  product: Product,
  slot: RaritySlot,
  slotIndex: number,
  rng: () => number
): SimPull {
  const card = resolveSlotCard(product, slotIndex, slot, rng);
  const cardName = card.name;
  return {
    slotIndex,
    slotName: slot.name,
    name: cardName,
    cardName,
    imageUrl: card.imageUrl,
    estValue: card.estValue,
    avgValue: slot.avgValue,
    odds: slot.odds,
    oddsNum: slot.oddsNum,
  };
}

export function simulateOnePack(
  product: Product,
  packIndex: number,
  rng: () => number = Math.random
): PackResult {
  const pulls: SimPull[] = [];
  product.slots.forEach((slot, slotIndex) => {
    const hits = simulateSlotHits(slot, rng);
    for (let i = 0; i < hits; i++) {
      pulls.push(pullFromSlot(product, slot, slotIndex, rng));
    }
  });
  // Empty / miss packs still feel like a pack open: named bulk at $0 (EV-honest).
  if (pulls.length === 0) {
    for (const filler of emptyPackFillers(product, rng)) {
      pulls.push({
        slotIndex: 0,
        slotName: product.slots[0]?.name ?? "Bulk",
        name: filler.name,
        cardName: filler.name,
        imageUrl: filler.imageUrl,
        estValue: 0,
        avgValue: 0,
        odds: "filler",
        oddsNum: 0,
      });
    }
  }
  // Pack value uses card estValues (pools weighted ≈ slot avg → EV stays honest).
  const packValue = pulls.reduce((s, p) => s + p.estValue, 0);
  const highlight =
    pulls.length === 0
      ? null
      : pulls.reduce(
          (best, p) => (p.estValue > best.estValue ? p : best),
          pulls[0]!
        );
  return { packIndex, pulls, packValue, highlight };
}

export function simulateOpen(
  product: Product,
  quantity: number,
  pricePerUnit: number,
  rng: () => number = Math.random
): SimSession {
  const qty = Math.max(1, Math.min(100, Math.floor(quantity)));
  const price = Math.max(0, pricePerUnit);
  const packs: PackResult[] = [];
  for (let i = 0; i < qty; i++) {
    packs.push(simulateOnePack(product, i + 1, rng));
  }
  const totalSimValue = packs.reduce((s, p) => s + p.packValue, 0);
  const { totalEV } = calculateEV(product, price);
  const expectedEV = totalEV * qty;
  const costPaid = price * qty;
  const slotCounts = product.slots.map((_, idx) =>
    packs.reduce(
      (sum, pack) =>
        sum + pack.pulls.filter((p) => p.slotIndex === idx).length,
      0
    )
  );
  return {
    product,
    quantity: qty,
    pricePerUnit: price,
    packs,
    totalSimValue,
    expectedEV,
    costPaid,
    vsExpected: totalSimValue - expectedEV,
    vsCost: totalSimValue - costPaid,
    slotCounts,
  };
}

export function fmtMoney(n: number): string {
  const abs = Math.abs(n);
  const body = abs >= 100 ? abs.toFixed(0) : abs.toFixed(2);
  return `${n < 0 ? "-" : ""}$${body}`;
}

export function fmtPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}
