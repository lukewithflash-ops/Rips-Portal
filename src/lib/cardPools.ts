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
const OPIMG = (id: string) => `https://images.scrydex.com/onepiece/${id}/small`;
const SPORTS = "/cards/placeholder-sports.svg";
const SPORTS_REF = "/cards/placeholder-sports-refractor.svg";
const SPORTS_AUTO = "/cards/placeholder-sports-auto.svg";
const BBALL = "/cards/placeholder-bball.svg";
const BBALL_REF = "/cards/placeholder-bball-refractor.svg";
const BBALL_AUTO = "/cards/placeholder-bball-auto.svg";
const OP_FALLBACK = "/cards/placeholder-op.svg";
const POKE = "/cards/placeholder-poke.svg";

const ascendedPack: ProductPools = {
  0: [
    { name: "Erika's Oddish", imageUrl: S("me2pt5-1"), estValue: 0.12, weight: 8 },
    { name: "Dratini", imageUrl: S("me2pt5-150"), estValue: 0.2, weight: 6 },
    { name: "Team Rocket Grunt common", imageUrl: S("me2pt5-50"), estValue: 0.25, weight: 6 },
    { name: "Assorted Commons Pack", imageUrl: S("me2pt5-100"), estValue: 0.4, weight: 5 },
    { name: "Uncommon Trainer Mix", imageUrl: S("me2pt5-180"), estValue: 0.75, weight: 4 },
    { name: "Reverse Holo Common", imageUrl: S("me2pt5-200"), estValue: 1.4, weight: 3 },
    { name: "Holo Energy / Promo filler", imageUrl: S("me2pt5-220"), estValue: 3.2, weight: 2 },
    { name: "Popular Uncommon chase-adjacent", imageUrl: S("me2pt5-226"), estValue: 6, weight: 1 }
  ],
  1: [
    { name: "Double Rare — Midline EX", imageUrl: S("me2pt5-150"), estValue: 0.55, weight: 5 },
    { name: "Double Rare — Playable EX", imageUrl: S("me2pt5-180"), estValue: 1, weight: 4 },
    { name: "Double Rare — Splashy Art", imageUrl: S("me2pt5-200"), estValue: 1.7, weight: 3 },
    { name: "Double Rare — Hot Name", imageUrl: S("me2pt5-220"), estValue: 2.6, weight: 2 },
    { name: "Double Rare — Set favorite", imageUrl: S("me2pt5-240"), estValue: 3.2, weight: 1 }
  ],
  2: [
    { name: "Psyduck — Illustration Rare", imageUrl: S("me2pt5-226"), estValue: 70, weight: 1 },
    { name: "Scenic IR — Mid Set", imageUrl: S("me2pt5-230"), estValue: 12, weight: 4 },
    { name: "Cute IR — Trainer Scene", imageUrl: S("me2pt5-240"), estValue: 8, weight: 5 },
    { name: "Standard Illustration Rare", imageUrl: S("me2pt5-220"), estValue: 5, weight: 6 },
    { name: "Budget Illustration Rare", imageUrl: S("me2pt5-200"), estValue: 3, weight: 4 },
    { name: "IR — Character spotlight", imageUrl: S("me2pt5-250"), estValue: 15, weight: 2 }
  ],
  3: [
    { name: "Ultra Rare — Full Art Trainer", imageUrl: S("me2pt5-250"), estValue: 1.1, weight: 4 },
    { name: "Ultra Rare — EX Full Art", imageUrl: S("me2pt5-260"), estValue: 1.7, weight: 4 },
    { name: "Ultra Rare — Splash Art", imageUrl: S("me2pt5-270"), estValue: 2.4, weight: 3 },
    { name: "Ultra Rare — Hot Character", imageUrl: S("me2pt5-200"), estValue: 3.8, weight: 1 }
  ],
  4: [
    { name: "Mega Attack Rare — Mid Tier", imageUrl: S("me2pt5-250"), estValue: 10, weight: 5 },
    { name: "Mega Attack Rare — Strong Art", imageUrl: S("me2pt5-260"), estValue: 16, weight: 4 },
    { name: "Mega Attack Rare — Chase-adjacent", imageUrl: S("me2pt5-270"), estValue: 28, weight: 2 },
    { name: "Mega Feraligatr ex — MAR/SIR bridge", imageUrl: S("me2pt5-274"), estValue: 40, weight: 1 }
  ],
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
    { name: "Budget SIR — Floor Art", imageUrl: S("me2pt5-260"), estValue: 55, weight: 8 }
  ],
  6: [
    { name: "Mega Charizard Y ex — Mega Hyper Rare", imageUrl: S("me2pt5-294"), estValue: 420, weight: 3 },
    { name: "Gold Hyper Rare — Energy / Item", imageUrl: S("me2pt5-290"), estValue: 180, weight: 2 },
    { name: "Gold Hyper Rare — Trainer", imageUrl: S("me2pt5-280"), estValue: 250, weight: 2 }
  ],
};

const ascendedEtb: ProductPools = {
  0: [
    { name: "Bulk value across packs — Commons mix", imageUrl: S("me2pt5-1"), estValue: 4, weight: 3 },
    { name: "Bulk value — Reverse holos & uncommons", imageUrl: S("me2pt5-50"), estValue: 7, weight: 3 },
    { name: "Bulk value — Better filler stack", imageUrl: S("me2pt5-100"), estValue: 10, weight: 2 },
    { name: "Bulk — Popular reverses", imageUrl: S("me2pt5-150"), estValue: 8, weight: 2 }
  ],
  1: [
    { name: "Double Rare stack + Psyduck IR", imageUrl: S("me2pt5-226"), estValue: 35, weight: 2 },
    { name: "RR + Illustration Rare haul", imageUrl: S("me2pt5-230"), estValue: 28, weight: 3 },
    { name: "Expected RR/IR mix", imageUrl: S("me2pt5-220"), estValue: 22, weight: 3 },
    { name: "IR spotlight from the box", imageUrl: S("me2pt5-240"), estValue: 30, weight: 2 }
  ],
  2: [
    { name: "Ultra / Mega Attack Rare hits", imageUrl: S("me2pt5-260"), estValue: 18, weight: 3 },
    { name: "MAR highlight from the box", imageUrl: S("me2pt5-274"), estValue: 24, weight: 2 },
    { name: "UR/MAR expected value", imageUrl: S("me2pt5-250"), estValue: 14, weight: 3 }
  ],
  3: [
    { name: "Mega Gengar ex SIR", imageUrl: S("me2pt5-284"), estValue: 1120, weight: 1 },
    { name: "Pikachu ex SIR", imageUrl: S("me2pt5-276"), estValue: 1100, weight: 1 },
    { name: "Mega Dragonite ex SIR", imageUrl: S("me2pt5-290"), estValue: 710, weight: 2 },
    { name: "Lillie's Clefairy ex SIR", imageUrl: S("me2pt5-280"), estValue: 170, weight: 5 },
    { name: "N's Zoroark ex SIR", imageUrl: S("me2pt5-286"), estValue: 165, weight: 5 },
    { name: "Team Rocket's Mewtwo ex SIR", imageUrl: S("me2pt5-281"), estValue: 380, weight: 2 },
    { name: "Budget SIR from the box", imageUrl: S("me2pt5-270"), estValue: 70, weight: 6 }
  ],
  4: [
    { name: "Mega Charizard Y ex — Mega Hyper Rare", imageUrl: S("me2pt5-294"), estValue: 420, weight: 3 },
    { name: "Gold Mega Hyper Rare", imageUrl: S("me2pt5-290"), estValue: 220, weight: 2 }
  ],
};

const ascendedBundle: ProductPools = {
  0: [
    { name: "Bulk across 6 packs", imageUrl: S("me2pt5-1"), estValue: 3.5, weight: 3 },
    { name: "Reverse holo stack", imageUrl: S("me2pt5-50"), estValue: 4.8, weight: 3 },
    { name: "Better bulk stack", imageUrl: S("me2pt5-100"), estValue: 6.5, weight: 2 }
  ],
  1: [
    { name: "RRs + Psyduck IR", imageUrl: S("me2pt5-226"), estValue: 28, weight: 2 },
    { name: "RR + IR expected", imageUrl: S("me2pt5-230"), estValue: 18, weight: 4 },
    { name: "Illustration Rare highlight", imageUrl: S("me2pt5-220"), estValue: 14, weight: 3 }
  ],
  2: [
    { name: "UR + MAR expected", imageUrl: S("me2pt5-260"), estValue: 12, weight: 3 },
    { name: "Mega Attack Rare hit", imageUrl: S("me2pt5-274"), estValue: 18, weight: 2 },
    { name: "Ultra Rare stack", imageUrl: S("me2pt5-250"), estValue: 8, weight: 3 }
  ],
  3: [
    { name: "Mega Gengar ex SIR", imageUrl: S("me2pt5-284"), estValue: 1120, weight: 1 },
    { name: "Pikachu ex SIR", imageUrl: S("me2pt5-276"), estValue: 1100, weight: 1 },
    { name: "Team Rocket's Mewtwo ex SIR", imageUrl: S("me2pt5-281"), estValue: 380, weight: 3 },
    { name: "Lillie's Clefairy ex SIR", imageUrl: S("me2pt5-280"), estValue: 170, weight: 5 },
    { name: "Budget SIR", imageUrl: S("me2pt5-270"), estValue: 70, weight: 6 }
  ],
  4: [
    { name: "Mega Charizard Y ex — Mega Hyper Rare", imageUrl: S("me2pt5-294"), estValue: 420, weight: 3 },
    { name: "Gold Hyper Rare", imageUrl: S("me2pt5-280"), estValue: 200, weight: 2 }
  ],
};

const prismaticPack: ProductPools = {
  0: [
    { name: "Eevee — Prismatic Common", imageUrl: S("sv8pt5-1"), estValue: 0.12, weight: 5 },
    { name: "Prismatic Common — Eeveelution line", imageUrl: S("sv8pt5-28"), estValue: 0.15, weight: 5 },
    { name: "Prismatic Uncommon mix", imageUrl: S("sv8pt5-50"), estValue: 0.28, weight: 4 },
    { name: "Bulk Commons stack", imageUrl: S("sv8pt5-75"), estValue: 0.4, weight: 3 },
    { name: "Reverse holo common", imageUrl: S("sv8pt5-100"), estValue: 0.55, weight: 2 }
  ],
  1: [
    { name: "Rare Holo — Mid set", imageUrl: S("sv8pt5-75"), estValue: 1.1, weight: 4 },
    { name: "Rare Holo — Popular", imageUrl: S("sv8pt5-100"), estValue: 2, weight: 3 },
    { name: "Reverse Holo Rare", imageUrl: S("sv8pt5-28"), estValue: 2.8, weight: 2 },
    { name: "Rare Holo — Eeveelution", imageUrl: S("sv8pt5-50"), estValue: 2.4, weight: 2 }
  ],
  2: [
    { name: "Ultra / EX — Playable", imageUrl: S("sv8pt5-100"), estValue: 5, weight: 4 },
    { name: "Ultra / EX — Splash art", imageUrl: S("sv8pt5-144"), estValue: 9, weight: 3 },
    { name: "EX chase-adjacent", imageUrl: S("sv8pt5-161"), estValue: 14, weight: 1 },
    { name: "Eeveelution EX — Mid", imageUrl: S("sv8pt5-75"), estValue: 7, weight: 2 }
  ],
  3: [
    { name: "Illustration Rare — Eeveelution scene", imageUrl: S("sv8pt5-144"), estValue: 35, weight: 2 },
    { name: "Illustration Rare — Mid", imageUrl: S("sv8pt5-100"), estValue: 18, weight: 4 },
    { name: "Budget Illustration Rare", imageUrl: S("sv8pt5-75"), estValue: 12, weight: 4 },
    { name: "IR — Trainer / scenic", imageUrl: S("sv8pt5-50"), estValue: 16, weight: 3 }
  ],
  4: [
    { name: "Special Illustration Rare — Top chase", imageUrl: S("sv8pt5-161"), estValue: 450, weight: 1 },
    { name: "Special Illustration Rare — Strong", imageUrl: S("sv8pt5-144"), estValue: 220, weight: 3 },
    { name: "Special Illustration Rare — Mid", imageUrl: S("sv8pt5-100"), estValue: 120, weight: 5 },
    { name: "Budget SIR", imageUrl: S("sv8pt5-75"), estValue: 70, weight: 4 },
    { name: "SIR — Eeveelution favorite", imageUrl: S("sv8pt5-50"), estValue: 95, weight: 3 }
  ],
  5: [
    { name: "Master Ball / Big Chase — God pack adjacent", imageUrl: S("sv8pt5-161"), estValue: 1400, weight: 1 },
    { name: "Master Ball pattern chase", imageUrl: S("sv8pt5-144"), estValue: 700, weight: 2 },
    { name: "Big Prismatic chase hit", imageUrl: S("sv8pt5-100"), estValue: 500, weight: 2 }
  ],
};

const surgingPack: ProductPools = {
  0: [
    { name: "Surging Sparks Common", imageUrl: S("sv8-1"), estValue: 0.15, weight: 5 },
    { name: "Surging Sparks Uncommon", imageUrl: S("sv8-100"), estValue: 0.35, weight: 4 },
    { name: "Bulk reverse holo", imageUrl: S("sv8-180"), estValue: 0.7, weight: 3 },
    { name: "Electric-type common mix", imageUrl: S("sv8-220"), estValue: 0.45, weight: 3 }
  ],
  1: [
    { name: "Rare / Holo — Mid", imageUrl: S("sv8-180"), estValue: 0.85, weight: 4 },
    { name: "Rare / Holo — Popular", imageUrl: S("sv8-220"), estValue: 1.5, weight: 3 },
    { name: "Reverse Holo Rare", imageUrl: S("sv8-100"), estValue: 2, weight: 2 },
    { name: "Rare — Splash name", imageUrl: S("sv8-1"), estValue: 1.2, weight: 2 }
  ],
  2: [
    { name: "Pikachu ex — Double Rare / Hyper", imageUrl: S("sv8-247"), estValue: 12, weight: 1 },
    { name: "Double Rare / EX — Mid", imageUrl: S("sv8-220"), estValue: 4, weight: 4 },
    { name: "Double Rare / EX — Splash", imageUrl: S("sv8-242"), estValue: 6, weight: 3 },
    { name: "EX — Playable mid", imageUrl: S("sv8-180"), estValue: 5, weight: 2 }
  ],
  3: [
    { name: "Archaludon ex SIR", imageUrl: S("sv8-241"), estValue: 40, weight: 2 },
    { name: "Alolan Exeggutor ex SIR", imageUrl: S("sv8-242"), estValue: 25, weight: 3 },
    { name: "Illustration Rare — Mid", imageUrl: S("sv8-220"), estValue: 10, weight: 4 },
    { name: "Budget IR", imageUrl: S("sv8-180"), estValue: 6, weight: 3 },
    { name: "IR — Electric scene", imageUrl: S("sv8-100"), estValue: 12, weight: 2 }
  ],
  4: [
    { name: "Pikachu ex — Gold Hyper Rare", imageUrl: S("sv8-247"), estValue: 280, weight: 1 },
    { name: "Special Illustration Rare — Top", imageUrl: S("sv8-246"), estValue: 120, weight: 3 },
    { name: "SIR / Special — Mid", imageUrl: S("sv8-244"), estValue: 70, weight: 4 },
    { name: "Budget SIR", imageUrl: S("sv8-243"), estValue: 45, weight: 3 },
    { name: "SIR — Set favorite", imageUrl: S("sv8-242"), estValue: 55, weight: 2 }
  ],
};

const destinedPack: ProductPools = {
  0: [
    { name: "Destined Rivals Common", imageUrl: S("sv10-1"), estValue: 0.15, weight: 5 },
    { name: "Team Rocket Uncommon mix", imageUrl: S("sv10-50"), estValue: 0.35, weight: 4 },
    { name: "Bulk reverse holo", imageUrl: S("sv10-182"), estValue: 0.65, weight: 3 },
    { name: "Rocket grunt common", imageUrl: S("sv10-50"), estValue: 0.25, weight: 4 }
  ],
  1: [
    { name: "Rare / Holo — Rocket theme", imageUrl: S("sv10-182"), estValue: 0.95, weight: 4 },
    { name: "Rare / Holo — Popular", imageUrl: S("sv10-225"), estValue: 1.4, weight: 3 },
    { name: "Reverse Holo Rare", imageUrl: S("sv10-50"), estValue: 1.9, weight: 2 },
    { name: "Rare — Rival spotlight", imageUrl: S("sv10-1"), estValue: 1.2, weight: 2 }
  ],
  2: [
    { name: "EX / Double Rare — Mid", imageUrl: S("sv10-182"), estValue: 3.5, weight: 4 },
    { name: "EX / Double Rare — Splash", imageUrl: S("sv10-225"), estValue: 6, weight: 3 },
    { name: "Hot EX name", imageUrl: S("sv10-239"), estValue: 10, weight: 1 },
    { name: "EX — Team Rocket", imageUrl: S("sv10-50"), estValue: 5, weight: 2 }
  ],
  3: [
    { name: "Illustration Rare — Rocket scene", imageUrl: S("sv10-225"), estValue: 22, weight: 3 },
    { name: "Illustration Rare — Mid", imageUrl: S("sv10-182"), estValue: 12, weight: 4 },
    { name: "Budget IR", imageUrl: S("sv10-50"), estValue: 8, weight: 3 },
    { name: "IR — Rival art", imageUrl: S("sv10-1"), estValue: 14, weight: 2 }
  ],
  4: [
    { name: "SIR / Chase — Top Team Rocket", imageUrl: S("sv10-239"), estValue: 320, weight: 1 },
    { name: "SIR / Chase — Strong", imageUrl: S("sv10-225"), estValue: 140, weight: 3 },
    { name: "SIR — Mid", imageUrl: S("sv10-182"), estValue: 80, weight: 4 },
    { name: "Budget SIR", imageUrl: S("sv10-50"), estValue: 50, weight: 3 },
    { name: "SIR — Set favorite", imageUrl: S("sv10-1"), estValue: 65, weight: 2 }
  ],
};

const journeyPack: ProductPools = {
  0: [
    { name: "Journey Together Common", imageUrl: S("sv9-1"), estValue: 0.12, weight: 5 },
    { name: "Journey Uncommon mix", imageUrl: S("sv9-50"), estValue: 0.3, weight: 4 },
    { name: "Bulk reverse", imageUrl: S("sv9-160"), estValue: 0.55, weight: 3 },
    { name: "Partner Pokémon common", imageUrl: S("sv9-50"), estValue: 0.2, weight: 4 }
  ],
  1: [
    { name: "Rare / Holo", imageUrl: S("sv9-160"), estValue: 0.85, weight: 4 },
    { name: "Rare / Holo — Popular", imageUrl: S("sv9-185"), estValue: 1.35, weight: 3 },
    { name: "Reverse Holo Rare", imageUrl: S("sv9-50"), estValue: 1.7, weight: 2 },
    { name: "Rare — Trainer partner", imageUrl: S("sv9-1"), estValue: 1.1, weight: 2 }
  ],
  2: [
    { name: "EX / Double Rare — Mid", imageUrl: S("sv9-160"), estValue: 3, weight: 4 },
    { name: "EX / Double Rare — Splash", imageUrl: S("sv9-185"), estValue: 5, weight: 3 },
    { name: "Hot EX", imageUrl: S("sv9-185"), estValue: 8, weight: 1 },
    { name: "EX — Journey spotlight", imageUrl: S("sv9-50"), estValue: 4, weight: 2 }
  ],
  3: [
    { name: "Illustration Rare — Strong", imageUrl: S("sv9-185"), estValue: 20, weight: 2 },
    { name: "Illustration Rare — Mid", imageUrl: S("sv9-160"), estValue: 10, weight: 4 },
    { name: "Budget IR", imageUrl: S("sv9-50"), estValue: 6, weight: 3 },
    { name: "IR — Partner scene", imageUrl: S("sv9-1"), estValue: 12, weight: 2 }
  ],
  4: [
    { name: "SIR / Special — Top", imageUrl: S("sv9-185"), estValue: 220, weight: 1 },
    { name: "SIR / Special — Mid", imageUrl: S("sv9-160"), estValue: 70, weight: 4 },
    { name: "Budget SIR", imageUrl: S("sv9-50"), estValue: 40, weight: 3 },
    { name: "SIR — Journey favorite", imageUrl: S("sv9-1"), estValue: 55, weight: 2 }
  ],
};


/** Named modern SV-style pack pool with deeper chase / mid / bulk lists. */
function svStylePack(
  setCode: string,
  names: {
    commons: string[];
    rares: string[];
    exs: string[];
    irs: string[];
    chase: string;
    chaseId: string;
    midChase: string;
  }
): ProductPools {
  const c = (n: number) => S(`${setCode}-${n}`);
  return {
    0: [
      { name: names.commons[0]!, imageUrl: c(1), estValue: 0.12, weight: 5 },
      { name: names.commons[1]!, imageUrl: c(50), estValue: 0.28, weight: 4 },
      { name: names.commons[2]!, imageUrl: c(100), estValue: 0.45, weight: 3 },
      { name: "Reverse holo common", imageUrl: c(160), estValue: 0.55, weight: 2 },
      { name: "Better bulk card", imageUrl: c(80), estValue: 0.7, weight: 1 },
    ],
    1: [
      { name: names.rares[0]!, imageUrl: c(160), estValue: 0.75, weight: 4 },
      { name: names.rares[1]!, imageUrl: c(180), estValue: 1.2, weight: 3 },
      { name: "Reverse Holo Rare", imageUrl: c(100), estValue: 1.7, weight: 2 },
      { name: names.rares[2]!, imageUrl: c(50), estValue: 1.0, weight: 2 },
    ],
    2: [
      { name: names.exs[0]!, imageUrl: c(180), estValue: 3, weight: 4 },
      { name: names.exs[1]!, imageUrl: c(200), estValue: 5, weight: 3 },
      { name: names.exs[2]!, imageUrl: names.chaseId.includes("-") ? S(names.chaseId) : c(210), estValue: 8, weight: 1 },
      { name: "EX — Playable mid", imageUrl: c(160), estValue: 4, weight: 2 },
    ],
    3: [
      { name: names.irs[0]!, imageUrl: S(names.chaseId), estValue: 18, weight: 2 },
      { name: names.irs[1]!, imageUrl: c(200), estValue: 9, weight: 4 },
      { name: "Budget IR", imageUrl: c(180), estValue: 5, weight: 3 },
      { name: names.irs[2]!, imageUrl: c(160), estValue: 11, weight: 2 },
    ],
    4: [
      { name: names.chase, imageUrl: S(names.chaseId), estValue: 180, weight: 1 },
      { name: names.midChase, imageUrl: c(200), estValue: 55, weight: 4 },
      { name: "Budget SIR", imageUrl: c(180), estValue: 35, weight: 3 },
      { name: "SIR — Set favorite", imageUrl: c(160), estValue: 45, weight: 2 },
    ],
  };
}

const chaosRising: ProductPools = {
  0: [
    { name: "Chaos Rising Common", imageUrl: S("me4-1"), estValue: 0.15, weight: 5 },
    { name: "Chaos Rising Uncommon", imageUrl: S("me4-50"), estValue: 0.4, weight: 4 },
    { name: "Reverse holo mix", imageUrl: S("me4-180"), estValue: 0.75, weight: 3 },
    { name: "Chaos bulk common", imageUrl: S("me4-100"), estValue: 0.3, weight: 4 }
  ],
  1: [
    { name: "Double Rare (DR) — Mid", imageUrl: S("me4-180"), estValue: 2.2, weight: 4 },
    { name: "Double Rare (DR) — Splash", imageUrl: S("me4-200"), estValue: 3.5, weight: 3 },
    { name: "Double Rare — Hot", imageUrl: S("me4-220"), estValue: 6, weight: 1 },
    { name: "DR — Playable", imageUrl: S("me4-100"), estValue: 2.8, weight: 2 }
  ],
  2: [
    { name: "Ultra Rare — Mid", imageUrl: S("me4-180"), estValue: 4, weight: 4 },
    { name: "Ultra Rare — Full Art", imageUrl: S("me4-200"), estValue: 7, weight: 3 },
    { name: "Ultra Rare — Hot", imageUrl: S("me4-220"), estValue: 12, weight: 1 },
    { name: "UR — Character", imageUrl: S("me4-100"), estValue: 5.5, weight: 2 }
  ],
  3: [
    { name: "Illustration Rare — Strong", imageUrl: S("me4-220"), estValue: 18, weight: 2 },
    { name: "Illustration Rare — Mid", imageUrl: S("me4-200"), estValue: 9, weight: 4 },
    { name: "Budget IR", imageUrl: S("me4-180"), estValue: 5, weight: 3 },
    { name: "IR — Chaos scene", imageUrl: S("me4-100"), estValue: 11, weight: 2 }
  ],
  4: [
    { name: "Special Illustration Rare — Top", imageUrl: S("me4-220"), estValue: 220, weight: 1 },
    { name: "SIR — Mid", imageUrl: S("me4-200"), estValue: 70, weight: 4 },
    { name: "Budget SIR", imageUrl: S("me4-180"), estValue: 40, weight: 3 },
    { name: "SIR — Set favorite", imageUrl: S("me4-100"), estValue: 55, weight: 2 }
  ],
  5: [
    { name: "Mega Hyper Rare — Gold chase", imageUrl: S("me4-220"), estValue: 400, weight: 2 },
    { name: "Mega Hyper Rare — Gold item", imageUrl: S("me4-200"), estValue: 180, weight: 2 }
  ],
};

const perfectOrder: ProductPools = {
  0: [
    { name: "Perfect Order Common", imageUrl: S("me3-1"), estValue: 0.15, weight: 5 },
    { name: "Perfect Order Uncommon", imageUrl: S("me3-50"), estValue: 0.4, weight: 4 },
    { name: "Reverse holo mix", imageUrl: S("me3-180"), estValue: 0.75, weight: 3 },
    { name: "Order bulk common", imageUrl: S("me3-100"), estValue: 0.3, weight: 4 }
  ],
  1: [
    { name: "Double Rare — Mid", imageUrl: S("me3-180"), estValue: 2.2, weight: 4 },
    { name: "Double Rare — Splash", imageUrl: S("me3-200"), estValue: 3.4, weight: 3 },
    { name: "Double Rare — Hot", imageUrl: S("me3-180"), estValue: 5.5, weight: 1 },
    { name: "DR — Playable", imageUrl: S("me3-100"), estValue: 2.7, weight: 2 }
  ],
  2: [
    { name: "Ultra Rare — Mid", imageUrl: S("me3-180"), estValue: 3.5, weight: 4 },
    { name: "Ultra Rare — Full Art", imageUrl: S("me3-200"), estValue: 6, weight: 3 },
    { name: "Ultra Rare — Hot", imageUrl: S("me3-180"), estValue: 10, weight: 1 },
    { name: "UR — Character", imageUrl: S("me3-100"), estValue: 5, weight: 2 }
  ],
  3: [
    { name: "Illustration Rare — Strong", imageUrl: S("me3-200"), estValue: 16, weight: 2 },
    { name: "Illustration Rare — Mid", imageUrl: S("me3-180"), estValue: 8, weight: 4 },
    { name: "Budget IR", imageUrl: S("me3-100"), estValue: 5, weight: 3 },
    { name: "IR — Order scene", imageUrl: S("me3-50"), estValue: 10, weight: 2 }
  ],
  4: [
    { name: "Special Illustration Rare — Top", imageUrl: S("me3-200"), estValue: 200, weight: 1 },
    { name: "SIR — Mid", imageUrl: S("me3-180"), estValue: 65, weight: 4 },
    { name: "Budget SIR", imageUrl: S("me3-100"), estValue: 40, weight: 3 },
    { name: "SIR — Set favorite", imageUrl: S("me3-50"), estValue: 50, weight: 2 }
  ],
  5: [
    { name: "Mega Zygarde — Mega Hyper Rare", imageUrl: S("me3-200"), estValue: 450, weight: 2 },
    { name: "Gold Mega Hyper Rare", imageUrl: S("me3-180"), estValue: 200, weight: 2 }
  ],
};

const pitchBlack: ProductPools = {
  0: [
    { name: "Pitch Black Common", imageUrl: S("me5-1"), estValue: 0.15, weight: 5 },
    { name: "Pitch Black Uncommon", imageUrl: S("me5-50"), estValue: 0.45, weight: 4 },
    { name: "Reverse holo mix", imageUrl: S("me5-180"), estValue: 0.85, weight: 3 },
    { name: "Dark-type bulk", imageUrl: S("me5-100"), estValue: 0.35, weight: 4 }
  ],
  1: [
    { name: "Double Rare — Mid", imageUrl: S("me5-180"), estValue: 2.5, weight: 4 },
    { name: "Double Rare — Splash", imageUrl: S("me5-200"), estValue: 3.8, weight: 3 },
    { name: "Double Rare — Hot", imageUrl: S("me5-180"), estValue: 6.5, weight: 1 },
    { name: "DR — Playable", imageUrl: S("me5-100"), estValue: 3, weight: 2 }
  ],
  2: [
    { name: "Ultra Rare — Mid", imageUrl: S("me5-180"), estValue: 4.5, weight: 4 },
    { name: "Ultra Rare — Full Art", imageUrl: S("me5-200"), estValue: 8, weight: 3 },
    { name: "Ultra Rare — Hot", imageUrl: S("me5-180"), estValue: 14, weight: 1 },
    { name: "UR — Darkrai-adjacent", imageUrl: S("me5-100"), estValue: 6, weight: 2 }
  ],
  3: [
    { name: "Illustration Rare — Strong", imageUrl: S("me5-200"), estValue: 20, weight: 2 },
    { name: "Illustration Rare — Mid", imageUrl: S("me5-180"), estValue: 10, weight: 4 },
    { name: "Budget IR", imageUrl: S("me5-100"), estValue: 6, weight: 3 },
    { name: "IR — Night scene", imageUrl: S("me5-50"), estValue: 12, weight: 2 }
  ],
  4: [
    { name: "Special Illustration Rare — Top", imageUrl: S("me5-200"), estValue: 250, weight: 1 },
    { name: "SIR — Mid", imageUrl: S("me5-180"), estValue: 80, weight: 4 },
    { name: "Budget SIR", imageUrl: S("me5-100"), estValue: 45, weight: 3 },
    { name: "SIR — Set favorite", imageUrl: S("me5-50"), estValue: 60, weight: 2 }
  ],
  5: [
    { name: "Mega Darkrai — Mega Hyper Rare", imageUrl: S("me5-200"), estValue: 500, weight: 2 },
    { name: "Gold Mega Hyper Rare", imageUrl: S("me5-180"), estValue: 220, weight: 2 }
  ],
};


/** 30th Celebration SKUs — named promos + pack hits with real Ascended/classic art. */
function thirtiethPools(promoName: string, promoImg: string): ProductPools {
  return {
    0: [
      { name: "30th Celebration pack hits — Commons mix", imageUrl: S("me2pt5-1"), estValue: 4, weight: 3 },
      { name: "30th pack hits — Reverse / holo stack", imageUrl: S("me2pt5-50"), estValue: 7, weight: 3 },
      { name: "30th pack hits — Better filler", imageUrl: S("me2pt5-100"), estValue: 12, weight: 2 },
      { name: "Classic remix commons", imageUrl: S("sv8-1"), estValue: 5, weight: 2 },
    ],
    1: [
      { name: `${promoName} (promo / accessories)`, imageUrl: promoImg, estValue: 12, weight: 3 },
      { name: "30th foil energy / sleeves stack", imageUrl: S("me2pt5-100"), estValue: 10, weight: 3 },
      { name: "Commemorative accessories", imageUrl: S("sv8pt5-1"), estValue: 8, weight: 2 },
      { name: "Promo-adjacent holo", imageUrl: S("me2pt5-150"), estValue: 9, weight: 2 },
    ],
    2: [
      { name: "30th chase SIR — Classic remix", imageUrl: S("me2pt5-276"), estValue: 180, weight: 2 },
      { name: "30th chase hit — Mid SIR", imageUrl: S("me2pt5-280"), estValue: 90, weight: 4 },
      { name: "30th chase upside — Budget", imageUrl: S("me2pt5-270"), estValue: 50, weight: 3 },
      { name: "30th special art chase", imageUrl: S("sv8pt5-161"), estValue: 120, weight: 2 },
    ],
  };
}

const baseChromeHobby: ProductPools = {
  0: [
    { name: "Paul Skenes Chrome Rookie — Base", imageUrl: SPORTS, estValue: 35, weight: 3 },
    { name: "Elly De La Cruz Chrome — Base", imageUrl: SPORTS, estValue: 22, weight: 4 },
    { name: "Jackson Holliday Chrome — Base", imageUrl: SPORTS, estValue: 18, weight: 4 },
    { name: "Junior Caminero Chrome — Base", imageUrl: SPORTS, estValue: 14, weight: 3 },
    { name: "Base Refractor — Mid rookies stack", imageUrl: SPORTS_REF, estValue: 40, weight: 2 },
    { name: "Wyatt Langford Chrome — Base", imageUrl: SPORTS, estValue: 16, weight: 3 }
  ],
  1: [
    { name: "Paul Skenes Chrome — Refractor", imageUrl: SPORTS_REF, estValue: 85, weight: 3 },
    { name: "Paul Skenes Chrome — Gold /50", imageUrl: SPORTS_REF, estValue: 220, weight: 1 },
    { name: "Elly De La Cruz — Refractor /99", imageUrl: SPORTS_REF, estValue: 55, weight: 3 },
    { name: "Jackson Holliday — Prism Refractor", imageUrl: SPORTS_REF, estValue: 45, weight: 3 },
    { name: "Numbered parallel — Mid prospect", imageUrl: SPORTS_REF, estValue: 35, weight: 4 },
    { name: "Junior Caminero — Refractor", imageUrl: SPORTS_REF, estValue: 40, weight: 2 }
  ],
  2: [
    { name: "Paul Skenes Rookie Autograph", imageUrl: SPORTS_AUTO, estValue: 280, weight: 1 },
    { name: "Top prospect Rookie Auto", imageUrl: SPORTS_AUTO, estValue: 140, weight: 3 },
    { name: "Mid-tier Rookie Autograph", imageUrl: SPORTS_AUTO, estValue: 70, weight: 4 },
    { name: "Veteran Auto / lower demand", imageUrl: SPORTS_AUTO, estValue: 40, weight: 3 },
    { name: "Elly De La Cruz — Auto parallel", imageUrl: SPORTS_AUTO, estValue: 160, weight: 2 }
  ],
  3: [
    { name: "Helix / Insert SSP — Skenes", imageUrl: SPORTS_REF, estValue: 90, weight: 2 },
    { name: "Chrome Insert — Hot rookie", imageUrl: SPORTS_REF, estValue: 45, weight: 3 },
    { name: "SP / short print base", imageUrl: SPORTS, estValue: 25, weight: 4 },
    { name: "Insert — Future Stars", imageUrl: SPORTS_REF, estValue: 35, weight: 3 }
  ],
  4: [
    { name: "Superfractor /1 — Flagship rookie", imageUrl: SPORTS_REF, estValue: 2500, weight: 1 },
    { name: "Red Refractor /5 — Skenes", imageUrl: SPORTS_REF, estValue: 900, weight: 2 },
    { name: "High-end numbered — top RC", imageUrl: SPORTS_REF, estValue: 350, weight: 4 },
    { name: "Case hit adjacent", imageUrl: SPORTS_AUTO, estValue: 180, weight: 4 },
    { name: "Gold Wave Refractor /50", imageUrl: SPORTS_REF, estValue: 280, weight: 3 }
  ],
};

const baseChromeMega: ProductPools = {
  0: [
    { name: "Paul Skenes Chrome Rookie — Base", imageUrl: SPORTS, estValue: 35, weight: 2 },
    { name: "Chrome Base + Refractors stack", imageUrl: SPORTS_REF, estValue: 18, weight: 4 },
    { name: "Mid rookies Refractor mix", imageUrl: SPORTS_REF, estValue: 12, weight: 4 },
    { name: "Elly De La Cruz — Base", imageUrl: SPORTS, estValue: 20, weight: 3 },
    { name: "Jackson Holliday — Base", imageUrl: SPORTS, estValue: 15, weight: 3 }
  ],
  1: [
    { name: "Paul Skenes — Refractor", imageUrl: SPORTS_REF, estValue: 85, weight: 2 },
    { name: "Numbered parallel /99", imageUrl: SPORTS_REF, estValue: 40, weight: 3 },
    { name: "Insert / parallel haul", imageUrl: SPORTS_REF, estValue: 18, weight: 4 },
    { name: "Prism / X-Fractor mid", imageUrl: SPORTS_REF, estValue: 28, weight: 2 }
  ],
  2: [
    { name: "Paul Skenes Rookie Auto chance", imageUrl: SPORTS_AUTO, estValue: 280, weight: 1 },
    { name: "Prospect Rookie Autograph", imageUrl: SPORTS_AUTO, estValue: 120, weight: 2 },
    { name: "Lower-tier Auto", imageUrl: SPORTS_AUTO, estValue: 55, weight: 3 },
    { name: "Numbered auto parallel", imageUrl: SPORTS_AUTO, estValue: 90, weight: 2 }
  ],
};

const baseUpdateHobby: ProductPools = {
  0: [
    { name: "Update base + inserts stack", imageUrl: SPORTS, estValue: 35, weight: 3 },
    { name: "Nick Kurtz Update RC — Base", imageUrl: SPORTS, estValue: 55, weight: 2 },
    { name: "James Wood Update RC — Base", imageUrl: SPORTS, estValue: 40, weight: 3 },
    { name: "Roman Anthony Update RC — Base", imageUrl: SPORTS, estValue: 32, weight: 3 },
    { name: "Update rookies mix", imageUrl: SPORTS, estValue: 28, weight: 3 }
  ],
  1: [
    { name: "Nick Kurtz RC — Refractor", imageUrl: SPORTS_REF, estValue: 120, weight: 2 },
    { name: "James Wood RC — SP", imageUrl: SPORTS_REF, estValue: 70, weight: 3 },
    { name: "Update rookies / SP mix", imageUrl: SPORTS_REF, estValue: 35, weight: 4 },
    { name: "Roman Anthony — Refractor", imageUrl: SPORTS_REF, estValue: 55, weight: 2 }
  ],
  2: [
    { name: "Update Rookie Autograph — Top", imageUrl: SPORTS_AUTO, estValue: 220, weight: 1 },
    { name: "Update Rookie Autograph — Mid", imageUrl: SPORTS_AUTO, estValue: 100, weight: 3 },
    { name: "Veteran / lower Auto", imageUrl: SPORTS_AUTO, estValue: 55, weight: 3 },
    { name: "Nick Kurtz — Auto chance", imageUrl: SPORTS_AUTO, estValue: 160, weight: 2 }
  ],
  3: [
    { name: "Nick Kurtz Red Refractor /5", imageUrl: SPORTS_REF, estValue: 1900, weight: 1 },
    { name: "Big hit — low-numbered RC", imageUrl: SPORTS_REF, estValue: 400, weight: 3 },
    { name: "Case-hit adjacent Update", imageUrl: SPORTS_AUTO, estValue: 180, weight: 4 },
    { name: "Superfractor adjacent", imageUrl: SPORTS_REF, estValue: 800, weight: 1 }
  ],
};

const bballChromeHobby: ProductPools = {
  0: [
    { name: "Chrome Update Base + Refractors", imageUrl: BBALL, estValue: 45, weight: 3 },
    { name: "Cooper Flagg Chrome — Base", imageUrl: BBALL, estValue: 70, weight: 2 },
    { name: "Ace Bailey Chrome — Base", imageUrl: BBALL, estValue: 40, weight: 3 },
    { name: "Dylan Harper Chrome — Base", imageUrl: BBALL, estValue: 35, weight: 3 },
    { name: "Mid rookies Refractor stack", imageUrl: BBALL_REF, estValue: 35, weight: 4 }
  ],
  1: [
    { name: "Cooper Flagg — Refractor /99", imageUrl: BBALL_REF, estValue: 150, weight: 2 },
    { name: "Numbered parallel /149", imageUrl: BBALL_REF, estValue: 80, weight: 3 },
    { name: "Ace Bailey — Prism Refractor", imageUrl: BBALL_REF, estValue: 60, weight: 3 },
    { name: "Mid numbered parallels", imageUrl: BBALL_REF, estValue: 45, weight: 4 }
  ],
  2: [
    { name: "Insert SSP — Hot rookie", imageUrl: BBALL_REF, estValue: 120, weight: 2 },
    { name: "Chrome Inserts stack", imageUrl: BBALL_REF, estValue: 40, weight: 4 },
    { name: "X-Fractor / parallel insert", imageUrl: BBALL_REF, estValue: 55, weight: 3 },
    { name: "Future Stars insert", imageUrl: BBALL, estValue: 35, weight: 3 }
  ],
  3: [
    { name: "Guaranteed Autograph — Top RC", imageUrl: BBALL_AUTO, estValue: 350, weight: 1 },
    { name: "Rookie Autograph — Mid", imageUrl: BBALL_AUTO, estValue: 160, weight: 3 },
    { name: "Lower-demand Auto", imageUrl: BBALL_AUTO, estValue: 80, weight: 3 },
    { name: "Cooper Flagg — Auto parallel", imageUrl: BBALL_AUTO, estValue: 280, weight: 2 }
  ],
  4: [
    { name: "Debut Patch / Superfractor potential", imageUrl: BBALL_REF, estValue: 3500, weight: 1 },
    { name: "Low-numbered RC auto parallel", imageUrl: BBALL_AUTO, estValue: 900, weight: 2 },
    { name: "High-end numbered hit", imageUrl: BBALL_REF, estValue: 400, weight: 4 },
    { name: "Gold Refractor /50 RC", imageUrl: BBALL_REF, estValue: 550, weight: 2 }
  ],
};

const bballChromeValue: ProductPools = {
  0: [
    { name: "Chrome Update Base + Refractors", imageUrl: BBALL, estValue: 12, weight: 4 },
    { name: "Cooper Flagg — Base", imageUrl: BBALL, estValue: 22, weight: 2 },
    { name: "Ace Bailey — Base", imageUrl: BBALL, estValue: 14, weight: 3 },
    { name: "Mid rookies stack", imageUrl: BBALL, estValue: 10, weight: 4 }
  ],
  1: [
    { name: "Parallels / Inserts haul", imageUrl: BBALL_REF, estValue: 15, weight: 4 },
    { name: "Hot rookie Refractor", imageUrl: BBALL_REF, estValue: 35, weight: 2 },
    { name: "X-Fractor / insert", imageUrl: BBALL_REF, estValue: 12, weight: 3 },
    { name: "Prism parallel mid", imageUrl: BBALL_REF, estValue: 18, weight: 2 }
  ],
  2: [
    { name: "Numbered / Auto chance — Top RC", imageUrl: BBALL_AUTO, estValue: 200, weight: 1 },
    { name: "Numbered parallel hit", imageUrl: BBALL_REF, estValue: 80, weight: 2 },
    { name: "Lower auto / numbered", imageUrl: BBALL_AUTO, estValue: 45, weight: 3 },
    { name: "Cooper Flagg numbered chance", imageUrl: BBALL_REF, estValue: 120, weight: 1 }
  ],
};

const op16Pack: ProductPools = {
  0: [
    { name: "Nami — Common", imageUrl: OPIMG("OP16-025"), estValue: 0.12, weight: 4 },
    { name: "Usopp — Common", imageUrl: OPIMG("OP16-050"), estValue: 0.15, weight: 4 },
    { name: "OP-16 Uncommon — Event card", imageUrl: OPIMG("OP16-075"), estValue: 0.3, weight: 4 },
    { name: "DON!! / filler uncommon", imageUrl: OPIMG("OP16-001"), estValue: 0.35, weight: 3 },
    { name: "Crew support common", imageUrl: OPIMG("OP16-100"), estValue: 0.2, weight: 3 }
  ],
  1: [
    { name: "OP-16 Rare — Mid", imageUrl: OPIMG("OP16-075"), estValue: 1.1, weight: 4 },
    { name: "Zoro — Rare", imageUrl: OPIMG("OP16-050"), estValue: 2, weight: 3 },
    { name: "Sanji — Rare splash", imageUrl: OPIMG("OP16-100"), estValue: 2.8, weight: 2 },
    { name: "Popular character Rare", imageUrl: OPIMG("OP16-025"), estValue: 1.6, weight: 3 }
  ],
  2: [
    { name: "Super Rare — Mid leader support", imageUrl: OPIMG("OP16-100"), estValue: 6, weight: 4 },
    { name: "Leader / Super Rare — Hot", imageUrl: OPIMG("OP16-118"), estValue: 12, weight: 3 },
    { name: "Super Rare — Chase-adjacent", imageUrl: OPIMG("OP16-119"), estValue: 18, weight: 1 },
    { name: "SR — Crew spotlight", imageUrl: OPIMG("OP16-075"), estValue: 8, weight: 2 }
  ],
  3: [
    { name: "Monkey.D.Luffy (SEC)", imageUrl: OPIMG("OP16-118"), estValue: 65, weight: 2 },
    { name: "Secret Rare / Alt Art — Mid", imageUrl: OPIMG("OP16-119"), estValue: 35, weight: 4 },
    { name: "Alt Art — Budget SEC", imageUrl: OPIMG("OP16-100"), estValue: 22, weight: 3 },
    { name: "SEC — Character alt", imageUrl: OPIMG("OP16-050"), estValue: 28, weight: 2 }
  ],
  4: [
    { name: "Manga Rare — Flagship chase", imageUrl: OPIMG("OP16-119"), estValue: 350, weight: 1 },
    { name: "Manga Rare / SP — Mid", imageUrl: OPIMG("OP16-118"), estValue: 160, weight: 3 },
    { name: "Chase SP — Budget", imageUrl: OPIMG("OP16-100"), estValue: 90, weight: 3 },
    { name: "SP — Set favorite", imageUrl: OPIMG("OP16-075"), estValue: 110, weight: 2 }
  ],
};

const op16Box: ProductPools = {
  0: [
    { name: "Bulk + Rares across box", imageUrl: OPIMG("OP16-001"), estValue: 18, weight: 3 },
    { name: "Rares stack — popular names", imageUrl: OPIMG("OP16-050"), estValue: 24, weight: 3 },
    { name: "Better bulk + rares", imageUrl: OPIMG("OP16-075"), estValue: 28, weight: 2 },
    { name: "Nami / Usopp rare haul", imageUrl: OPIMG("OP16-025"), estValue: 22, weight: 2 }
  ],
  1: [
    { name: "SR / Leader expected haul", imageUrl: OPIMG("OP16-100"), estValue: 35, weight: 3 },
    { name: "Multiple Super Rares", imageUrl: OPIMG("OP16-118"), estValue: 45, weight: 3 },
    { name: "Hot Leader + SRs", imageUrl: OPIMG("OP16-119"), estValue: 55, weight: 2 }
  ],
  2: [
    { name: "Monkey.D.Luffy (SEC)", imageUrl: OPIMG("OP16-118"), estValue: 65, weight: 2 },
    { name: "Secret / Alt Art", imageUrl: OPIMG("OP16-119"), estValue: 35, weight: 4 },
    { name: "Budget SEC", imageUrl: OPIMG("OP16-100"), estValue: 22, weight: 3 }
  ],
  3: [
    { name: "Manga Rare — Flagship", imageUrl: OPIMG("OP16-119"), estValue: 350, weight: 1 },
    { name: "Manga Rare — Mid", imageUrl: OPIMG("OP16-118"), estValue: 160, weight: 3 },
    { name: "SP chase — Budget", imageUrl: OPIMG("OP16-100"), estValue: 90, weight: 3 }
  ],
};

const op09Pack: ProductPools = {
  0: [
    { name: "OP-09 Common — Emperor theme", imageUrl: OPIMG("OP09-001"), estValue: 0.12, weight: 5 },
    { name: "OP-09 Uncommon", imageUrl: OPIMG("OP09-050"), estValue: 0.28, weight: 4 },
    { name: "DON!! / filler", imageUrl: OPIMG("OP09-100"), estValue: 0.4, weight: 3 },
    { name: "Crew / empire common", imageUrl: OPIMG("OP09-001"), estValue: 0.18, weight: 4 }
  ],
  1: [
    { name: "OP-09 Rare — Mid", imageUrl: OPIMG("OP09-050"), estValue: 1.1, weight: 4 },
    { name: "OP-09 Rare — Emperor theme", imageUrl: OPIMG("OP09-100"), estValue: 2.1, weight: 3 },
    { name: "OP-09 Rare — Splash", imageUrl: OPIMG("OP09-118"), estValue: 2.9, weight: 2 },
    { name: "Popular character Rare", imageUrl: OPIMG("OP09-001"), estValue: 1.5, weight: 3 }
  ],
  2: [
    { name: "Super Rare / Leader — Mid", imageUrl: OPIMG("OP09-100"), estValue: 7, weight: 4 },
    { name: "Leader / SR — Hot Emperor", imageUrl: OPIMG("OP09-118"), estValue: 14, weight: 3 },
    { name: "SR chase-adjacent", imageUrl: OPIMG("OP09-119"), estValue: 20, weight: 1 },
    { name: "SR — Empire spotlight", imageUrl: OPIMG("OP09-050"), estValue: 9, weight: 2 }
  ],
  3: [
    { name: "Secret / Alt — Top", imageUrl: OPIMG("OP09-119"), estValue: 80, weight: 2 },
    { name: "Secret / Alt — Mid", imageUrl: OPIMG("OP09-118"), estValue: 40, weight: 4 },
    { name: "Budget SEC", imageUrl: OPIMG("OP09-100"), estValue: 25, weight: 3 },
    { name: "SEC — Character alt", imageUrl: OPIMG("OP09-050"), estValue: 32, weight: 2 }
  ],
  4: [
    { name: "Manga / SP chase — Flagship", imageUrl: OPIMG("OP09-119"), estValue: 400, weight: 1 },
    { name: "Manga / SP — Mid", imageUrl: OPIMG("OP09-118"), estValue: 180, weight: 3 },
    { name: "SP chase — Budget", imageUrl: OPIMG("OP09-100"), estValue: 100, weight: 3 },
    { name: "SP — Emperor favorite", imageUrl: OPIMG("OP09-050"), estValue: 130, weight: 2 }
  ],
};


const blasterSports = (names: [string, string, string, string?]): ProductPools => ({
  0: [
    { name: `${names[0]} — Base`, imageUrl: SPORTS, estValue: 8, weight: 3 },
    { name: `${names[1]} — Base / inserts`, imageUrl: SPORTS, estValue: 6, weight: 4 },
    { name: `${names[2]} — Base`, imageUrl: SPORTS, estValue: 5.5, weight: 3 },
    { name: "Base + inserts stack", imageUrl: SPORTS, estValue: 5, weight: 4 },
  ],
  1: [
    { name: `${names[0]} — Parallel / Refractor`, imageUrl: SPORTS_REF, estValue: 25, weight: 2 },
    { name: `${names[2]} — Rookie parallel`, imageUrl: SPORTS_REF, estValue: 14, weight: 3 },
    { name: `${names[1]} — Color parallel`, imageUrl: SPORTS_REF, estValue: 12, weight: 3 },
    { name: "Parallels / rookies mix", imageUrl: SPORTS_REF, estValue: 8, weight: 4 },
  ],
  2: [
    { name: `${names[0]} — Numbered / Auto chance`, imageUrl: SPORTS_AUTO, estValue: 90, weight: 1 },
    { name: "Numbered parallel hit", imageUrl: SPORTS_REF, estValue: 40, weight: 2 },
    { name: "Lower auto / relic", imageUrl: SPORTS_AUTO, estValue: 25, weight: 3 },
    { name: `${names[3] ?? names[1]} — Auto adjacent`, imageUrl: SPORTS_AUTO, estValue: 55, weight: 2 },
  ],
});

const blasterBball = (names: [string, string, string, string?]): ProductPools => ({
  0: [
    { name: `${names[0]} — Base`, imageUrl: BBALL, estValue: 10, weight: 3 },
    { name: `${names[1]} — Base / inserts`, imageUrl: BBALL, estValue: 7, weight: 4 },
    { name: `${names[2]} — Base`, imageUrl: BBALL, estValue: 6.5, weight: 3 },
    { name: "Base + inserts stack", imageUrl: BBALL, estValue: 6, weight: 4 },
  ],
  1: [
    { name: `${names[0]} — Parallel`, imageUrl: BBALL_REF, estValue: 28, weight: 2 },
    { name: `${names[2]} — Rookie parallel`, imageUrl: BBALL_REF, estValue: 16, weight: 3 },
    { name: `${names[1]} — Color parallel`, imageUrl: BBALL_REF, estValue: 14, weight: 3 },
    { name: "Parallels / courtside mix", imageUrl: BBALL_REF, estValue: 10, weight: 4 },
  ],
  2: [
    { name: `${names[0]} — Numbered / Auto chance`, imageUrl: BBALL_AUTO, estValue: 110, weight: 1 },
    { name: "Numbered parallel hit", imageUrl: BBALL_REF, estValue: 50, weight: 2 },
    { name: "Lower auto chance", imageUrl: BBALL_AUTO, estValue: 30, weight: 3 },
    { name: `${names[3] ?? names[1]} — Auto adjacent`, imageUrl: BBALL_AUTO, estValue: 65, weight: 2 },
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
  "poke-obsidian-pack": svStylePack("sv3", {
    commons: ["Obsidian Flames Common", "Fire-type uncommon mix", "Charizard line bulk"],
    rares: ["Rare Holo — Mid", "Rare Holo — Popular", "Rare — Dragon / Fire"],
    exs: ["EX / Double Rare — Mid", "EX / Double Rare — Splash", "Charizard ex — Mid"],
    irs: ["Illustration Rare — Strong", "Illustration Rare — Mid", "IR — Scenic"],
    chase: "Charizard ex SIR — Obsidian",
    chaseId: "sv3-230",
    midChase: "SIR / Special — Mid Obsidian",
  }),
  "poke-temporal-pack": svStylePack("sv5", {
    commons: ["Temporal Forces Common", "Ancient / Future uncommon", "Bulk reverse mix"],
    rares: ["Rare Holo — Mid", "Rare Holo — Popular", "Rare — Paradox adjacent"],
    exs: ["EX / Double Rare — Mid", "EX / Double Rare — Splash", "Hot EX — Temporal"],
    irs: ["Illustration Rare — Strong", "Illustration Rare — Mid", "IR — Time scene"],
    chase: "Walking Wake / Iron Leaves SIR — Temporal",
    chaseId: "sv5-218",
    midChase: "SIR / ACE SPEC — Mid Temporal",
  }),
  "poke-paradox-pack": svStylePack("sv4", {
    commons: ["Paradox Rift Common", "Ancient / Future uncommon", "Bulk reverse mix"],
    rares: ["Rare Holo — Mid", "Rare Holo — Popular", "Rare — Paradox"],
    exs: ["EX / Double Rare — Mid", "EX / Double Rare — Splash", "Roaring Moon / Iron Valiant mid"],
    irs: ["Illustration Rare — Strong", "Illustration Rare — Mid", "IR — Paradox scene"],
    chase: "Roaring Moon ex SIR — Paradox",
    chaseId: "sv4-248",
    midChase: "SIR / Special — Mid Paradox",
  }),
  "poke-paldea-pack": svStylePack("sv2", {
    commons: ["Paldea Evolved Common", "Paldea uncommon mix", "Bulk reverse mix"],
    rares: ["Rare Holo — Mid", "Rare Holo — Popular", "Rare — Paldea"],
    exs: ["EX / Double Rare — Mid", "EX / Double Rare — Splash", "Iono / Miriam adjacent"],
    irs: ["Illustration Rare — Strong", "Illustration Rare — Mid", "IR — Paldea scene"],
    chase: "Iono SIR — Paldea Evolved",
    chaseId: "sv2-254",
    midChase: "SIR / Special — Mid Paldea",
  }),
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
  "poke-30th-etb": thirtiethPools("Full-art Nidorina promo", S("me2pt5-1")),
  "poke-30th-pc-etb": thirtiethPools("Nidorina promo (PC stamp)", S("me2pt5-1")),
  "poke-30th-bundle": thirtiethPools("30th Celebration pack art", S("me2pt5-50")),
  "poke-30th-poster": thirtiethPools("Articuno / Zapdos / Moltres promos", S("sv8-180")),
  "poke-30th-tech-sticker-exeggutor": thirtiethPools("Alolan Exeggutor foil promo", S("sv8-242")),
  "poke-30th-tech-sticker-lucario": thirtiethPools("Lucario foil promo", S("sv8-100")),
  "poke-30th-ex-box-sylveon": thirtiethPools("Sylveon ex promo", S("sv8pt5-144")),
  "poke-30th-ex-box-greninja": thirtiethPools("Greninja ex promo", S("sv8-220")),
  "poke-30th-knockout": thirtiethPools("Eevee foil promo", S("sv8pt5-1")),
  "poke-30th-binder": thirtiethPools("30th portfolio + packs", S("me2pt5-100")),
  "poke-30th-mini-tin": thirtiethPools("Day & Night Pikachu art", S("me2pt5-276")),
  "poke-30th-upc-day": thirtiethPools("Pikachu ex (day) + Espeon ex", S("me2pt5-276")),
  "poke-30th-upc-night": thirtiethPools("Pikachu ex (night) + Umbreon ex", S("sv8pt5-161")),
  "base-chrome-hobby": baseChromeHobby,
  "base-chrome-mega": baseChromeMega,
  "base-update-hobby": baseUpdateHobby,
  "base-series1-blaster": blasterSports([
    "Elly De La Cruz",
    "Paul Skenes",
    "Jackson Holliday",
    "Junior Caminero",
  ]),
  "base-heritage-blaster": blasterSports([
    "Paul Skenes Heritage",
    "Elly De La Cruz Heritage",
    "Top prospect Heritage",
    "Wyatt Langford Heritage",
  ]),
  "bball-chrome-update-hobby": bballChromeHobby,
  "bball-chrome-update-value": bballChromeValue,
  "bball-chrome-update-mega": {
    0: bballChromeValue[0]!,
    1: [
      { name: "Numbered parallels stack", imageUrl: BBALL_REF, estValue: 25, weight: 3 },
      { name: "Cooper Flagg numbered", imageUrl: BBALL_REF, estValue: 55, weight: 2 },
      { name: "Mid numbered haul", imageUrl: BBALL_REF, estValue: 18, weight: 3 },
      { name: "Ace Bailey parallel", imageUrl: BBALL_REF, estValue: 30, weight: 2 },
    ],
    2: bballChromeValue[1]!,
    3: bballChromeValue[2]!,
  },
  "bball-hoops-blaster": blasterBball([
    "Cooper Flagg Hoops",
    "Star vet Hoops",
    "Ace Bailey Hoops",
    "Dylan Harper Hoops",
  ]),
  "bball-select-blaster": blasterBball([
    "Select Courtside RC",
    "Select Concourse star",
    "Select Premier Level RC",
    "Cooper Flagg Select",
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
          ? OP_FALLBACK
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

/** Illustrative zero-$ fillers so empty/miss packs still feel like a pack open. */
export function emptyPackFillers(
  product: Product,
  rng: () => number = Math.random
): PoolCard[] {
  const pool0 = cardPoolsByProduct[product.id]?.[0];
  const count = 2 + (rng() < 0.5 ? 1 : 0);
  const out: PoolCard[] = [];
  for (let i = 0; i < count; i++) {
    if (pool0 && pool0.length > 0) {
      const pick = pickWeightedCard(pool0, rng);
      out.push({
        name: pick.name,
        imageUrl: pick.imageUrl,
        estValue: 0,
        weight: 1,
      });
    } else {
      const syn = synthesizeDisplayCard(
        product,
        product.slots[0] ?? {
          name: "Bulk",
          odds: "~",
          oddsNum: 1,
          avgValue: 0,
        },
        0
      );
      out.push({ ...syn, estValue: 0 });
    }
  }
  return out;
}

export const CARD_POOL_DISCLAIMER =
  "Illustrative card names & art for the vibe — not a promise you'll pull that exact card. $ estimates follow our EV slot model, not live market quotes.";
