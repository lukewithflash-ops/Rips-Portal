export type Category = "pokemon" | "baseball" | "basketball" | "onepiece";

export interface RaritySlot {
  name: string;
  odds: string;
  oddsNum: number;
  avgValue: number;
}

export interface Product {
  id: string;
  category: Category;
  name: string;
  format: string;
  defaultPrice: number;
  slots: RaritySlot[];
  notes?: string;
}

export const categories: { id: Category; label: string; emoji: string; color: string }[] = [
  { id: "pokemon", label: "Pokémon", emoji: "⚡", color: "from-yellow-400 to-amber-500" },
  { id: "baseball", label: "Topps Baseball", emoji: "⚾", color: "from-red-500 to-rose-600" },
  { id: "basketball", label: "Basketball", emoji: "🏀", color: "from-orange-500 to-amber-600" },
  { id: "onepiece", label: "One Piece", emoji: "🏴‍☠️", color: "from-blue-500 to-cyan-500" },
];

export const products: Product[] = [
  // ========== POKÉMON — Ascended Heroes focus ==========
  {
    id: "poke-ascended-pack",
    category: "pokemon",
    name: "Ascended Heroes",
    format: "Booster Pack",
    defaultPrice: 14.0,
    slots: [
      { name: "Bulk (Commons + Uncommons)", odds: "~100%", oddsNum: 1.0, avgValue: 0.8 },
      { name: "Double Rare (RR)", odds: "1:5", oddsNum: 0.20, avgValue: 1.5 },
      { name: "Illustration Rare (IR)", odds: "1:9", oddsNum: 0.111, avgValue: 12.5 },
      { name: "Ultra Rare (UR)", odds: "1:21", oddsNum: 0.048, avgValue: 2.6 },
      { name: "Mega Attack Rare (MAR)", odds: "1:29", oddsNum: 0.034, avgValue: 25 },
      { name: "Special Illustration Rare (SIR)", odds: "1:70", oddsNum: 0.0143, avgValue: 275 },
      { name: "Mega Hyper Rare (MHR)", odds: "1:540", oddsNum: 0.00185, avgValue: 480 },
    ],
    notes:
      "Ascended Heroes (Mega Evolution). SIR + MHR carry most of the EV. Market packs often trade well above MSRP — adjust the price field to current listing prices. Data approximate as of mid-2026.",
  },
  {
    id: "poke-ascended-etb",
    category: "pokemon",
    name: "Ascended Heroes",
    format: "Elite Trainer Box (9 packs)",
    defaultPrice: 175,
    slots: [
      { name: "Bulk value across 9 packs", odds: "guaranteed", oddsNum: 1, avgValue: 7 },
      { name: "Double Rares + IRs (expected)", odds: "several", oddsNum: 1, avgValue: 28 },
      { name: "Ultra / Mega Attack Rares", odds: "expected", oddsNum: 1, avgValue: 18 },
      { name: "SIR chance (across box)", odds: "~1:8 boxes", oddsNum: 0.13, avgValue: 275 },
      { name: "MHR chance", odds: "very low", oddsNum: 0.017, avgValue: 480 },
    ],
    notes: "ETB approximation. Promo and accessories not included in EV. High variance.",
  },
  {
    id: "poke-prismatic-pack",
    category: "pokemon",
    name: "Prismatic Evolutions",
    format: "Booster Pack",
    defaultPrice: 15,
    slots: [
      { name: "Bulk / Commons", odds: "~50%", oddsNum: 0.5, avgValue: 0.3 },
      { name: "Rare / Holo", odds: "1:4", oddsNum: 0.25, avgValue: 2 },
      { name: "Ultra / EX", odds: "1:10", oddsNum: 0.1, avgValue: 8 },
      { name: "Illustration Rare", odds: "1:15", oddsNum: 0.067, avgValue: 22 },
      { name: "Special Illustration Rare", odds: "1:70", oddsNum: 0.014, avgValue: 180 },
      { name: "Master Ball / Big Chase", odds: "1:600+", oddsNum: 0.0017, avgValue: 900 },
    ],
    notes: "Still a major chase set. High secondary prices on packs.",
  },

  // ========== BASKETBALL — Topps Chrome Update focus ==========
  {
    id: "bball-chrome-update-hobby",
    category: "basketball",
    name: "2025-26 Topps Chrome Update",
    format: "Hobby Box (20 packs / 1 auto)",
    defaultPrice: 950,
    slots: [
      { name: "Base + Refractors (box total)", odds: "many", oddsNum: 1, avgValue: 60 },
      { name: "Numbered parallels (/99 and better)", odds: "several", oddsNum: 1, avgValue: 80 },
      { name: "Inserts / SSPs", odds: "variable", oddsNum: 1, avgValue: 50 },
      { name: "Autograph (guaranteed)", odds: "1 per box", oddsNum: 1, avgValue: 180 },
      { name: "High-end / Debut Patch potential", odds: "very rare", oddsNum: 0.03, avgValue: 1200 },
    ],
    notes:
      "Hobby boxes have run hot post-release (often $900–$1100+). One auto guaranteed. Debut Patch 1/1s and top rookies (Flagg etc.) create extreme variance. Adjust price to current comps.",
  },
  {
    id: "bball-chrome-update-mega",
    category: "basketball",
    name: "2025-26 Topps Chrome Update",
    format: "Mega Box",
    defaultPrice: 160,
    slots: [
      { name: "Base + Refractors / X-Fractors", odds: "strong", oddsNum: 1, avgValue: 25 },
      { name: "Numbered parallels", odds: "low", oddsNum: 1, avgValue: 20 },
      { name: "Inserts", odds: "several", oddsNum: 1, avgValue: 15 },
      { name: "Auto chance", odds: "low", oddsNum: 0.12, avgValue: 150 },
    ],
    notes: "Often better relative value than Hobby at current secondary prices. Still high variance.",
  },
  {
    id: "bball-chrome-update-value",
    category: "basketball",
    name: "2025-26 Topps Chrome Update",
    format: "Value / Blaster Box",
    defaultPrice: 70,
    slots: [
      { name: "Base + Refractors", odds: "solid", oddsNum: 1, avgValue: 12 },
      { name: "Parallels / Inserts", odds: "some", oddsNum: 1, avgValue: 15 },
      { name: "Numbered / Auto chance", odds: "low", oddsNum: 0.05, avgValue: 80 },
    ],
    notes: "Entry-level format. Lower hit rates but much lower cost.",
  },

  // ========== BASEBALL (lighter presence) ==========
  {
    id: "base-chrome-hobby",
    category: "baseball",
    name: "2026 Topps Chrome",
    format: "Hobby Box (20 packs)",
    defaultPrice: 320,
    slots: [
      { name: "Base + Refractors", odds: "many", oddsNum: 1, avgValue: 45 },
      { name: "Numbered parallels", odds: "~1-2", oddsNum: 1, avgValue: 55 },
      { name: "Rookie Autograph", odds: "1 per box", oddsNum: 1, avgValue: 110 },
      { name: "Inserts / SPs", odds: "variable", oddsNum: 1, avgValue: 35 },
      { name: "High-end potential", odds: "very low", oddsNum: 0.05, avgValue: 400 },
    ],
    notes: "Classic Chrome. Autos and numbered cards drive most value.",
  },

  // ========== ONE PIECE (lighter presence) ==========
  {
    id: "op-16-pack",
    category: "onepiece",
    name: "OP-16 The Time of Battle",
    format: "Booster Pack",
    defaultPrice: 5.5,
    slots: [
      { name: "Common / Uncommon", odds: "~60%", oddsNum: 0.6, avgValue: 0.2 },
      { name: "Rare", odds: "1:4", oddsNum: 0.25, avgValue: 1.5 },
      { name: "Super Rare / Leader", odds: "1:12", oddsNum: 0.083, avgValue: 8 },
      { name: "Secret / Alt Art", odds: "1:40", oddsNum: 0.025, avgValue: 35 },
      { name: "Manga Rare / Chase", odds: "1:200+", oddsNum: 0.005, avgValue: 160 },
    ],
    notes: "Competitive set. Manga rares move the needle hard.",
  },
];

export function calculateEV(product: Product, price: number) {
  const totalEV = product.slots.reduce(
    (sum, slot) => sum + slot.oddsNum * slot.avgValue,
    0
  );
  const roi = price > 0 ? ((totalEV - price) / price) * 100 : 0;
  return { totalEV, roi, profit: totalEV - price };
}
