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
  image?: string;
  tag?: "hot" | "value" | "chase";
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
    tag: "chase",
    image: "https://archives.bulbagarden.net/media/upload/1/1b/Ascended_Heroes_Booster.png",
    slots: [
      { name: "Bulk (Commons + Uncommons)", odds: "~100%", oddsNum: 1.0, avgValue: 0.8 },
      { name: "Double Rare (RR)", odds: "1:5", oddsNum: 0.20, avgValue: 1.5 },
      { name: "Illustration Rare (IR)", odds: "1:9", oddsNum: 0.111, avgValue: 12.5 },
      { name: "Ultra Rare (UR)", odds: "1:21", oddsNum: 0.048, avgValue: 2.6 },
      { name: "Mega Attack Rare (MAR)", odds: "1:29", oddsNum: 0.034, avgValue: 25 },
      { name: "Special Illustration Rare (SIR)", odds: "1:70", oddsNum: 0.0143, avgValue: 275 },
      { name: "Mega Hyper Rare (MHR)", odds: "1:540", oddsNum: 0.00185, avgValue: 480 },
    ],
    notes: "Chase set. SIR + MHR carry most EV. Packs often trade above MSRP — adjust price to current listings.",
  },
  {
    id: "poke-ascended-etb",
    category: "pokemon",
    name: "Ascended Heroes",
    format: "Elite Trainer Box (9 packs)",
    defaultPrice: 175,
    accent: "from-violet-700 to-purple-500",
    emoji: "📦",
    tag: "chase",
    slots: [
      { name: "Bulk value across 9 packs", odds: "guaranteed", oddsNum: 1, avgValue: 7 },
      { name: "Double Rares + IRs (expected)", odds: "several", oddsNum: 1, avgValue: 28 },
      { name: "Ultra / Mega Attack Rares", odds: "expected", oddsNum: 1, avgValue: 18 },
      { name: "SIR chance (across box)", odds: "~1:8 boxes", oddsNum: 0.13, avgValue: 275 },
      { name: "MHR chance", odds: "very low", oddsNum: 0.017, avgValue: 480 },
    ],
    notes: "ETB approximation. High variance. Promo/accessories not fully valued.",
  },
  {
    id: "poke-ascended-bb",
    category: "pokemon",
    name: "Ascended Heroes",
    format: "Booster Box (36 packs)",
    defaultPrice: 480,
    accent: "from-fuchsia-700 to-violet-600",
    emoji: "🗃️",
    tag: "chase",
    slots: [
      { name: "Bulk across 36 packs", odds: "guaranteed", oddsNum: 1, avgValue: 28 },
      { name: "RRs + IRs expected", odds: "many", oddsNum: 1, avgValue: 95 },
      { name: "URs + MARs expected", odds: "several", oddsNum: 1, avgValue: 55 },
      { name: "SIR expected (~0.5)", odds: "~1:2 boxes", oddsNum: 0.5, avgValue: 275 },
      { name: "MHR chance", odds: "low", oddsNum: 0.07, avgValue: 480 },
    ],
    notes: "Most consistent way to hit SIRs on average. Still often negative at secondary prices.",
  },
  {
    id: "poke-surging-pack",
    category: "pokemon",
    name: "Surging Sparks",
    format: "Booster Pack",
    defaultPrice: 4.25,
    accent: "from-yellow-500 to-orange-400",
    emoji: "⚡",
    tag: "value",
    slots: [
      { name: "Bulk", odds: "~100%", oddsNum: 1, avgValue: 0.45 },
      { name: "Rare / Holo", odds: "1:4", oddsNum: 0.25, avgValue: 1.4 },
      { name: "Double Rare / EX", odds: "1:8", oddsNum: 0.125, avgValue: 5 },
      { name: "Illustration Rare", odds: "1:12", oddsNum: 0.083, avgValue: 14 },
      { name: "SIR / Special", odds: "1:60", oddsNum: 0.017, avgValue: 95 },
    ],
    notes: "One of the better modern value packs when bought near $4–$5.",
  },
  {
    id: "poke-destined-pack",
    category: "pokemon",
    name: "Destined Rivals",
    format: "Booster Pack",
    defaultPrice: 4.5,
    accent: "from-red-600 to-orange-500",
    emoji: "🔥",
    tag: "value",
    slots: [
      { name: "Bulk", odds: "~100%", oddsNum: 1, avgValue: 0.4 },
      { name: "Rare / Holo", odds: "1:4", oddsNum: 0.25, avgValue: 1.3 },
      { name: "EX / Double Rare", odds: "1:7", oddsNum: 0.14, avgValue: 5.5 },
      { name: "Illustration Rare", odds: "1:14", oddsNum: 0.07, avgValue: 15 },
      { name: "SIR / Chase", odds: "1:65", oddsNum: 0.015, avgValue: 110 },
    ],
    notes: "Solid mid-tier modern. Better EV than premium chase sets at these prices.",
  },
  {
    id: "poke-journey-pack",
    category: "pokemon",
    name: "Journey Together",
    format: "Booster Pack",
    defaultPrice: 3.75,
    accent: "from-emerald-500 to-teal-400",
    emoji: "🗺️",
    tag: "value",
    slots: [
      { name: "Bulk", odds: "~100%", oddsNum: 1, avgValue: 0.35 },
      { name: "Rare / Holo", odds: "1:4", oddsNum: 0.25, avgValue: 1.2 },
      { name: "EX / Double Rare", odds: "1:8", oddsNum: 0.125, avgValue: 4.5 },
      { name: "Illustration Rare", odds: "1:15", oddsNum: 0.067, avgValue: 12 },
      { name: "SIR / Special", odds: "1:70", oddsNum: 0.014, avgValue: 85 },
    ],
    notes: "Often one of the stronger EV modern packs when under ~$4.",
  },
  {
    id: "poke-prismatic-pack",
    category: "pokemon",
    name: "Prismatic Evolutions",
    format: "Booster Pack",
    defaultPrice: 15,
    accent: "from-pink-500 to-rose-400",
    emoji: "✨",
    tag: "chase",
    slots: [
      { name: "Bulk / Commons", odds: "~50%", oddsNum: 0.5, avgValue: 0.3 },
      { name: "Rare / Holo", odds: "1:4", oddsNum: 0.25, avgValue: 2 },
      { name: "Ultra / EX", odds: "1:10", oddsNum: 0.1, avgValue: 8 },
      { name: "Illustration Rare", odds: "1:15", oddsNum: 0.067, avgValue: 22 },
      { name: "Special Illustration Rare", odds: "1:70", oddsNum: 0.014, avgValue: 180 },
      { name: "Master Ball / Big Chase", odds: "1:600+", oddsNum: 0.0017, avgValue: 900 },
    ],
    notes: "Still a major chase set. Usually deep negative EV at secondary prices.",
  },
  {
    id: "poke-obsidian-pack",
    category: "pokemon",
    name: "Obsidian Flames",
    format: "Booster Pack",
    defaultPrice: 3.5,
    accent: "from-orange-700 to-red-500",
    emoji: "🌋",
    tag: "value",
    slots: [
      { name: "Bulk", odds: "~100%", oddsNum: 1, avgValue: 0.3 },
      { name: "Rare / Holo", odds: "1:4", oddsNum: 0.25, avgValue: 1.0 },
      { name: "EX / Double Rare", odds: "1:8", oddsNum: 0.125, avgValue: 4 },
      { name: "Illustration Rare", odds: "1:16", oddsNum: 0.062, avgValue: 10 },
      { name: "SIR / Special", odds: "1:75", oddsNum: 0.013, avgValue: 70 },
    ],
    notes: "Older modern set — often closer to fair EV when packs are cheap.",
  },

  // ========== BASKETBALL ==========
  {
    id: "bball-chrome-update-value",
    category: "basketball",
    name: "2025-26 Topps Chrome Update",
    format: "Value / Blaster Box",
    defaultPrice: 55,
    accent: "from-yellow-600 to-orange-300",
    emoji: "🎴",
    tag: "value",
    slots: [
      { name: "Base + Refractors", odds: "solid", oddsNum: 1, avgValue: 14 },
      { name: "Parallels / Inserts", odds: "some", oddsNum: 1, avgValue: 18 },
      { name: "Numbered / Auto chance", odds: "low", oddsNum: 0.06, avgValue: 90 },
    ],
    notes: "Often better relative EV than Hobby when bought under ~$60.",
  },
  {
    id: "bball-chrome-update-mega",
    category: "basketball",
    name: "2025-26 Topps Chrome Update",
    format: "Mega Box",
    defaultPrice: 130,
    accent: "from-amber-600 to-yellow-400",
    emoji: "📦",
    tag: "value",
    slots: [
      { name: "Base + Refractors / X-Fractors", odds: "strong", oddsNum: 1, avgValue: 28 },
      { name: "Numbered parallels", odds: "low", oddsNum: 1, avgValue: 25 },
      { name: "Inserts", odds: "several", oddsNum: 1, avgValue: 18 },
      { name: "Auto chance", odds: "low", oddsNum: 0.14, avgValue: 160 },
    ],
    notes: "Mega can beat Hobby on EV at the right price.",
  },
  {
    id: "bball-chrome-update-hobby",
    category: "basketball",
    name: "2025-26 Topps Chrome Update",
    format: "Hobby Box (20 packs / 1 auto)",
    defaultPrice: 950,
    accent: "from-orange-600 to-amber-400",
    emoji: "🏀",
    tag: "chase",
    slots: [
      { name: "Base + Refractors (box total)", odds: "many", oddsNum: 1, avgValue: 60 },
      { name: "Numbered parallels (/99+)", odds: "several", oddsNum: 1, avgValue: 80 },
      { name: "Inserts / SSPs", odds: "variable", oddsNum: 1, avgValue: 50 },
      { name: "Autograph (guaranteed)", odds: "1 per box", oddsNum: 1, avgValue: 180 },
      { name: "High-end / Debut Patch potential", odds: "very rare", oddsNum: 0.03, avgValue: 1200 },
    ],
    notes: "Hobby is chase. Extreme variance on top rookies. Often negative at $900+.",
  },
  {
    id: "bball-hoops-blaster",
    category: "basketball",
    name: "2025-26 NBA Hoops",
    format: "Blaster Box",
    defaultPrice: 28,
    accent: "from-red-600 to-orange-500",
    emoji: "🏀",
    tag: "value",
    slots: [
      { name: "Base + inserts", odds: "many", oddsNum: 1, avgValue: 10 },
      { name: "Parallels / rookies", odds: "some", oddsNum: 1, avgValue: 12 },
      { name: "Numbered / auto chance", odds: "low", oddsNum: 0.04, avgValue: 50 },
    ],
    notes: "Cheap entry product. Often closer to fair EV than Chrome hobby.",
  },

  // ========== BASEBALL ==========
  {
    id: "base-chrome-mega",
    category: "baseball",
    name: "2026 Topps Chrome",
    format: "Mega Box",
    defaultPrice: 75,
    accent: "from-rose-600 to-red-400",
    emoji: "📦",
    tag: "value",
    slots: [
      { name: "Base + Refractors", odds: "solid", oddsNum: 1, avgValue: 20 },
      { name: "Parallels / Inserts", odds: "some", oddsNum: 1, avgValue: 22 },
      { name: "Numbered / Auto chance", odds: "low", oddsNum: 0.09, avgValue: 100 },
    ],
    notes: "More accessible Chrome format. Better EV profile than hobby at these prices.",
  },
  {
    id: "base-chrome-hobby",
    category: "baseball",
    name: "2026 Topps Chrome",
    format: "Hobby Box (20 packs)",
    defaultPrice: 280,
    accent: "from-red-600 to-rose-400",
    emoji: "⚾",
    tag: "chase",
    slots: [
      { name: "Base + Refractors", odds: "many", oddsNum: 1, avgValue: 50 },
      { name: "Numbered parallels", odds: "~1-2", oddsNum: 1, avgValue: 60 },
      { name: "Rookie Autograph", odds: "1 per box", oddsNum: 1, avgValue: 120 },
      { name: "Inserts / SPs", odds: "variable", oddsNum: 1, avgValue: 40 },
      { name: "High-end potential", odds: "very low", oddsNum: 0.05, avgValue: 400 },
    ],
    notes: "Classic Chrome. Autos drive value. Often near break-even in softer markets.",
  },
  {
    id: "base-update-hobby",
    category: "baseball",
    name: "2025 Topps Update",
    format: "Hobby Box",
    defaultPrice: 240,
    accent: "from-sky-600 to-blue-400",
    emoji: "🏟️",
    tag: "value",
    slots: [
      { name: "Base + inserts", odds: "many", oddsNum: 1, avgValue: 45 },
      { name: "Rookie cards / SP", odds: "several", oddsNum: 1, avgValue: 55 },
      { name: "Autograph", odds: "1 per box", oddsNum: 1, avgValue: 110 },
      { name: "Big hit potential", odds: "low", oddsNum: 0.05, avgValue: 350 },
    ],
    notes: "Update sets can carry key rookies. Better EV when priced under ~$250.",
  },
  {
    id: "base-series1-blaster",
    category: "baseball",
    name: "2026 Topps Series 1",
    format: "Blaster Box",
    defaultPrice: 25,
    accent: "from-blue-600 to-sky-400",
    emoji: "⚾",
    tag: "value",
    slots: [
      { name: "Base + inserts", odds: "many", oddsNum: 1, avgValue: 9 },
      { name: "Parallels / rookies", odds: "some", oddsNum: 1, avgValue: 11 },
      { name: "Numbered / auto chance", odds: "low", oddsNum: 0.03, avgValue: 40 },
    ],
    notes: "Cheap fun product. Often one of the least negative EV formats.",
  },

  // ========== ONE PIECE ==========
  {
    id: "op-16-pack",
    category: "onepiece",
    name: "OP-16 The Time of Battle",
    format: "Booster Pack",
    defaultPrice: 4.5,
    accent: "from-cyan-600 to-blue-400",
    emoji: "🏴‍☠️",
    tag: "value",
    slots: [
      { name: "Common / Uncommon", odds: "~60%", oddsNum: 0.6, avgValue: 0.25 },
      { name: "Rare", odds: "1:4", oddsNum: 0.25, avgValue: 1.8 },
      { name: "Super Rare / Leader", odds: "1:12", oddsNum: 0.083, avgValue: 9 },
      { name: "Secret / Alt Art", odds: "1:40", oddsNum: 0.025, avgValue: 40 },
      { name: "Manga Rare / Chase", odds: "1:200+", oddsNum: 0.005, avgValue: 180 },
    ],
    notes: "Competitive set. Better EV when packs are under ~$5.",
  },
  {
    id: "op-16-box",
    category: "onepiece",
    name: "OP-16 The Time of Battle",
    format: "Booster Box (24 packs)",
    defaultPrice: 95,
    accent: "from-blue-700 to-cyan-500",
    emoji: "🗃️",
    tag: "value",
    slots: [
      { name: "Bulk + Rares", odds: "guaranteed", oddsNum: 1, avgValue: 22 },
      { name: "SRs / Leaders expected", odds: "several", oddsNum: 1, avgValue: 40 },
      { name: "Secrets / Alts expected", odds: "~0.6", oddsNum: 0.6, avgValue: 40 },
      { name: "Manga Rare chance", odds: "~1:8 boxes", oddsNum: 0.12, avgValue: 180 },
    ],
    notes: "Box EV more stable than singles. Often one of the better OP formats.",
  },
  {
    id: "op-09-pack",
    category: "onepiece",
    name: "OP-09 Emperors in the New World",
    format: "Booster Pack",
    defaultPrice: 5.5,
    accent: "from-indigo-600 to-purple-400",
    emoji: "👑",
    tag: "chase",
    slots: [
      { name: "Common / Uncommon", odds: "~60%", oddsNum: 0.6, avgValue: 0.25 },
      { name: "Rare", odds: "1:4", oddsNum: 0.25, avgValue: 1.8 },
      { name: "Super Rare / Leader", odds: "1:12", oddsNum: 0.083, avgValue: 10 },
      { name: "Secret / Alt", odds: "1:35", oddsNum: 0.029, avgValue: 45 },
      { name: "Manga / SP chase", odds: "1:180", oddsNum: 0.0055, avgValue: 200 },
    ],
    notes: "Popular earlier set. Still demand-driven pricing.",
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
