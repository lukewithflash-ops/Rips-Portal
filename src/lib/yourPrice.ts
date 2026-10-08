/** Per-product price the visitor typed, kept on this device only. */

const KEY = "rip-portal-your-price-v1";

type PriceMap = Record<string, number>;

function readAll(): PriceMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return {};
    const out: PriceMap = {};
    for (const [id, value] of Object.entries(parsed)) {
      const n = typeof value === "number" ? value : Number(value);
      if (!Number.isFinite(n) || n < 0 || n > 100000) continue;
      out[id] = Math.round(n * 100) / 100;
    }
    return out;
  } catch {
    return {};
  }
}

function writeAll(next: PriceMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota / private mode */
  }
}

export function loadYourPrice(productId: string): number | null {
  const n = readAll()[productId];
  return n == null ? null : n;
}

/** Empty string when nothing is saved, so the field shows the catalog price. */
export function savedPriceInput(productId: string): string {
  const n = loadYourPrice(productId);
  return n == null ? "" : String(n);
}

export function saveYourPrice(productId: string, price: number): void {
  if (!Number.isFinite(price) || price < 0 || price > 100000) return;
  const all = readAll();
  all[productId] = Math.round(price * 100) / 100;
  writeAll(all);
}

export function clearYourPrice(productId: string): void {
  const all = readAll();
  if (!(productId in all)) return;
  delete all[productId];
  writeAll(all);
}
