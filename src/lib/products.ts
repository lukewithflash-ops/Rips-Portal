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
  accent?: string;
  emoji?: string;
}

export const categories: { id: Category; label: string; emoji: string; color: string }[] = [
  { id: "pokemon", label: "Pokémon", emoji: "⚡", color: "from-yellow-400 to-amber-500" },
  { id: "baseball", label: "Topps Baseball", emoji: "⚾", color: "from-red-500 to-rose-600" },
  { id: "basketball", label: "Basketball", emoji: "🏀", color: "from-orange-500 to-amber-600" },
  { id: "onepiece", label: "One Piece", emoji: "🏴‍☠️", color: "from-blue-500 to-cyan-500" },
];

export const products: Product[] = [
  // ========== POKÉMON ==========
  {
    id: "poke-ascended-pack",
    category: "pokemon",
    name: "Ascended Heroes",
    format: "Booster Pack",
    defaultPrice: 14.0,
    accent: "from-violet-600 to-fuchsia-500",
    emoji: "🦸",
    slots: [
      { name: "Bulk (Commons + Uncommons)", odds: "~100%", oddsNum: 1.0, avgValue: 0.8 },
      { name: "Double Rare (RR)", odds: "1:5", oddsNum: 0.20, avgValue: 1.5 },
      { name: "Illustration Rare (IR)", odds: "1:9", oddsNum: 0.111, avgValue: 12.5 },
      { name: "Ultra Rare (UR)", odds: "1:21", oddsNum: 0.048, avgValue: 2.6 },
      { name: "Mega Attack Rare (MAR)", odds: "1:29", oddsNum: 0.034, avgValue: 25 },
      { name: "Special Illustration Rare (SIR)", odds: "1:70", oddsNum: 0.0143, avgValue: 275 },
      { name: "Mega Hyper Rare (MHR)", odds: "1:540", oddsNum: 0.00185, avgValue: 480 },
    ],
    notes: "Ascended Heroes (Mega Evolution). SIR + MHR carry most of the EV. Adjust price to current listings.",
  },
  {
    id: "poke-ascended-etb",
    category: "pokemon",
    name: "Ascended Heroes",
    format: "Elite Trainer Box (9 packs)",
    defaultPrice: 175,
    accent: "from-violet-700 to-purple-500",
    emoji: "📦",
    slots: [
      { name: "Bulk value across 9 packs", odds: "guaranteed", oddsNum: 1, avgValue: 7 },
      { name: "Double Rares + IRs (expected)", odds: "several", oddsNum: 1, avgValue: 28 },
      { name: "Ultra / Mega Attack Rares", odds: "expected", oddsNum: 1, avgValue: 18 },
      { name: "SIR chance (across box)", odds: "~1:8 boxes", oddsNum: 0.13, avgValue: 275 },
      { name: "MHR chance", odds: "very low", oddsNum: 0.017, avgValue: 480 },
    ],
    notes: "ETB approximation. Promo and accessories not included. High variance.",
  },
  {
    id: "poke-ascended-bb",
    category: "pokemon",
    name: "Ascended Heroes",
    format: "Booster Box (36 packs)",
    defaultPrice: 480,
    accent: "from-fuchsia-700 to-violet-600",
    emoji: "🗃️",
    slots: [
      { name: "Bulk across 36 packs", odds: "guaranteed", oddsNum: 1, avgValue: 28 },
      { name: "RRs + IRs expected", odds: "many", oddsNum: 1, avgValue: 95 },
      { name: "URs + MARs expected", odds: "several", oddsNum: 1, avgValue: 55 },
      { name: "SIR expected (~0.5)", odds: "~1:2 boxes", oddsNum: 0.5, avgValue: 275 },
      { name: "MHR chance", odds: "low", oddsNum: 0.07, avgValue: 480 },
    ],
    notes: "Full booster box EV. Most consistent way to hit SIRs on average.",
  },
  {
    id: "poke-prismatic-pack",
    category: "pokemon",
    name: "Prismatic Evolutions",
    format: "Booster Pack",
    defaultPrice: 15,
    accent: "from-pink-500 to-rose-400",
    emoji: "✨",
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
  {
    id: "poke-prismatic-etb",
    category: "pokemon",
    name: "Prismatic Evolutions",
    format: "Elite Trainer Box",
    defaultPrice: 160,
    accent: "from-rose-600 to-pink-500",
    emoji: "📦",
    slots: [
      { name: "Bulk + holos across box", odds: "guaranteed", oddsNum: 1, avgValue: 18 },
      { name: "Ultras / IRs expected", odds: "several", oddsNum: 1, avgValue: 35 },
      { name: "SIR chance", odds: "~1:8", oddsNum: 0.12, avgValue: 180 },
      { name: "Big chase chance", odds: "very low", oddsNum: 0.015, avgValue: 900 },
    ],
    notes: "ETB value depends heavily on current SIR market.",
  },
  {
    id: "poke-surging-pack",
    category: "pokemon",
    name: "Surging Sparks",
    format: "Booster Pack",
    defaultPrice: 5.5,
    accent: "from-yellow-500 to-orange-400",
    emoji: "⚡",
    slots: [
      { name: "Bulk", odds: "~100%", oddsNum: 1, avgValue: 0.4 },
      { name: "Rare / Holo", odds: "1:4", oddsNum: 0.25, avgValue: 1.2 },
      { name: "Double Rare / EX", odds: "1:8", oddsNum: 0.125, avgValue: 4 },
      { name: "Illustration Rare", odds: "1:12", oddsNum: 0.083, avgValue: 12 },
      { name: "SIR / Special", odds: "1:60", oddsNum: 0.017, avgValue: 80 },
    ],
    notes: "More affordable modern set. Better entry EV than premium chase sets.",
  },
  {
    id: "poke-destined-pack",
    category: "pokemon",
    name: "Destined Rivals",
    format: "Booster Pack",
    defaultPrice: 6,
    accent: "from-red-600 to-orange-500",
    emoji: "🔥",
    slots: [
      { name: "Bulk", odds: "~100%", oddsNum: 1, avgValue: 0.35 },
      { name: "Rare / Holo", odds: "1:4", oddsNum: 0.25, avgValue: 1.1 },
      { name: "EX / Double Rare", odds: "1:7", oddsNum: 0.14, avgValue: 5 },
      { name: "Illustration Rare", odds: "1:14", oddsNum: 0.07, avgValue: 14 },
      { name: "SIR / Chase", odds: "1:65", oddsNum: 0.015, avgValue: 95 },
    ],
    notes: "Solid mid-tier modern set.",
  },

  // ========== BASKETBALL ==========
  {
    id: "bball-chrome-update-hobby",
    category: "basketball",
    name: "2025-26 Topps Chrome Update",
    format: "Hobby Box (20 packs / 1 auto)",
    defaultPrice: 950,
    accent: "from-orange-600 to-amber-400",
    emoji: "🏀",
    slots: [
      { name: "Base + Refractors (box total)", odds: "many", oddsNum: 1, avgValue: 60 },
      { name: "Numbered parallels (/99+)", odds: "several", oddsNum: 1, avgValue: 80 },
      { name: "Inserts / SSPs", odds: "variable", oddsNum: 1, avgValue: 50 },
      { name: "Autograph (guaranteed)", odds: "1 per box", oddsNum: 1, avgValue: 180 },
      { name: "High-end / Debut Patch potential", odds: "very rare", oddsNum: 0.03, avgValue: 1200 },
    ],
    notes: "Hobby often $900–$1100+. One auto guaranteed. Extreme variance on top rookies.",
  },
  {
    id: "bball-chrome-update-mega",
    category: "basketball",
    name: "2025-26 Topps Chrome Update",
    format: "Mega Box",
    defaultPrice: 160,
    accent: "from-amber-600 to-yellow-400",
    emoji: "📦",
    slots: [
      { name: "Base + Refractors / X-Fractors", odds: "strong", oddsNum: 1, avgValue: 25 },
      { name: "Numbered parallels", odds: "low", oddsNum: 1, avgValue: 20 },
      { name: "Inserts", odds: "several", oddsNum: 1, avgValue: 15 },
      { name: "Auto chance", odds: "low", oddsNum: 0.12, avgValue: 150 },
    ],
    notes: "Often better relative value than Hobby at current secondary prices.",
  },
  {
    id: "bball-chrome-update-value",
    category: "basketball",
    name: "2025-26 Topps Chrome Update",
    format: "Value / Blaster Box",
    defaultPrice: 70,
    accent: "from-yellow-600 to-orange-300",
    emoji: "🎴",
    slots: [
      { name: "Base + Refractors", odds: "solid", oddsNum: 1, avgValue: 12 },
      { name: "Parallels / Inserts", odds: "some", oddsNum: 1, avgValue: 15 },
      { name: "Numbered / Auto chance", odds: "low", oddsNum: 0.05, avgValue: 80 },
    ],
    notes: "Entry-level format. Lower hit rates but much lower cost.",
  },
  {
    id: "bball-prizm-hobby",
    category: "basketball",
    name: "2025-26 Panini Prizm",
    format: "Hobby Box",
    defaultPrice: 1100,
    accent: "from-blue-600 to-indigo-400",
    emoji: "💎",
    slots: [
      { name: "Base + Prizms", odds: "many", oddsNum: 1, avgValue: 70 },
      { name: "Numbered / Silver+", odds: "several", oddsNum: 1, avgValue: 100 },
      { name: "Inserts / Kaboom chance", odds: "variable", oddsNum: 1, avgValue: 60 },
      { name: "Autograph", odds: "1+ per box", oddsNum: 1, avgValue: 200 },
      { name: "Case hit / big parallel", odds: "rare", oddsNum: 0.04, avgValue: 1500 },
    ],
    notes: "Flagship basketball. Very high variance on case hits.",
  },

  // ========== BASEBALL ==========
  {
    id: "base-chrome-hobby",
    category: "baseball",
    name: "2026 Topps Chrome",
    format: "Hobby Box (20 packs)",
    defaultPrice: 320,
    accent: "from-red-600 to-rose-400",
    emoji: "⚾",
    slots: [
      { name: "Base + Refractors", odds: "many", oddsNum: 1, avgValue: 45 },
      { name: "Numbered parallels", odds: "~1-2", oddsNum: 1, avgValue: 55 },
      { name: "Rookie Autograph", odds: "1 per box", oddsNum: 1, avgValue: 110 },
      { name: "Inserts / SPs", odds: "variable", oddsNum: 1, avgValue: 35 },
      { name: "High-end potential", odds: "very low", oddsNum: 0.05, avgValue: 400 },
    ],
    notes: "Classic Chrome. Autos and numbered cards drive most value.",
  },
  {
    id: "base-chrome-mega",
    category: "baseball",
    name: "2026 Topps Chrome",
    format: "Mega Box",
    defaultPrice: 90,
    accent: "from-rose-600 to-red-400",
    emoji: "📦",
    slots: [
      { name: "Base + Refractors", odds: "solid", oddsNum: 1, avgValue: 18 },
      { name: "Parallels / Inserts", odds: "some", oddsNum: 1, avgValue: 20 },
      { name: "Numbered / Auto chance", odds: "low", oddsNum: 0.08, avgValue: 90 },
    ],
    notes: "More accessible Chrome format.",
  },
  {
    id: "base-update-hobby",
    category: "baseball",
    name: "2025 Topps Update",
    format: "Hobby Box",
    defaultPrice: 280,
    accent: "from-sky-600 to-blue-400",
    emoji: "🏟️",
    slots: [
      { name: "Base + inserts", odds: "many", oddsNum: 1, avgValue: 40 },
      { name: "Rookie cards / SP", odds: "several", oddsNum: 1, avgValue: 50 },
      { name: "Autograph", odds: "1 per box", oddsNum: 1, avgValue: 100 },
      { name: "Big hit potential", odds: "low", oddsNum: 0.04, avgValue: 350 },
    ],
    notes: "Update sets often carry key rookies and call-ups.",
  },

  // ========== ONE PIECE ==========
  {
    id: "op-16-pack",
    category: "onepiece",
    name: "OP-16 The Time of Battle",
    format: "Booster Pack",
    defaultPrice: 5.5,
    accent: "from-cyan-600 to-blue-400",
    emoji: "🏴‍☠️",
    slots: [
      { name: "Common / Uncommon", odds: "~60%", oddsNum: 0.6, avgValue: 0.2 },
      { name: "Rare", odds: "1:4", oddsNum: 0.25, avgValue: 1.5 },
      { name: "Super Rare / Leader", odds: "1:12", oddsNum: 0.083, avgValue: 8 },
      { name: "Secret / Alt Art", odds: "1:40", oddsNum: 0.025, avgValue: 35 },
      { name: "Manga Rare / Chase", odds: "1:200+", oddsNum: 0.005, avgValue: 160 },
    ],
    notes: "Competitive set. Manga rares move the needle hard.",
  },
  {
    id: "op-16-box",
    category: "onepiece",
    name: "OP-16 The Time of Battle",
    format: "Booster Box (24 packs)",
    defaultPrice: 115,
    accent: "from-blue-700 to-cyan-500",
    emoji: "🗃️",
    slots: [
      { name: "Bulk + Rares", odds: "guaranteed", oddsNum: 1, avgValue: 20 },
      { name: "SRs / Leaders expected", odds: "several", oddsNum: 1, avgValue: 35 },
      { name: "Secrets / Alts expected", odds: "~0.6", oddsNum: 0.6, avgValue: 35 },
      { name: "Manga Rare chance", odds: "~1:8 boxes", oddsNum: 0.12, avgValue: 160 },
    ],
    notes: "Box EV more stable than single packs.",
  },
  {
    id: "op-09-pack",
    category: "onepiece",
    name: "OP-09 Emperors in the New World",
    format: "Booster Pack",
    defaultPrice: 7,
    accent: "from-indigo-600 to-purple-400",
    emoji: "👑",
    slots: [
      { name: "Common / Uncommon", odds: "~60%", oddsNum: 0.6, avgValue: 0.25 },
      { name: "Rare", odds: "1:4", oddsNum: 0.25, avgValue: 1.8 },
      { name: "Super Rare / Leader", odds: "1:12", oddsNum: 0.083, avgValue: 10 },
      { name: "Secret / Alt", odds: "1:35", oddsNum: 0.029, avgValue: 45 },
      { name: "Manga / SP chase", odds: "1:180", oddsNum: 0.0055, avgValue: 200 },
    ],
    notes: "Popular earlier set still seeing demand.",
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
