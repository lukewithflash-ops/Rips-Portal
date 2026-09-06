/**
 * Illustrative card pools for the free /open simulator.
 * When a slot hits, we pick a named card (art + est $) so reveals feel like
 * a card hit the table — not a spreadsheet tier label.
 *
 * Pool estValues are weighted to average near each slot's catalog avgValue
 * so long-run EV stays honest (still oddsNum × slot avg).
 * Names/art are public/example pools — not a guarantee of that exact pull.
 */

import type { Category, Product, RaritySlot } from "@/lib/products";

export interface PoolCard {
  name: string;
  /** Small thumb URL (CDN or /public/cards/…). */
  imageUrl?: string;
  estValue: number;
  /** Relative pick weight within the slot (default 1). */
  weight?: number;
}

/** productId → slotIndex → cards */
export type ProductPools = Record<number, PoolCard[]>;

const S = (id: string) => `https://images.scrydex.com/pokemon/${id}/small`;
const SPORTS = "/cards/placeholder-sports.svg";
const BBALL = "/cards/placeholder-bball.svg";
const OP = "/cards/placeholder-op.svg";
const POKE = "/cards/placeholder-poke.svg";

/** Ascended Heroes booster — rich pools (flagship). */
const ascendedPack: ProductPools = {
  // Bulk ~$1.87
  0: [
    { name: "Erika's Oddish", imageUrl: S("me2pt5-1"), estValue: 0.15, weight: 8 },
    { name: "Dratini", imageUrl: S("me2pt5-150"), estValue: 0.25, weight: 6 },
    { name: "Assorted Commons Pack", imageUrl: S("me2pt5-50"), estValue: 0.4, weight: 5 },
    { name: "Uncommon Trainer Mix", imageUrl: S("me2pt5-100"), estValue: 0.8, weight: 4 },
    { name: "Reverse Holo Common", imageUrl: S("me2pt5-180"), estValue: 1.5, weight: 3 },
    { name: "Holo Energy / Promo filler", imageUrl: S("me2pt5-200"), estValue: 3.5, weight: 2 },
    { name: "Popular Uncommon chase-adjacent", imageUrl: POKE, estValue: 6.5, weight: 1 },
  ],
  // Double Rare (RR) ~$1.30
  1: [
    { name: "Double Rare — Midline EX", imageUrl: S("me2pt5-150"), estValue: 0.6, weight: 5 },
    { name: "Double Rare — Playable EX", imageUrl: S("me2pt5-180"), estValue: 1.1, weight: 4 },
    { name: "Double Rare — Splashy Art", imageUrl: S("me2pt5-200"), estValue: 1.8, weight: 3 },
    { name: "Double Rare — Hot Name", imageUrl: S("me2pt5-220"), estValue: 2.8, weight: 1 },
  ],
  // Illustration Rare (IR) ~$8.43
  2: [
    { name: "Psyduck — Illustration Rare", imageUrl: S("me2pt5-226"), estValue: 70, weight: 1 },
    { name: "Scenic IR — Mid Set", imageUrl: S("me2pt5-230"), estValue: 12, weight: 4 },
    { name: "Cute IR — Trainer Scene", imageUrl: S("me2pt5-240"), estValue: 8, weight: 5 },
    { name: "Standard Illustration Rare", imageUrl: S("me2pt5-220"), estValue: 5, weight: 6 },
    { name: "Budget Illustration Rare", imageUrl: S("me2pt5-200"), estValue: 3, weight: 4 },
  ],
  // Ultra Rare (UR) ~$1.90
  3: [
    { name: "Ultra Rare — Full Art Trainer", imageUrl: S("me2pt5-250"), estValue: 1.2, weight: 4 },
    { name: "Ultra Rare — EX Full Art", imageUrl: S("me2pt5-260"), estValue: 1.8, weight: 4 },
    { name: "Ultra Rare — Splash Art", imageUrl: S("me2pt5-270"), estValue: 2.5, weight: 3 },
    { name: "Ultra Rare — Hot Character", imageUrl: S("me2pt5-200"), estValue: 4.0, weight: 1 },
  ],
  // Mega Attack Rare (MAR) ~$17.46
  4: [
    { name: "Mega Attack Rare — Mid Tier", imageUrl: S("me2pt5-250"), estValue: 10, weight: 5 },
    { name: "Mega Attack Rare — Strong Art", imageUrl: S("me2pt5-260"), estValue: 16, weight: 4 },
    { name: "Mega Attack Rare — Chase-adjacent", imageUrl: S("me2pt5-270"), estValue: 28, weight: 2 },
    { name: "Mega Feraligatr ex — MAR/SIR bridge", imageUrl: S("me2pt5-274"), estValue: 40, weight: 1 },
  ],
  // Special Illustration Rare (SIR) ~$201.77
  5: [
    { name: "Mega Gengar ex SIR", imageUrl: S("me2pt5-284"), estValue: 1120, weight: 1 },
    { name: "Pikachu ex SIR (276)", imageUrl: S("me2pt5-276"), estValue: 1100, weight: 1 },
    { name: "Mega Dragonite ex SIR", imageUrl: S("me2pt5-290"), estValue: 710, weight: 2 },
    { name: "Pikachu ex SIR (277)", imageUrl: S("me2pt5-277"), estValue: 380, weight: 4 },
    { name: "Team Rocket's Mewtwo ex SIR", imageUrl: S("me2pt5-281"), estValue: 380, weight: 4 },
    { name: "Lillie's Clefairy ex SIR", imageUrl: S("me2pt5-280"), estValue: 170, weight: 7 },
    { name: "N's Zoroark ex SIR", imageUrl: S("me2pt5-286"), estValue: 165, weight: 7 },
    { name: "Mega Feraligatr ex SIR", imageUrl: S("me2pt5-274"), estValue: 155, weight: 7 },
    { name: "Mid-tier SIR — Set Favorite", imageUrl: S("me2pt5-270"), estValue: 90, weight: 10 },
    { name: "Budget SIR — Floor Art", imageUrl: S("me2pt5-260"), estValue: 55, weight: 8 },
  ],
  // Mega Hyper Rare (MHR) ~$305.71
  6: [
    { name: "Mega Charizard Y ex — Mega Hyper Rare", imageUrl: S("me2pt5-294"), estValue: 420, weight: 3 },
    { name: "Gold Hyper Rare — Energy / Item", imageUrl: S("me2pt5-290"), estValue: 180, weight: 2 },
    { name: "Gold Hyper Rare — Trainer", imageUrl: S("me2pt5-280"), estValue: 250, weight: 2 },
  ],
};

/** Share Ascended chase pools for ETB/bundle with coarser slots. */
const ascendedEtb: ProductPools = {
  0: [
    { name: "Bulk value across packs — Commons mix", imageUrl: S("me2pt5-1"), estValue: 4, weight: 3 },
    { name: "Bulk value — Reverse holos & uncommons", imageUrl: S("me2pt5-50"), estValue: 7, weight: 3 },
    { name: "Bulk value — Better filler stack", imageUrl: S("me2pt5-100"), estValue: 10, weight: 2 },
  ],
  1: [
    { name: "Double Rare stack + Psyduck IR", imageUrl: S("me2pt5-226"), estValue: 35, weight: 2 },
    { name: "RR + Illustration Rare haul", imageUrl: S("me2pt5-230"), estValue: 28, weight: 3 },
    { name: "Expected RR/IR mix", imageUrl: S("me2pt5-220"), estValue: 22, weight: 3 },
  ],
  2: [
    { name: "Ultra / Mega Attack Rare hits", imageUrl: S("me2pt5-260"), estValue: 18, weight: 3 },
    { name: "MAR highlight from the box", imageUrl: S("me2pt5-274"), estValue: 24, weight: 2 },
    { name: "UR/MAR expected value", imageUrl: S("me2pt5-250"), estValue: 14, weight: 3 },
  ],
  3: [
    { name: "Mega Gengar ex SIR", imageUrl: S("me2pt5-284"), estValue: 1120, weight: 1 },
    { name: "Pikachu ex SIR", imageUrl: S("me2pt5-276"), estValue: 1100, weight: 1 },
    { name: "Mega Dragonite ex SIR", imageUrl: S("me2pt5-290"), estValue: 710, weight: 2 },
    { name: "Lillie's Clefairy ex SIR", imageUrl: S("me2pt5-280"), estValue: 170, weight: 5 },
    { name: "N's Zoroark ex SIR", imageUrl: S("me2pt5-286"), estValue: 165, weight: 5 },
    { name: "Budget SIR from the box", imageUrl: S("me2pt5-270"), estValue: 70, weight: 6 },
  ],
  4: [
    { name: "Mega Charizard Y ex — Mega Hyper Rare", imageUrl: S("me2pt5-294"), estValue: 420, weight: 3 },
    { name: "Gold Mega Hyper Rare", imageUrl: S("me2pt5-290"), estValue: 220, weight: 2 },
  ],
};

const ascendedBundle: ProductPools = {
  0: [
    { name: "Bulk across 6 packs", imageUrl: S("me2pt5-1"), estValue: 3.5, weight: 3 },
    { name: "Reverse holo stack", imageUrl: S("me2pt5-50"), estValue: 4.8, weight: 3 },
    { name: "Better bulk stack", imageUrl: S("me2pt5-100"), estValue: 6.5, weight: 2 },
  ],
  1: [
    { name: "RRs + Psyduck IR", imageUrl: S("me2pt5-226"), estValue: 28, weight: 2 },
    { name: "RR + IR expected", imageUrl: S("me2pt5-230"), estValue: 18, weight: 4 },
    { name: "Illustration Rare highlight", imageUrl: S("me2pt5-220"), estValue: 14, weight: 3 },
  ],
  2: [
    { name: "UR + MAR expected", imageUrl: S("me2pt5-260"), estValue: 12, weight: 3 },
    { name: "Mega Attack Rare hit", imageUrl: S("me2pt5-274"), estValue: 18, weight: 2 },
    { name: "Ultra Rare stack", imageUrl: S("me2pt5-250"), estValue: 8, weight: 3 },
  ],
  3: [
    { name: "Mega Gengar ex SIR", imageUrl: S("me2pt5-284"), estValue: 1120, weight: 1 },
    { name: "Pikachu ex SIR", imageUrl: S("me2pt5-276"), estValue: 1100, weight: 1 },
    { name: "Team Rocket's Mewtwo ex SIR", imageUrl: S("me2pt5-281"), estValue: 380, weight: 3 },
    { name: "Lillie's Clefairy ex SIR", imageUrl: S("me2pt5-280"), estValue: 170, weight: 5 },
    { name: "Budget SIR", imageUrl: S("me2pt5-270"), estValue: 70, weight: 6 },
  ],
  4: [
    { name: "Mega Charizard Y ex — Mega Hyper Rare", imageUrl: S("me2pt5-294"), estValue: 420, weight: 3 },
    { name: "Gold Hyper Rare", imageUrl: S("me2pt5-280"), estValue: 200, weight: 2 },
  ],
};

const prismaticPack: ProductPools = {
  0: [
    { name: "Prismatic Common — Eeveelution line", imageUrl: S("sv8pt5-28"), estValue: 0.15, weight: 5 },
    { name: "Prismatic Uncommon mix", imageUrl: S("sv8pt5-75"), estValue: 0.3, weight: 4 },
    { name: "Bulk Commons stack", imageUrl: S("sv8pt5-100"), estValue: 0.45, weight: 3 },
  ],
  1: [
    { name: "Rare Holo — Mid set", imageUrl: S("sv8pt5-75"), estValue: 1.2, weight: 4 },
    { name: "Rare Holo — Popular", imageUrl: S("sv8pt5-100"), estValue: 2.2, weight: 3 },
    { name: "Reverse Holo Rare", imageUrl: S("sv8pt5-28"), estValue: 3.0, weight: 2 },
  ],
  2: [
    { name: "Ultra / EX — Playable", imageUrl: S("sv8pt5-100"), estValue: 5, weight: 4 },
    { name: "Ultra / EX — Splash art", imageUrl: S("sv8pt5-144"), estValue: 9, weight: 3 },
    { name: "EX chase-adjacent", imageUrl: S("sv8pt5-161"), estValue: 14, weight: 1 },
  ],
  3: [
    { name: "Illustration Rare — Eeveelution scene", imageUrl: S("sv8pt5-144"), estValue: 35, weight: 2 },
    { name: "Illustration Rare — Mid", imageUrl: S("sv8pt5-100"), estValue: 18, weight: 4 },
    { name: "Budget Illustration Rare", imageUrl: S("sv8pt5-75"), estValue: 12, weight: 4 },
  ],
  4: [
    { name: "Special Illustration Rare — Top chase", imageUrl: S("sv8pt5-161"), estValue: 450, weight: 1 },
    { name: "Special Illustration Rare — Strong", imageUrl: S("sv8pt5-144"), estValue: 220, weight: 3 },
    { name: "Special Illustration Rare — Mid", imageUrl: S("sv8pt5-100"), estValue: 120, weight: 5 },
    { name: "Budget SIR", imageUrl: S("sv8pt5-75"), estValue: 70, weight: 4 },
  ],
  5: [
    { name: "Master Ball / Big Chase — God pack adjacent", imageUrl: S("sv8pt5-161"), estValue: 1400, weight: 1 },
    { name: "Master Ball pattern chase", imageUrl: S("sv8pt5-144"), estValue: 700, weight: 2 },
    { name: "Big Prismatic chase hit", imageUrl: S("sv8pt5-100"), estValue: 500, weight: 2 },
  ],
};

const surgingPack: ProductPools = {
  0: [
    { name: "Surging Sparks Common", imageUrl: S("sv8-180"), estValue: 0.2, weight: 5 },
    { name: "Surging Sparks Uncommon", imageUrl: S("sv8-220"), estValue: 0.45, weight: 4 },
    { name: "Bulk reverse holo", imageUrl: POKE, estValue: 0.8, weight: 2 },
  ],
  1: [
    { name: "Rare / Holo — Mid", imageUrl: S("sv8-180"), estValue: 0.9, weight: 4 },
    { name: "Rare / Holo — Popular", imageUrl: S("sv8-220"), estValue: 1.6, weight: 3 },
    { name: "Reverse Holo Rare", imageUrl: POKE, estValue: 2.2, weight: 2 },
  ],
  2: [
    { name: "Pikachu ex — Double Rare / Hyper", imageUrl: S("sv8-247"), estValue: 12, weight: 1 },
    { name: "Double Rare / EX — Mid", imageUrl: S("sv8-220"), estValue: 4, weight: 4 },
    { name: "Double Rare / EX — Splash", imageUrl: S("sv8-242"), estValue: 6, weight: 3 },
  ],
  3: [
    { name: "Archaludon ex SIR", imageUrl: S("sv8-241"), estValue: 40, weight: 2 },
    { name: "Alolan Exeggutor ex SIR", imageUrl: S("sv8-242"), estValue: 25, weight: 3 },
    { name: "Illustration Rare — Mid", imageUrl: S("sv8-220"), estValue: 10, weight: 4 },
    { name: "Budget IR", imageUrl: S("sv8-180"), estValue: 6, weight: 3 },
  ],
  4: [
    { name: "Pikachu ex — Gold Hyper Rare", imageUrl: S("sv8-247"), estValue: 280, weight: 1 },
    { name: "Special Illustration Rare — Top", imageUrl: S("sv8-246"), estValue: 120, weight: 3 },
    { name: "SIR / Special — Mid", imageUrl: S("sv8-244"), estValue: 70, weight: 4 },
    { name: "Budget SIR", imageUrl: S("sv8-243"), estValue: 45, weight: 3 },
  ],
};

const destinedPack: ProductPools = {
  0: [
    { name: "Destined Rivals Common", imageUrl: S("sv10-182"), estValue: 0.2, weight: 5 },
    { name: "Team Rocket Uncommon mix", imageUrl: POKE, estValue: 0.4, weight: 4 },
    { name: "Bulk reverse holo", imageUrl: S("sv10-182"), estValue: 0.7, weight: 2 },
  ],
  1: [
    { name: "Rare / Holo — Rocket theme", imageUrl: S("sv10-182"), estValue: 1.0, weight: 4 },
    { name: "Rare / Holo — Popular", imageUrl: S("sv10-225"), estValue: 1.5, weight: 3 },
    { name: "Reverse Holo Rare", imageUrl: POKE, estValue: 2.0, weight: 2 },
  ],
  2: [
    { name: "EX / Double Rare — Mid", imageUrl: S("sv10-182"), estValue: 3.5, weight: 4 },
    { name: "EX / Double Rare — Splash", imageUrl: S("sv10-225"), estValue: 6, weight: 3 },
    { name: "Hot EX name", imageUrl: S("sv10-239"), estValue: 10, weight: 1 },
  ],
  3: [
    { name: "Illustration Rare — Rocket scene", imageUrl: S("sv10-225"), estValue: 22, weight: 3 },
    { name: "Illustration Rare — Mid", imageUrl: S("sv10-182"), estValue: 12, weight: 4 },
    { name: "Budget IR", imageUrl: POKE, estValue: 8, weight: 3 },
  ],
  4: [
    { name: "SIR / Chase — Top Team Rocket", imageUrl: S("sv10-239"), estValue: 320, weight: 1 },
    { name: "SIR / Chase — Strong", imageUrl: S("sv10-225"), estValue: 140, weight: 3 },
    { name: "SIR — Mid", imageUrl: S("sv10-182"), estValue: 80, weight: 4 },
    { name: "Budget SIR", imageUrl: POKE, estValue: 50, weight: 3 },
  ],
};

const journeyPack: ProductPools = {
  0: [
    { name: "Journey Together Common", imageUrl: S("sv9-160"), estValue: 0.15, weight: 5 },
    { name: "Journey Uncommon mix", imageUrl: POKE, estValue: 0.35, weight: 4 },
    { name: "Bulk reverse", imageUrl: S("sv9-160"), estValue: 0.6, weight: 2 },
  ],
  1: [
    { name: "Rare / Holo", imageUrl: S("sv9-160"), estValue: 0.9, weight: 4 },
    { name: "Rare / Holo — Popular", imageUrl: S("sv9-185"), estValue: 1.4, weight: 3 },
    { name: "Reverse Holo Rare", imageUrl: POKE, estValue: 1.8, weight: 2 },
  ],
  2: [
    { name: "EX / Double Rare — Mid", imageUrl: S("sv9-160"), estValue: 3, weight: 4 },
    { name: "EX / Double Rare — Splash", imageUrl: S("sv9-185"), estValue: 5, weight: 3 },
    { name: "Hot EX", imageUrl: POKE, estValue: 8, weight: 1 },
  ],
  3: [
    { name: "Illustration Rare — Strong", imageUrl: S("sv9-185"), estValue: 20, weight: 2 },
    { name: "Illustration Rare — Mid", imageUrl: S("sv9-160"), estValue: 10, weight: 4 },
    { name: "Budget IR", imageUrl: POKE, estValue: 6, weight: 3 },
  ],
  4: [
    { name: "SIR / Special — Top", imageUrl: S("sv9-185"), estValue: 220, weight: 1 },
    { name: "SIR / Special — Mid", imageUrl: S("sv9-160"), estValue: 70, weight: 4 },
    { name: "Budget SIR", imageUrl: POKE, estValue: 40, weight: 3 },
  ],
};

/** Generic modern SV-style pack pool reused for older sets with art variants. */
function svStylePack(
  bulkImg: string,
  midImg: string,
  chaseImg: string,
  chaseName: string
): ProductPools {
  return {
    0: [
      { name: "Common / Uncommon mix", imageUrl: bulkImg, estValue: 0.15, weight: 5 },
      { name: "Reverse holo common", imageUrl: midImg, estValue: 0.35, weight: 3 },
      { name: "Better bulk card", imageUrl: POKE, estValue: 0.6, weight: 2 },
    ],
    1: [
      { name: "Rare / Holo", imageUrl: midImg, estValue: 0.8, weight: 4 },
      { name: "Rare / Holo — Popular", imageUrl: chaseImg, estValue: 1.3, weight: 3 },
      { name: "Reverse Holo Rare", imageUrl: bulkImg, estValue: 1.8, weight: 2 },
    ],
    2: [
      { name: "EX / Double Rare — Mid", imageUrl: midImg, estValue: 3, weight: 4 },
      { name: "EX / Double Rare — Splash", imageUrl: chaseImg, estValue: 5, weight: 3 },
      { name: "Hot EX name", imageUrl: POKE, estValue: 8, weight: 1 },
    ],
    3: [
      { name: "Illustration Rare — Strong", imageUrl: chaseImg, estValue: 18, weight: 2 },
      { name: "Illustration Rare — Mid", imageUrl: midImg, estValue: 9, weight: 4 },
      { name: "Budget IR", imageUrl: bulkImg, estValue: 5, weight: 3 },
    ],
    4: [
      { name: chaseName, imageUrl: chaseImg, estValue: 180, weight: 1 },
      { name: "SIR / Special — Mid", imageUrl: midImg, estValue: 55, weight: 4 },
      { name: "Budget SIR", imageUrl: bulkImg, estValue: 35, weight: 3 },
    ],
  };
}

const chaosRising: ProductPools = {
  0: [
    { name: "Chaos Rising Common", imageUrl: S("me4-180"), estValue: 0.2, weight: 5 },
    { name: "Chaos Rising Uncommon", imageUrl: POKE, estValue: 0.45, weight: 4 },
    { name: "Reverse holo mix", imageUrl: S("me4-180"), estValue: 0.8, weight: 2 },
  ],
  1: [
    { name: "Double Rare (DR) — Mid", imageUrl: S("me4-180"), estValue: 2.2, weight: 4 },
    { name: "Double Rare (DR) — Splash", imageUrl: POKE, estValue: 3.5, weight: 3 },
    { name: "Double Rare — Hot", imageUrl: S("me4-180"), estValue: 6, weight: 1 },
  ],
  2: [
    { name: "Ultra Rare — Mid", imageUrl: S("me4-180"), estValue: 4, weight: 4 },
    { name: "Ultra Rare — Full Art", imageUrl: POKE, estValue: 7, weight: 3 },
    { name: "Ultra Rare — Hot", imageUrl: S("me4-180"), estValue: 12, weight: 1 },
  ],
  3: [
    { name: "Illustration Rare — Strong", imageUrl: S("me4-180"), estValue: 18, weight: 2 },
    { name: "Illustration Rare — Mid", imageUrl: POKE, estValue: 9, weight: 4 },
    { name: "Budget IR", imageUrl: S("me4-180"), estValue: 5, weight: 3 },
  ],
  4: [
    { name: "Special Illustration Rare — Top", imageUrl: S("me4-180"), estValue: 220, weight: 1 },
    { name: "SIR — Mid", imageUrl: POKE, estValue: 70, weight: 4 },
    { name: "Budget SIR", imageUrl: S("me4-180"), estValue: 40, weight: 3 },
  ],
  5: [
    { name: "Mega Hyper Rare — Gold chase", imageUrl: S("me4-180"), estValue: 400, weight: 2 },
    { name: "Mega Hyper Rare — Gold item", imageUrl: POKE, estValue: 180, weight: 2 },
  ],
};

const perfectOrder: ProductPools = {
  0: [
    { name: "Perfect Order Common", imageUrl: S("me3-180"), estValue: 0.2, weight: 5 },
    { name: "Perfect Order Uncommon", imageUrl: POKE, estValue: 0.45, weight: 4 },
    { name: "Reverse holo mix", imageUrl: S("me3-180"), estValue: 0.8, weight: 2 },
  ],
  1: [
    { name: "Double Rare — Mid", imageUrl: S("me3-180"), estValue: 2.2, weight: 4 },
    { name: "Double Rare — Splash", imageUrl: POKE, estValue: 3.4, weight: 3 },
    { name: "Double Rare — Hot", imageUrl: S("me3-180"), estValue: 5.5, weight: 1 },
  ],
  2: [
    { name: "Ultra Rare — Mid", imageUrl: S("me3-180"), estValue: 3.5, weight: 4 },
    { name: "Ultra Rare — Full Art", imageUrl: POKE, estValue: 6, weight: 3 },
    { name: "Ultra Rare — Hot", imageUrl: S("me3-180"), estValue: 10, weight: 1 },
  ],
  3: [
    { name: "Illustration Rare — Strong", imageUrl: S("me3-180"), estValue: 16, weight: 2 },
    { name: "Illustration Rare — Mid", imageUrl: POKE, estValue: 8, weight: 4 },
    { name: "Budget IR", imageUrl: S("me3-180"), estValue: 5, weight: 3 },
  ],
  4: [
    { name: "Special Illustration Rare — Top", imageUrl: S("me3-180"), estValue: 200, weight: 1 },
    { name: "SIR — Mid", imageUrl: POKE, estValue: 65, weight: 4 },
    { name: "Budget SIR", imageUrl: S("me3-180"), estValue: 40, weight: 3 },
  ],
  5: [
    { name: "Mega Zygarde — Mega Hyper Rare", imageUrl: S("me3-180"), estValue: 450, weight: 2 },
    { name: "Gold Mega Hyper Rare", imageUrl: POKE, estValue: 200, weight: 2 },
  ],
};

const pitchBlack: ProductPools = {
  0: [
    { name: "Pitch Black Common", imageUrl: S("me5-180"), estValue: 0.2, weight: 5 },
    { name: "Pitch Black Uncommon", imageUrl: POKE, estValue: 0.5, weight: 4 },
    { name: "Reverse holo mix", imageUrl: S("me5-180"), estValue: 0.9, weight: 2 },
  ],
  1: [
    { name: "Double Rare — Mid", imageUrl: S("me5-180"), estValue: 2.5, weight: 4 },
    { name: "Double Rare — Splash", imageUrl: POKE, estValue: 3.8, weight: 3 },
    { name: "Double Rare — Hot", imageUrl: S("me5-180"), estValue: 6.5, weight: 1 },
  ],
  2: [
    { name: "Ultra Rare — Mid", imageUrl: S("me5-180"), estValue: 4.5, weight: 4 },
    { name: "Ultra Rare — Full Art", imageUrl: POKE, estValue: 8, weight: 3 },
    { name: "Ultra Rare — Hot", imageUrl: S("me5-180"), estValue: 14, weight: 1 },
  ],
  3: [
    { name: "Illustration Rare — Strong", imageUrl: S("me5-180"), estValue: 20, weight: 2 },
    { name: "Illustration Rare — Mid", imageUrl: POKE, estValue: 10, weight: 4 },
    { name: "Budget IR", imageUrl: S("me5-180"), estValue: 6, weight: 3 },
  ],
  4: [
    { name: "Special Illustration Rare — Top", imageUrl: S("me5-180"), estValue: 250, weight: 1 },
    { name: "SIR — Mid", imageUrl: POKE, estValue: 80, weight: 4 },
    { name: "Budget SIR", imageUrl: S("me5-180"), estValue: 45, weight: 3 },
  ],
  5: [
    { name: "Mega Darkrai — Mega Hyper Rare", imageUrl: S("me5-180"), estValue: 500, weight: 2 },
    { name: "Gold Mega Hyper Rare", imageUrl: POKE, estValue: 220, weight: 2 },
  ],
};

/** 30th Celebration SKUs — placeholder art, named promos / pack hits. */
function thirtiethPools(promoName: string): ProductPools {
  return {
    0: [
      { name: "30th Celebration pack hits — Commons mix", imageUrl: POKE, estValue: 4, weight: 3 },
      { name: "30th pack hits — Reverse / holo stack", imageUrl: S("me2pt5-1"), estValue: 7, weight: 3 },
      { name: "30th pack hits — Better filler", imageUrl: S("me2pt5-50"), estValue: 12, weight: 2 },
    ],
    1: [
      { name: `${promoName} (promo / accessories)`, imageUrl: POKE, estValue: 12, weight: 3 },
      { name: "30th foil energy / sleeves stack", imageUrl: S("me2pt5-100"), estValue: 10, weight: 3 },
      { name: "Commemorative accessories", imageUrl: POKE, estValue: 8, weight: 2 },
    ],
    2: [
      { name: "30th chase SIR — Classic remix", imageUrl: S("me2pt5-276"), estValue: 180, weight: 2 },
      { name: "30th chase hit — Mid SIR", imageUrl: S("me2pt5-280"), estValue: 90, weight: 4 },
      { name: "30th chase upside — Budget", imageUrl: POKE, estValue: 50, weight: 3 },
    ],
  };
}

const baseChromeHobby: ProductPools = {
  0: [
    { name: "Paul Skenes Chrome Rookie — Base", imageUrl: SPORTS, estValue: 35, weight: 3 },
    { name: "Elly De La Cruz Chrome — Base", imageUrl: SPORTS, estValue: 22, weight: 4 },
    { name: "Jackson Holliday Chrome — Base", imageUrl: SPORTS, estValue: 18, weight: 4 },
    { name: "Base Refractor — Mid rookies stack", imageUrl: SPORTS, estValue: 40, weight: 2 },
  ],
  1: [
    { name: "Paul Skenes Chrome — Refractor", imageUrl: SPORTS, estValue: 85, weight: 3 },
    { name: "Paul Skenes Chrome — Gold /50", imageUrl: SPORTS, estValue: 220, weight: 1 },
    { name: "Elly De La Cruz — Refractor /99", imageUrl: SPORTS, estValue: 55, weight: 3 },
    { name: "Numbered parallel — Mid prospect", imageUrl: SPORTS, estValue: 35, weight: 4 },
  ],
  2: [
    { name: "Paul Skenes Rookie Autograph", imageUrl: SPORTS, estValue: 280, weight: 1 },
    { name: "Top prospect Rookie Auto", imageUrl: SPORTS, estValue: 140, weight: 3 },
    { name: "Mid-tier Rookie Autograph", imageUrl: SPORTS, estValue: 70, weight: 4 },
    { name: "Veteran Auto / lower demand", imageUrl: SPORTS, estValue: 40, weight: 3 },
  ],
  3: [
    { name: "Helix / Insert SSP — Skenes", imageUrl: SPORTS, estValue: 90, weight: 2 },
    { name: "Chrome Insert — Hot rookie", imageUrl: SPORTS, estValue: 45, weight: 3 },
    { name: "SP / short print base", imageUrl: SPORTS, estValue: 25, weight: 4 },
  ],
  4: [
    { name: "Superfractor /1 — Flagship rookie", imageUrl: SPORTS, estValue: 2500, weight: 1 },
    { name: "Red Refractor /5 — Skenes", imageUrl: SPORTS, estValue: 900, weight: 2 },
    { name: "High-end numbered — top RC", imageUrl: SPORTS, estValue: 350, weight: 4 },
    { name: "Case hit adjacent", imageUrl: SPORTS, estValue: 180, weight: 4 },
  ],
};

const baseChromeMega: ProductPools = {
  0: [
    { name: "Paul Skenes Chrome Rookie — Base", imageUrl: SPORTS, estValue: 35, weight: 2 },
    { name: "Chrome Base + Refractors stack", imageUrl: SPORTS, estValue: 18, weight: 4 },
    { name: "Mid rookies Refractor mix", imageUrl: SPORTS, estValue: 12, weight: 4 },
  ],
  1: [
    { name: "Paul Skenes — Refractor", imageUrl: SPORTS, estValue: 85, weight: 2 },
    { name: "Numbered parallel /99", imageUrl: SPORTS, estValue: 40, weight: 3 },
    { name: "Insert / parallel haul", imageUrl: SPORTS, estValue: 18, weight: 4 },
  ],
  2: [
    { name: "Paul Skenes Rookie Auto chance", imageUrl: SPORTS, estValue: 280, weight: 1 },
    { name: "Prospect Rookie Autograph", imageUrl: SPORTS, estValue: 120, weight: 2 },
    { name: "Lower-tier Auto", imageUrl: SPORTS, estValue: 55, weight: 3 },
  ],
};

const baseUpdateHobby: ProductPools = {
  0: [
    { name: "Update base + inserts stack", imageUrl: SPORTS, estValue: 35, weight: 3 },
    { name: "Nick Kurtz Update RC — Base", imageUrl: SPORTS, estValue: 55, weight: 2 },
    { name: "James Wood Update RC — Base", imageUrl: SPORTS, estValue: 40, weight: 3 },
  ],
  1: [
    { name: "Nick Kurtz RC — Refractor", imageUrl: SPORTS, estValue: 120, weight: 2 },
    { name: "James Wood RC — SP", imageUrl: SPORTS, estValue: 70, weight: 3 },
    { name: "Update rookies / SP mix", imageUrl: SPORTS, estValue: 35, weight: 4 },
  ],
  2: [
    { name: "Update Rookie Autograph — Top", imageUrl: SPORTS, estValue: 220, weight: 1 },
    { name: "Update Rookie Autograph — Mid", imageUrl: SPORTS, estValue: 100, weight: 3 },
    { name: "Veteran / lower Auto", imageUrl: SPORTS, estValue: 55, weight: 3 },
  ],
  3: [
    { name: "Nick Kurtz Red Refractor /5", imageUrl: SPORTS, estValue: 1900, weight: 1 },
    { name: "Big hit — low-numbered RC", imageUrl: SPORTS, estValue: 400, weight: 3 },
    { name: "Case-hit adjacent Update", imageUrl: SPORTS, estValue: 180, weight: 4 },
  ],
};

const bballChromeHobby: ProductPools = {
  0: [
    { name: "Chrome Update Base + Refractors", imageUrl: BBALL, estValue: 45, weight: 3 },
    { name: "Top Rookie Chrome — Base", imageUrl: BBALL, estValue: 70, weight: 2 },
    { name: "Mid rookies Refractor stack", imageUrl: BBALL, estValue: 35, weight: 4 },
  ],
  1: [
    { name: "Top Rookie — Refractor /99", imageUrl: BBALL, estValue: 150, weight: 2 },
    { name: "Numbered parallel /149", imageUrl: BBALL, estValue: 80, weight: 3 },
    { name: "Mid numbered parallels", imageUrl: BBALL, estValue: 45, weight: 4 },
  ],
  2: [
    { name: "Insert SSP — Hot rookie", imageUrl: BBALL, estValue: 120, weight: 2 },
    { name: "Chrome Inserts stack", imageUrl: BBALL, estValue: 40, weight: 4 },
    { name: "X-Fractor / parallel insert", imageUrl: BBALL, estValue: 55, weight: 3 },
  ],
  3: [
    { name: "Guaranteed Autograph — Top RC", imageUrl: BBALL, estValue: 350, weight: 1 },
    { name: "Rookie Autograph — Mid", imageUrl: BBALL, estValue: 160, weight: 3 },
    { name: "Lower-demand Auto", imageUrl: BBALL, estValue: 80, weight: 3 },
  ],
  4: [
    { name: "Debut Patch / Superfractor potential", imageUrl: BBALL, estValue: 3500, weight: 1 },
    { name: "Low-numbered RC auto parallel", imageUrl: BBALL, estValue: 900, weight: 2 },
    { name: "High-end numbered hit", imageUrl: BBALL, estValue: 400, weight: 4 },
  ],
};

const bballChromeValue: ProductPools = {
  0: [
    { name: "Chrome Update Base + Refractors", imageUrl: BBALL, estValue: 12, weight: 4 },
    { name: "Top Rookie — Base", imageUrl: BBALL, estValue: 22, weight: 2 },
    { name: "Mid rookies stack", imageUrl: BBALL, estValue: 10, weight: 4 },
  ],
  1: [
    { name: "Parallels / Inserts haul", imageUrl: BBALL, estValue: 15, weight: 4 },
    { name: "Hot rookie Refractor", imageUrl: BBALL, estValue: 35, weight: 2 },
    { name: "X-Fractor / insert", imageUrl: BBALL, estValue: 12, weight: 3 },
  ],
  2: [
    { name: "Numbered / Auto chance — Top RC", imageUrl: BBALL, estValue: 200, weight: 1 },
    { name: "Numbered parallel hit", imageUrl: BBALL, estValue: 80, weight: 2 },
    { name: "Lower auto / numbered", imageUrl: BBALL, estValue: 45, weight: 3 },
  ],
};

const op16Pack: ProductPools = {
  0: [
    { name: "OP-16 Common — Crew member", imageUrl: OP, estValue: 0.15, weight: 5 },
    { name: "OP-16 Uncommon — Event card", imageUrl: OP, estValue: 0.3, weight: 4 },
    { name: "DON!! / filler uncommon", imageUrl: OP, estValue: 0.4, weight: 2 },
  ],
  1: [
    { name: "OP-16 Rare — Mid", imageUrl: OP, estValue: 1.2, weight: 4 },
    { name: "OP-16 Rare — Popular character", imageUrl: OP, estValue: 2.2, weight: 3 },
    { name: "OP-16 Rare — Splash art", imageUrl: OP, estValue: 3.0, weight: 2 },
  ],
  2: [
    { name: "Super Rare — Mid leader support", imageUrl: OP, estValue: 6, weight: 4 },
    { name: "Leader / Super Rare — Hot", imageUrl: OP, estValue: 12, weight: 3 },
    { name: "Super Rare — Chase-adjacent", imageUrl: OP, estValue: 18, weight: 1 },
  ],
  3: [
    { name: "Monkey.D.Luffy (SEC)", imageUrl: OP, estValue: 65, weight: 2 },
    { name: "Secret Rare / Alt Art — Mid", imageUrl: OP, estValue: 35, weight: 4 },
    { name: "Alt Art — Budget SEC", imageUrl: OP, estValue: 22, weight: 3 },
  ],
  4: [
    { name: "Manga Rare — Flagship chase", imageUrl: OP, estValue: 350, weight: 1 },
    { name: "Manga Rare / SP — Mid", imageUrl: OP, estValue: 160, weight: 3 },
    { name: "Chase SP — Budget", imageUrl: OP, estValue: 90, weight: 3 },
  ],
};

const op16Box: ProductPools = {
  0: [
    { name: "Bulk + Rares across box", imageUrl: OP, estValue: 18, weight: 3 },
    { name: "Rares stack — popular names", imageUrl: OP, estValue: 24, weight: 3 },
    { name: "Better bulk + rares", imageUrl: OP, estValue: 28, weight: 2 },
  ],
  1: [
    { name: "SR / Leader expected haul", imageUrl: OP, estValue: 35, weight: 3 },
    { name: "Multiple Super Rares", imageUrl: OP, estValue: 45, weight: 3 },
    { name: "Hot Leader + SRs", imageUrl: OP, estValue: 55, weight: 2 },
  ],
  2: [
    { name: "Monkey.D.Luffy (SEC)", imageUrl: OP, estValue: 65, weight: 2 },
    { name: "Secret / Alt Art", imageUrl: OP, estValue: 35, weight: 4 },
    { name: "Budget SEC", imageUrl: OP, estValue: 22, weight: 3 },
  ],
  3: [
    { name: "Manga Rare — Flagship", imageUrl: OP, estValue: 350, weight: 1 },
    { name: "Manga Rare — Mid", imageUrl: OP, estValue: 160, weight: 3 },
    { name: "SP chase — Budget", imageUrl: OP, estValue: 90, weight: 3 },
  ],
};

const op09Pack: ProductPools = {
  0: [
    { name: "OP-09 Common", imageUrl: OP, estValue: 0.15, weight: 5 },
    { name: "OP-09 Uncommon", imageUrl: OP, estValue: 0.3, weight: 4 },
    { name: "DON!! / filler", imageUrl: OP, estValue: 0.4, weight: 2 },
  ],
  1: [
    { name: "OP-09 Rare — Mid", imageUrl: OP, estValue: 1.2, weight: 4 },
    { name: "OP-09 Rare — Emperor theme", imageUrl: OP, estValue: 2.2, weight: 3 },
    { name: "OP-09 Rare — Splash", imageUrl: OP, estValue: 3.0, weight: 2 },
  ],
  2: [
    { name: "Super Rare / Leader — Mid", imageUrl: OP, estValue: 7, weight: 4 },
    { name: "Leader / SR — Hot Emperor", imageUrl: OP, estValue: 14, weight: 3 },
    { name: "SR chase-adjacent", imageUrl: OP, estValue: 20, weight: 1 },
  ],
  3: [
    { name: "Secret / Alt — Top", imageUrl: OP, estValue: 80, weight: 2 },
    { name: "Secret / Alt — Mid", imageUrl: OP, estValue: 40, weight: 4 },
    { name: "Budget SEC", imageUrl: OP, estValue: 25, weight: 3 },
  ],
  4: [
    { name: "Manga / SP chase — Flagship", imageUrl: OP, estValue: 400, weight: 1 },
    { name: "Manga / SP — Mid", imageUrl: OP, estValue: 180, weight: 3 },
    { name: "SP chase — Budget", imageUrl: OP, estValue: 100, weight: 3 },
  ],
};

const blasterSports = (names: [string, string, string]): ProductPools => ({
  0: [
    { name: `${names[0]} — Base`, imageUrl: SPORTS, estValue: 8, weight: 3 },
    { name: `${names[1]} — Base / inserts`, imageUrl: SPORTS, estValue: 6, weight: 4 },
    { name: "Base + inserts stack", imageUrl: SPORTS, estValue: 5, weight: 4 },
  ],
  1: [
    { name: `${names[0]} — Parallel / Refractor`, imageUrl: SPORTS, estValue: 25, weight: 2 },
    { name: `${names[2]} — Rookie parallel`, imageUrl: SPORTS, estValue: 14, weight: 3 },
    { name: "Parallels / rookies mix", imageUrl: SPORTS, estValue: 8, weight: 4 },
  ],
  2: [
    { name: `${names[0]} — Numbered / Auto chance`, imageUrl: SPORTS, estValue: 90, weight: 1 },
    { name: "Numbered parallel hit", imageUrl: SPORTS, estValue: 40, weight: 2 },
    { name: "Lower auto / relic", imageUrl: SPORTS, estValue: 25, weight: 3 },
  ],
});

const blasterBball = (names: [string, string, string]): ProductPools => ({
  0: [
    { name: `${names[0]} — Base`, imageUrl: BBALL, estValue: 10, weight: 3 },
    { name: `${names[1]} — Base / inserts`, imageUrl: BBALL, estValue: 7, weight: 4 },
    { name: "Base + inserts stack", imageUrl: BBALL, estValue: 6, weight: 4 },
  ],
  1: [
    { name: `${names[0]} — Parallel`, imageUrl: BBALL, estValue: 28, weight: 2 },
    { name: `${names[2]} — Rookie parallel`, imageUrl: BBALL, estValue: 16, weight: 3 },
    { name: "Parallels / courtside mix", imageUrl: BBALL, estValue: 10, weight: 4 },
  ],
  2: [
    { name: `${names[0]} — Numbered / Auto chance`, imageUrl: BBALL, estValue: 110, weight: 1 },
    { name: "Numbered parallel hit", imageUrl: BBALL, estValue: 50, weight: 2 },
    { name: "Lower auto chance", imageUrl: BBALL, estValue: 30, weight: 3 },
  ],
});

export const cardPoolsByProduct: Record<string, ProductPools> = {
  "poke-ascended-pack": ascendedPack,
  "poke-ascended-etb": ascendedEtb,
  "poke-ascended-bundle": ascendedBundle,
  "poke-prismatic-pack": prismaticPack,
  "poke-surging-pack": surgingPack,
  "poke-destined-pack": destinedPack,
  "poke-journey-pack": journeyPack,
  "poke-obsidian-pack": svStylePack(S("sv3-223"), S("sv3-230"), S("sv3-230"), "Charizard ex SIR — Obsidian"),
  "poke-temporal-pack": svStylePack(POKE, POKE, POKE, "ACE SPEC / SIR — Temporal"),
  "poke-paradox-pack": svStylePack(POKE, POKE, POKE, "SIR / Special — Paradox"),
  "poke-paldea-pack": svStylePack(POKE, POKE, POKE, "SIR / Special — Paldea"),
  "poke-surging-bb": {
    0: surgingPack[0]!,
    1: [
      ...(surgingPack[1] ?? []),
      ...(surgingPack[2] ?? []),
    ],
    2: surgingPack[3]!,
    3: surgingPack[4]!,
  },
  "poke-chaos-rising-pack": chaosRising,
  "poke-perfect-order-pack": perfectOrder,
  "poke-pitch-black-pack": pitchBlack,
  "poke-30th-etb": thirtiethPools("Full-art Nidorina promo"),
  "poke-30th-pc-etb": thirtiethPools("Nidorina promo (PC stamp)"),
  "poke-30th-bundle": thirtiethPools("30th Celebration pack art"),
  "poke-30th-poster": thirtiethPools("Articuno / Zapdos / Moltres promos"),
  "poke-30th-tech-sticker-exeggutor": thirtiethPools("Alolan Exeggutor foil promo"),
  "poke-30th-tech-sticker-lucario": thirtiethPools("Lucario foil promo"),
  "poke-30th-ex-box-sylveon": thirtiethPools("Sylveon ex promo"),
  "poke-30th-ex-box-greninja": thirtiethPools("Greninja ex promo"),
  "poke-30th-knockout": thirtiethPools("Eevee foil promo"),
  "poke-30th-binder": thirtiethPools("30th portfolio + packs"),
  "poke-30th-mini-tin": thirtiethPools("Day & Night Pikachu art"),
  "poke-30th-upc-day": thirtiethPools("Pikachu ex (day) + Espeon ex"),
  "poke-30th-upc-night": thirtiethPools("Pikachu ex (night) + Umbreon ex"),
  "base-chrome-hobby": baseChromeHobby,
  "base-chrome-mega": baseChromeMega,
  "base-update-hobby": baseUpdateHobby,
  "base-series1-blaster": blasterSports([
    "Elly De La Cruz",
    "Paul Skenes",
    "Jackson Holliday",
  ]),
  "base-heritage-blaster": blasterSports([
    "Paul Skenes Heritage",
    "Elly De La Cruz Heritage",
    "Top prospect Heritage",
  ]),
  "bball-chrome-update-hobby": bballChromeHobby,
  "bball-chrome-update-value": bballChromeValue,
  "bball-chrome-update-mega": {
    0: bballChromeValue[0]!,
    1: [
      { name: "Numbered parallels stack", imageUrl: BBALL, estValue: 25, weight: 3 },
      { name: "Top Rookie numbered", imageUrl: BBALL, estValue: 55, weight: 2 },
      { name: "Mid numbered haul", imageUrl: BBALL, estValue: 18, weight: 3 },
    ],
    2: bballChromeValue[1]!,
    3: bballChromeValue[2]!,
  },
  "bball-hoops-blaster": blasterBball([
    "Top Rookie Hoops",
    "Star vet Hoops",
    "Hot RC Hoops",
  ]),
  "bball-select-blaster": blasterBball([
    "Select Courtside RC",
    "Select Concourse star",
    "Select Premier Level RC",
  ]),
  "op-16-pack": op16Pack,
  "op-16-box": op16Box,
  "op-09-pack": op09Pack,
};

export function poolWeightedAverage(cards: PoolCard[]): number {
  const tw = cards.reduce((s, c) => s + (c.weight ?? 1), 0);
  if (tw <= 0) return 0;
  return cards.reduce((s, c) => s + c.estValue * (c.weight ?? 1), 0) / tw;
}

export function pickWeightedCard(
  cards: PoolCard[],
  rng: () => number = Math.random
): PoolCard {
  const tw = cards.reduce((s, c) => s + Math.max(0, c.weight ?? 1), 0);
  if (tw <= 0) return cards[0]!;
  let r = rng() * tw;
  for (const c of cards) {
    r -= Math.max(0, c.weight ?? 1);
    if (r <= 0) return c;
  }
  return cards[cards.length - 1]!;
}

/** Hero label when a slot has no curated pool yet. */
export function synthesizeDisplayCard(
  product: Product,
  slot: RaritySlot,
  slotIndex: number
): PoolCard {
  const slotName = slot.name.trim();
  const bulkish =
    /bulk|common|uncommon|filler|commons/i.test(slotName) &&
    !/rare|sir|ir\b|ex\b|auto|chase|secret|manga/i.test(slotName);

  const placeholder =
    product.category === "baseball"
      ? SPORTS
      : product.category === "basketball"
        ? BBALL
        : product.category === "onepiece"
          ? OP
          : POKE;

  if (bulkish) {
    const names: Record<Category, string[]> = {
      pokemon: [
        `${product.name} — Assorted Commons`,
        `${product.name} — Uncommon mix`,
        `${product.name} — Reverse holo filler`,
      ],
      baseball: [
        `${product.name} — Base rookies mix`,
        `${product.name} — Base + inserts filler`,
        `${product.name} — Common parallels stack`,
      ],
      basketball: [
        `${product.name} — Base + inserts`,
        `${product.name} — Rookie base mix`,
        `${product.name} — Common parallels`,
      ],
      onepiece: [
        `${product.name} — Commons / DON!! mix`,
        `${product.name} — Uncommon event cards`,
        `${product.name} — Filler rares-adjacent`,
      ],
    };
    const list = names[product.category];
    const name = list[slotIndex % list.length]!;
    return {
      name,
      imageUrl: placeholder,
      estValue: slot.avgValue,
      weight: 1,
    };
  }

  // Prefer a card-like label: product + cleaned tier
  const cleaned = slotName
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return {
    name: `${cleaned} — ${product.name}`,
    imageUrl: placeholder,
    estValue: slot.avgValue,
    weight: 1,
  };
}

/** Scale pool estValues so weighted average matches slot.avgValue (EV honesty). */
export function scalePoolToSlotAvg(cards: PoolCard[], target: number): PoolCard[] {
  if (cards.length === 0) return cards;
  const avg = poolWeightedAverage(cards);
  if (avg <= 0 || target <= 0) {
    return cards.map((c) => ({ ...c, estValue: target }));
  }
  const factor = target / avg;
  return cards.map((c) => ({
    ...c,
    estValue: Math.round(c.estValue * factor * 100) / 100,
  }));
}

export function resolveSlotCard(
  product: Product,
  slotIndex: number,
  slot: RaritySlot,
  rng: () => number = Math.random
): PoolCard {
  const pool = cardPoolsByProduct[product.id]?.[slotIndex];
  if (pool && pool.length > 0) {
    const scaled = scalePoolToSlotAvg(pool, slot.avgValue);
    return pickWeightedCard(scaled, rng);
  }
  return synthesizeDisplayCard(product, slot, slotIndex);
}

export const CARD_POOL_DISCLAIMER =
  "Card names and art are illustrative examples from public/example pools for this free simulator — not a guarantee you’ll pull that exact card. Dollar amounts are estimates tied to our EV slot model, not live quotes.";
