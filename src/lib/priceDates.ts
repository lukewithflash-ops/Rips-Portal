import history from "@/data/priceHistory.json";
import priceSheet from "@/data/prices.json";

/**
 * Per-product "price last moved" dates from real past price sheets
 * (src/data/priceHistory.json, built from git history of prices.json).
 * Nothing is interpolated: the date is the sheet where this product's price
 * last changed. If the live sheet already differs from the last history
 * point, the live sheet date wins.
 */
type Sheet = { date: string; prices: Record<string, number> };

const sheets = ((history as unknown as { sheets?: Sheet[] }).sheets ?? [])
  .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s.date))
  .sort((a, b) => a.date.localeCompare(b.date));

let cache: Map<string, string> | null = null;

function build(): Map<string, string> {
  const out = new Map<string, string>();
  const last = new Map<string, number>();
  for (const s of sheets) {
    for (const [id, v] of Object.entries(s.prices)) {
      const prev = last.get(id);
      if (prev == null || Math.abs(prev - v) > 0.004) out.set(id, s.date);
      last.set(id, v);
    }
  }
  const live = priceSheet.prices as Record<string, number | undefined>;
  for (const [id, v] of Object.entries(live)) {
    if (typeof v !== "number") continue;
    const prev = last.get(id);
    if (prev == null || Math.abs(prev - v) > 0.004) out.set(id, priceSheet.updated);
  }
  return out;
}

/** YYYY-MM-DD of the sheet where this product's price last changed, or null. */
export function priceLastMoved(productId: string): string | null {
  if (!cache) cache = build();
  return cache.get(productId) ?? null;
}
