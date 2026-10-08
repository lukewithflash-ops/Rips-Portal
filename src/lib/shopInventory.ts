import {
  calculateEV,
  findProduct,
  productDisplayName,
  products,
  resolveProductId,
  type Product,
} from "@/lib/products";

const KEY = "rip-portal-shop-v1";

export type ShopRow = {
  key: string;
  query: string;
  productId: string | null;
  qty: number;
  price: number;
  /** Why this row has no EV. Empty when matched. */
  note: string;
};

export type ShopLineMath = ShopRow & {
  product: Product | null;
  unitEv: number | null;
  lineEv: number | null;
  lineCost: number | null;
  roi: number | null;
};

function newKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function matchShopQuery(query: string): {
  product: Product | null;
  note: string;
} {
  const q = query.trim();
  if (!q) return { product: null, note: "Missing product" };

  const exact = products.find((p) => p.id === q);
  if (exact) return { product: exact, note: "" };

  const resolved = resolveProductId(q);
  if (resolved !== q) {
    const aliased = products.find((p) => p.id === resolved);
    if (aliased) return { product: aliased, note: "" };
  }

  const lower = q.toLowerCase();
  const byName = products.filter(
    (p) => productDisplayName(p).toLowerCase() === lower
  );
  if (byName.length === 1) return { product: byName[0], note: "" };
  if (byName.length > 1) {
    return {
      product: null,
      note: "That name has more than one format. Use the product id.",
    };
  }

  const byLabel = products.filter(
    (p) => `${productDisplayName(p)} ${p.format}`.toLowerCase() === lower
  );
  if (byLabel.length === 1) return { product: byLabel[0], note: "" };

  return { product: null, note: "Not in the Rip Portal catalog" };
}

function parseNumber(raw: string): number | null {
  const n = Number(String(raw).trim().replace(/^\$/, ""));
  if (!Number.isFinite(n) || n < 0 || n > 1000000) return null;
  return n;
}

/** CSV or TSV: product id or name, quantity, your price. One row per line. */
export function parseShopPaste(text: string): ShopRow[] {
  const rows: ShopRow[] = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const parts = trimmed.split(/[,\t]/).map((p) => p.trim());
    if (parts.length < 3) {
      rows.push({
        key: newKey(),
        query: trimmed,
        productId: null,
        qty: 0,
        price: 0,
        note: "Need product, quantity, and price",
      });
      continue;
    }
    const query = parts[0];
    const qty = parseNumber(parts[1]);
    const price = parseNumber(parts[2]);
    const matched = matchShopQuery(query);
    let note = matched.note;
    if (qty == null || price == null) {
      note = note || "Quantity and price must be numbers";
    } else if (qty <= 0) {
      note = note || "Quantity must be above 0";
    } else if (qty > 100000) {
      note = "Quantity is too large";
    }
    rows.push({
      key: newKey(),
      query,
      productId: matched.product?.id ?? null,
      qty: qty == null ? 0 : Math.round(qty * 1000) / 1000,
      price: price == null ? 0 : Math.round(price * 100) / 100,
      note,
    });
  }
  return rows;
}

export function withMath(row: ShopRow): ShopLineMath {
  const product = row.productId ? findProduct(row.productId) ?? null : null;
  if (!product || row.note || row.qty <= 0) {
    return {
      ...row,
      product,
      unitEv: null,
      lineEv: null,
      lineCost: null,
      roi: null,
    };
  }
  const { totalEV, roi } = calculateEV(product, row.price);
  return {
    ...row,
    product,
    unitEv: totalEV,
    lineEv: totalEV * row.qty,
    lineCost: row.price * row.qty,
    roi,
  };
}

export function loadShopRows(): ShopRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ShopRow[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((r) => r && typeof r.query === "string")
      .slice(0, 500)
      .map((r) => ({
        key: typeof r.key === "string" ? r.key : newKey(),
        query: r.query,
        productId: typeof r.productId === "string" ? r.productId : null,
        qty: Number.isFinite(r.qty) ? r.qty : 0,
        price: Number.isFinite(r.price) ? r.price : 0,
        note: typeof r.note === "string" ? r.note : "",
      }));
  } catch {
    return [];
  }
}

export function saveShopRows(rows: ShopRow[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(rows.slice(0, 500)));
  } catch {
    /* quota */
  }
}
