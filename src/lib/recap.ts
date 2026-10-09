import { products, calculateEV, productDisplayName, formatPriceSheetDate, pricesUpdated, type Product } from "@/lib/products";
import { hasSheetPrice } from "@/lib/sets";

export interface RecapRow {
  product: Product;
  name: string;
  format: string;
  price: number;
  totalEV: number;
  roi: number;
  profit: number;
}

/** Weekly recap: the live Under-EV list (+ closest-to-EV fill), from the price sheet only. */
export function buildRecap(limit = 5): {
  under: RecapRow[];
  closest: RecapRow[];
  underCount: number;
  dateLabel: string;
  dateRaw: string;
} {
  const rows: RecapRow[] = products
    .filter(hasSheetPrice)
    .map((p) => {
      const { totalEV, roi, profit } = calculateEV(p, p.defaultPrice);
      return {
        product: p,
        name: productDisplayName(p),
        format: p.format,
        price: p.defaultPrice,
        totalEV,
        roi,
        profit,
      };
    })
    .sort((a, b) => b.roi - a.roi);
  const underAll = rows.filter((r) => r.profit > 0);
  const under = underAll.slice(0, limit);
  const closest = rows
    .filter((r) => r.profit <= 0)
    .slice(0, Math.max(0, Math.min(3, limit - under.length)));
  return {
    under,
    closest,
    underCount: underAll.length,
    dateLabel: formatPriceSheetDate(),
    dateRaw: pricesUpdated,
  };
}
