import priceSheet from "@/data/prices.json";
import {
  products,
  categories,
  calculateEV,
  productDisplayName,
  type Product,
  type Category,
} from "@/lib/products";

/**
 * Per-set grouping for /ev/[slug] SEO pages.
 * Only products with a real price on the sheet (src/data/prices.json) are listed.
 */
export interface SetGroup {
  slug: string;
  name: string;
  category: Category;
  categoryLabel: string;
  products: Product[];
}

const sheet = priceSheet.prices as Record<string, number | undefined>;

export function hasSheetPrice(p: Product): boolean {
  const v = sheet[p.id];
  return typeof v === "number" && Number.isFinite(v) && v > 0;
}

/** Set name a product belongs to (30th Celebration SKUs carry the product type in `name`). */
export function productSetName(p: Product): string {
  if (p.id.startsWith("poke-30th-")) return "30th Celebration";
  return productDisplayName(p);
}

export function slugify(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function setSlugForProduct(p: Product): string {
  return slugify(productSetName(p));
}

/** Format order inside a set: single packs first, then boxes / bundles by price. */
function formatRank(p: Product): number {
  return /booster pack/i.test(p.format) ? 0 : 1;
}

let cache: SetGroup[] | null = null;

export function listSets(): SetGroup[] {
  if (cache) return cache;
  const map = new Map<string, SetGroup>();
  for (const p of products) {
    if (!hasSheetPrice(p)) continue;
    const name = productSetName(p);
    const slug = slugify(name);
    let g = map.get(slug);
    if (!g) {
      g = {
        slug,
        name,
        category: p.category,
        categoryLabel: categories.find((c) => c.id === p.category)?.label ?? p.category,
        products: [],
      };
      map.set(slug, g);
    }
    g.products.push(p);
  }
  for (const g of map.values()) {
    g.products.sort(
      (a, b) => formatRank(a) - formatRank(b) || a.defaultPrice - b.defaultPrice
    );
  }
  cache = [...map.values()];
  return cache;
}

export function findSet(slug: string): SetGroup | undefined {
  return listSets().find((g) => g.slug === slug);
}

/** /ev/<slug> for a product, or null when the product has no sheet price. */
export function setPathForProduct(p: Product): string | null {
  if (!hasSheetPrice(p)) return null;
  return `/ev/${setSlugForProduct(p)}`;
}

/** Best (highest ROI) product in a set — used for og:image and summary. */
export function headlineProduct(g: SetGroup): Product {
  return [...g.products].sort(
    (a, b) =>
      calculateEV(b, b.defaultPrice).roi - calculateEV(a, a.defaultPrice).roi
  )[0]!;
}
