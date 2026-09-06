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
/**
 * Scrydex One Piece thumbs use set collector IDs (e.g. OP16-118).
 * Always pair the pool display name with an ID whose Scrydex art depicts that
 * character — OP16-118 is Portgas.D.Ace SEC, not Luffy; OP09-119 is Luffy SEC.
 * Preview scans often carry a SAMPLE watermark from the CDN source.
 */
const OPIMG = (id: string) => `https://images.scrydex.com/onepiece/${id}/small`;
/** Keep name + Scrydex id adjacent so crossed art is harder to introduce. */
const opc = (
  name: string,
  id: string,
  estValue: number,
  weight?: number
): PoolCard => ({
  name,
  imageUrl: OPIMG(id),
  estValue,
  ...(weight !== undefined ? { weight } : {}),
});
/**
 * Self-hosted Chrome-style thumbs (MLB/NBA headshots composited into card frames).
 * Slug must match the named player — same name↔art rule as OP `opc`.
 * Variants: base | refractor | auto.
 */
type SportVariant = "base" | "refractor" | "auto";
const sportImg = (slug: string, variant: SportVariant = "base") =>
  `/cards/sports/${slug}-${variant}.webp`;
const sbc = (
  name: string,
  slug: string,
  estValue: number,
  weight?: number,
  variant: SportVariant = "base"
): PoolCard => ({
  name,
  imageUrl: sportImg(slug, variant),
  estValue,
  ...(weight !== undefined ? { weight } : {}),
});
/** @deprecated Keep fallbacks for synthesizeDisplayCard / legacy refs */
const SPORTS = sportImg("paul-skenes", "base");
const SPORTS_REF = sportImg("paul-skenes", "refractor");
const SPORTS_AUTO = sportImg("paul-skenes", "auto");
const BBALL = sportImg("cooper-flagg", "base");
const BBALL_REF = sportImg("cooper-flagg", "refractor");
const BBALL_AUTO = sportImg("cooper-flagg", "auto");
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
    sbc("Paul Skenes Chrome Rookie — Base", "paul-skenes", 35, 3),
    sbc("Elly De La Cruz Chrome — Base", "elly-de-la-cruz", 22, 4),
    sbc("Jackson Holliday Chrome — Base", "jackson-holliday", 18, 4),
    sbc("Junior Caminero Chrome — Base", "junior-caminero", 14, 3),
    sbc("Wyatt Langford — Base Refractor", "wyatt-langford", 40, 2, "refractor"),
    sbc("Wyatt Langford Chrome — Base", "wyatt-langford", 16, 3),
  ],
  1: [
    sbc("Paul Skenes Chrome — Refractor", "paul-skenes", 85, 3, "refractor"),
    sbc("Paul Skenes Chrome — Gold /50", "paul-skenes", 220, 1, "refractor"),
    sbc("Elly De La Cruz — Refractor /99", "elly-de-la-cruz", 55, 3, "refractor"),
    sbc("Jackson Holliday — Prism Refractor", "jackson-holliday", 45, 3, "refractor"),
    sbc("Junior Caminero — Numbered parallel", "junior-caminero", 35, 4, "refractor"),
    sbc("Junior Caminero — Refractor", "junior-caminero", 40, 2, "refractor"),
  ],
  2: [
    sbc("Paul Skenes Rookie Autograph", "paul-skenes", 280, 1, "auto"),
    sbc("Jackson Holliday Rookie Autograph", "jackson-holliday", 140, 3, "auto"),
    sbc("Junior Caminero Rookie Autograph", "junior-caminero", 70, 4, "auto"),
    sbc("Wyatt Langford Rookie Autograph", "wyatt-langford", 40, 3, "auto"),
    sbc("Elly De La Cruz — Auto parallel", "elly-de-la-cruz", 160, 2, "auto"),
  ],
  3: [
    sbc("Helix / Insert SSP — Skenes", "paul-skenes", 90, 2, "refractor"),
    sbc("Chrome Insert — Elly De La Cruz", "elly-de-la-cruz", 45, 3, "refractor"),
    sbc("SP / short print — Holliday", "jackson-holliday", 25, 4),
    sbc("Insert — Future Stars Caminero", "junior-caminero", 35, 3, "refractor"),
  ],
  4: [
    sbc("Superfractor /1 — Paul Skenes", "paul-skenes", 2500, 1, "refractor"),
    sbc("Red Refractor /5 — Skenes", "paul-skenes", 900, 2, "refractor"),
    sbc("High-end numbered — Elly De La Cruz", "elly-de-la-cruz", 350, 4, "refractor"),
    sbc("Case hit — Skenes Auto", "paul-skenes", 180, 4, "auto"),
    sbc("Gold Wave Refractor /50 — Holliday", "jackson-holliday", 280, 3, "refractor"),
  ],
};

const baseChromeMega: ProductPools = {
  0: [
    sbc("Paul Skenes Chrome Rookie — Base", "paul-skenes", 35, 2),
    sbc("Wyatt Langford Base + Refractors", "wyatt-langford", 18, 4, "refractor"),
    sbc("Junior Caminero Refractor mix", "junior-caminero", 12, 4, "refractor"),
    sbc("Elly De La Cruz — Base", "elly-de-la-cruz", 20, 3),
    sbc("Jackson Holliday — Base", "jackson-holliday", 15, 3),
  ],
  1: [
    sbc("Paul Skenes — Refractor", "paul-skenes", 85, 2, "refractor"),
    sbc("Elly De La Cruz — Numbered /99", "elly-de-la-cruz", 40, 3, "refractor"),
    sbc("Jackson Holliday — Parallel haul", "jackson-holliday", 18, 4, "refractor"),
    sbc("Junior Caminero — Prism / X-Fractor", "junior-caminero", 28, 2, "refractor"),
  ],
  2: [
    sbc("Paul Skenes Rookie Auto chance", "paul-skenes", 280, 1, "auto"),
    sbc("Jackson Holliday Rookie Autograph", "jackson-holliday", 120, 2, "auto"),
    sbc("Wyatt Langford Rookie Autograph", "wyatt-langford", 55, 3, "auto"),
    sbc("Elly De La Cruz — Auto parallel", "elly-de-la-cruz", 90, 2, "auto"),
  ],
};

const baseUpdateHobby: ProductPools = {
  0: [
    sbc("James Wood Update base stack", "james-wood", 35, 3),
    sbc("Nick Kurtz Update RC — Base", "nick-kurtz", 55, 2),
    sbc("James Wood Update RC — Base", "james-wood", 40, 3),
    sbc("Roman Anthony Update RC — Base", "roman-anthony", 32, 3),
    sbc("Nick Kurtz / Wood rookies mix", "nick-kurtz", 28, 3),
  ],
  1: [
    sbc("Nick Kurtz RC — Refractor", "nick-kurtz", 120, 2, "refractor"),
    sbc("James Wood RC — SP", "james-wood", 70, 3, "refractor"),
    sbc("Roman Anthony — Update SP mix", "roman-anthony", 35, 4, "refractor"),
    sbc("Roman Anthony — Refractor", "roman-anthony", 55, 2, "refractor"),
  ],
  2: [
    sbc("Nick Kurtz Update Rookie Autograph", "nick-kurtz", 220, 1, "auto"),
    sbc("James Wood Update Rookie Autograph", "james-wood", 100, 3, "auto"),
    sbc("Roman Anthony Update Autograph", "roman-anthony", 55, 3, "auto"),
    sbc("Nick Kurtz — Auto chance", "nick-kurtz", 160, 2, "auto"),
  ],
  3: [
    sbc("Nick Kurtz Red Refractor /5", "nick-kurtz", 1900, 1, "refractor"),
    sbc("James Wood — low-numbered RC", "james-wood", 400, 3, "refractor"),
    sbc("Roman Anthony — Case-hit Auto", "roman-anthony", 180, 4, "auto"),
    sbc("Nick Kurtz Superfractor adjacent", "nick-kurtz", 800, 1, "refractor"),
  ],
};

const bballChromeHobby: ProductPools = {
  0: [
    sbc("Dylan Harper Chrome Base + Refractors", "dylan-harper", 45, 3, "refractor"),
    sbc("Cooper Flagg Chrome — Base", "cooper-flagg", 70, 2),
    sbc("Ace Bailey Chrome — Base", "ace-bailey", 40, 3),
    sbc("Dylan Harper Chrome — Base", "dylan-harper", 35, 3),
    sbc("Ace Bailey Refractor stack", "ace-bailey", 35, 4, "refractor"),
  ],
  1: [
    sbc("Cooper Flagg — Refractor /99", "cooper-flagg", 150, 2, "refractor"),
    sbc("Dylan Harper — Numbered /149", "dylan-harper", 80, 3, "refractor"),
    sbc("Ace Bailey — Prism Refractor", "ace-bailey", 60, 3, "refractor"),
    sbc("Ace Bailey — Mid numbered parallel", "ace-bailey", 45, 4, "refractor"),
  ],
  2: [
    sbc("Insert SSP — Cooper Flagg", "cooper-flagg", 120, 2, "refractor"),
    sbc("Chrome Inserts — Ace Bailey", "ace-bailey", 40, 4, "refractor"),
    sbc("X-Fractor — Dylan Harper", "dylan-harper", 55, 3, "refractor"),
    sbc("Future Stars — Cooper Flagg", "cooper-flagg", 35, 3),
  ],
  3: [
    sbc("Cooper Flagg Guaranteed Autograph", "cooper-flagg", 350, 1, "auto"),
    sbc("Ace Bailey Rookie Autograph", "ace-bailey", 160, 3, "auto"),
    sbc("Dylan Harper Rookie Autograph", "dylan-harper", 80, 3, "auto"),
    sbc("Cooper Flagg — Auto parallel", "cooper-flagg", 280, 2, "auto"),
  ],
  4: [
    sbc("Debut Patch / Superfractor — Flagg", "cooper-flagg", 3500, 1, "refractor"),
    sbc("Low-numbered RC auto — Flagg", "cooper-flagg", 900, 2, "auto"),
    sbc("High-end numbered — Ace Bailey", "ace-bailey", 400, 4, "refractor"),
    sbc("Gold Refractor /50 — Dylan Harper", "dylan-harper", 550, 2, "refractor"),
  ],
};

const bballChromeValue: ProductPools = {
  0: [
    sbc("Ace Bailey Chrome Base + Refractors", "ace-bailey", 12, 4, "refractor"),
    sbc("Cooper Flagg — Base", "cooper-flagg", 22, 2),
    sbc("Ace Bailey — Base", "ace-bailey", 14, 3),
    sbc("Dylan Harper — Mid rookies", "dylan-harper", 10, 4),
  ],
  1: [
    sbc("Dylan Harper Parallels / Inserts", "dylan-harper", 15, 4, "refractor"),
    sbc("Cooper Flagg — Hot Refractor", "cooper-flagg", 35, 2, "refractor"),
    sbc("Ace Bailey — X-Fractor", "ace-bailey", 12, 3, "refractor"),
    sbc("Dylan Harper — Prism parallel", "dylan-harper", 18, 2, "refractor"),
  ],
  2: [
    sbc("Cooper Flagg — Auto chance", "cooper-flagg", 200, 1, "auto"),
    sbc("Ace Bailey — Numbered parallel", "ace-bailey", 80, 2, "refractor"),
    sbc("Dylan Harper — Lower Auto", "dylan-harper", 45, 3, "auto"),
    sbc("Cooper Flagg numbered chance", "cooper-flagg", 120, 1, "refractor"),
  ],
};

const op16Pack: ProductPools = {
  0: [
    opc("Nami", "OP16-091", 0.12, 4),
    opc("Usopp", "OP16-043", 0.15, 4),
    opc("Monkey.D.Garp", "OP16-075", 0.3, 4),
    opc("Portgas.D.Ace — Common", "OP16-049", 0.35, 3),
    opc("Tony Tony.Chopper", "OP16-090", 0.2, 3),
  ],
  1: [
    opc("Marco — Rare", "OP16-014", 1.1, 4),
    opc("Roronoa Zoro", "OP16-035", 2, 3),
    opc("Sanji", "OP16-086", 2.8, 2),
    opc("Nami — Rare", "OP16-091", 1.6, 3),
  ],
  2: [
    opc("Edward.Newgate (SR)", "OP16-003", 6, 4),
    opc("Monkey.D.Luffy (SR)", "OP16-015", 12, 3),
    opc("Boa Hancock (SR)", "OP16-032", 18, 1),
    opc("Emporio.Ivankov (SR)", "OP16-026", 8, 2),
  ],
  3: [
    // OP16 SECs are Ace + Teach — not Luffy (Luffy SEC is OP09-119).
    opc("Portgas.D.Ace (SEC)", "OP16-118", 65, 2),
    opc("Marshall.D.Teach (SEC)", "OP16-119", 35, 4),
    opc("Monkey.D.Luffy (SR)", "OP16-015", 22, 3),
    opc("Yamato (SR)", "OP16-098", 28, 2),
  ],
  4: [
    opc("Sakazuki — Admiral chase", "OP16-065", 350, 1),
    opc("Kuzan — Admiral chase", "OP16-063", 160, 3),
    opc("Borsalino — Admiral chase", "OP16-073", 90, 3),
    opc("Portgas.D.Ace (SEC)", "OP16-118", 110, 2),
  ],
};

const op16Box: ProductPools = {
  0: [
    opc("Portgas.D.Ace — Leader art", "OP16-001", 18, 3),
    opc("Roronoa Zoro / Sanji haul", "OP16-035", 24, 3),
    opc("Monkey.D.Garp + bulk", "OP16-075", 28, 2),
    opc("Nami / Usopp rare haul", "OP16-091", 22, 2),
  ],
  1: [
    opc("Edward.Newgate + SRs", "OP16-003", 35, 3),
    opc("Monkey.D.Luffy (SR) haul", "OP16-015", 45, 3),
    opc("Boa Hancock + SRs", "OP16-032", 55, 2),
  ],
  2: [
    opc("Portgas.D.Ace (SEC)", "OP16-118", 65, 2),
    opc("Marshall.D.Teach (SEC)", "OP16-119", 35, 4),
    opc("Monkey.D.Luffy (SR)", "OP16-015", 22, 3),
  ],
  3: [
    opc("Sakazuki — Admiral chase", "OP16-065", 350, 1),
    opc("Kuzan — Admiral chase", "OP16-063", 160, 3),
    opc("Portgas.D.Ace (SEC)", "OP16-118", 90, 3),
  ],
};

const op09Pack: ProductPools = {
  0: [
    opc("Usopp — Common", "OP09-024", 0.12, 5),
    opc("Sanji — Common", "OP09-028", 0.28, 4),
    opc("Karasu", "OP09-100", 0.4, 3),
    opc("Monkey.D.Luffy — Common", "OP09-036", 0.18, 4),
  ],
  1: [
    opc("Nami — Rare", "OP09-050", 1.1, 4),
    opc("Roronoa Zoro — Rare", "OP09-076", 2.1, 3),
    opc("Trafalgar Law — Rare", "OP09-069", 2.9, 2),
    opc("Silvers Rayleigh — Rare", "OP09-005", 1.5, 3),
  ],
  2: [
    opc("Sanji (SR)", "OP09-065", 7, 4),
    opc("Shanks (SR)", "OP09-004", 14, 3),
    opc("Benn.Beckman (SR)", "OP09-009", 20, 1),
    opc("Franky (SR)", "OP09-072", 9, 2),
  ],
  3: [
    opc("Monkey.D.Luffy (SEC)", "OP09-119", 80, 2),
    opc("Gol.D.Roger (SEC)", "OP09-118", 40, 4),
    opc("Shanks (SR)", "OP09-004", 25, 3),
    opc("Nami — Rare splash", "OP09-050", 32, 2),
  ],
  4: [
    // Manga/SP chases: Scrydex base IDs still show the character (SAMPLE watermark from CDN).
    opc("Monkey.D.Luffy (SEC) — Manga chase", "OP09-119", 400, 1),
    opc("Gol.D.Roger (SEC) — Manga chase", "OP09-118", 180, 3),
    opc("Shanks (SR) — Manga chase", "OP09-004", 100, 3),
    opc("Marshall.D.Teach (SR)", "OP09-093", 130, 2),
  ],
};


/** Blaster pools: [displayName, slug] tuples keep name↔art locked. */
type BlasterPlayer = [string, string];
const blasterSports = (players: [BlasterPlayer, BlasterPlayer, BlasterPlayer, BlasterPlayer?]): ProductPools => {
  const [a, b, c, d] = players;
  const fourth = d ?? b;
  return {
    0: [
      sbc(`${a[0]} — Base`, a[1], 8, 3),
      sbc(`${b[0]} — Base / inserts`, b[1], 6, 4),
      sbc(`${c[0]} — Base`, c[1], 5.5, 3),
      sbc(`${b[0]} — Base + inserts stack`, b[1], 5, 4),
    ],
    1: [
      sbc(`${a[0]} — Parallel / Refractor`, a[1], 25, 2, "refractor"),
      sbc(`${c[0]} — Rookie parallel`, c[1], 14, 3, "refractor"),
      sbc(`${b[0]} — Color parallel`, b[1], 12, 3, "refractor"),
      sbc(`${c[0]} — Parallels / rookies mix`, c[1], 8, 4, "refractor"),
    ],
    2: [
      sbc(`${a[0]} — Numbered / Auto chance`, a[1], 90, 1, "auto"),
      sbc(`${b[0]} — Numbered parallel hit`, b[1], 40, 2, "refractor"),
      sbc(`${c[0]} — Lower auto / relic`, c[1], 25, 3, "auto"),
      sbc(`${fourth[0]} — Auto adjacent`, fourth[1], 55, 2, "auto"),
    ],
  };
};

const blasterBball = (players: [BlasterPlayer, BlasterPlayer, BlasterPlayer, BlasterPlayer?]): ProductPools => {
  const [a, b, c, d] = players;
  const fourth = d ?? b;
  return {
    0: [
      sbc(`${a[0]} — Base`, a[1], 10, 3),
      sbc(`${b[0]} — Base / inserts`, b[1], 7, 4),
      sbc(`${c[0]} — Base`, c[1], 6.5, 3),
      sbc(`${b[0]} — Base + inserts stack`, b[1], 6, 4),
    ],
    1: [
      sbc(`${a[0]} — Parallel`, a[1], 28, 2, "refractor"),
      sbc(`${c[0]} — Rookie parallel`, c[1], 16, 3, "refractor"),
      sbc(`${b[0]} — Color parallel`, b[1], 14, 3, "refractor"),
      sbc(`${c[0]} — Parallels / courtside mix`, c[1], 10, 4, "refractor"),
    ],
    2: [
      sbc(`${a[0]} — Numbered / Auto chance`, a[1], 110, 1, "auto"),
      sbc(`${b[0]} — Numbered parallel hit`, b[1], 50, 2, "refractor"),
      sbc(`${c[0]} — Lower auto chance`, c[1], 30, 3, "auto"),
      sbc(`${fourth[0]} — Auto adjacent`, fourth[1], 65, 2, "auto"),
    ],
  };
};

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
    ["Elly De La Cruz", "elly-de-la-cruz"],
    ["Paul Skenes", "paul-skenes"],
    ["Jackson Holliday", "jackson-holliday"],
    ["Junior Caminero", "junior-caminero"],
  ]),
  "base-heritage-blaster": blasterSports([
    ["Paul Skenes Heritage", "paul-skenes"],
    ["Elly De La Cruz Heritage", "elly-de-la-cruz"],
    ["Jackson Holliday Heritage", "jackson-holliday"],
    ["Wyatt Langford Heritage", "wyatt-langford"],
  ]),
  "bball-chrome-update-hobby": bballChromeHobby,
  "bball-chrome-update-value": bballChromeValue,
  "bball-chrome-update-mega": {
    0: bballChromeValue[0]!,
    1: [
      sbc("Dylan Harper numbered parallels", "dylan-harper", 25, 3, "refractor"),
      sbc("Cooper Flagg numbered", "cooper-flagg", 55, 2, "refractor"),
      sbc("Ace Bailey mid numbered haul", "ace-bailey", 18, 3, "refractor"),
      sbc("Ace Bailey parallel", "ace-bailey", 30, 2, "refractor"),
    ],
    2: bballChromeValue[1]!,
    3: bballChromeValue[2]!,
  },
  "bball-hoops-blaster": blasterBball([
    ["Cooper Flagg Hoops", "cooper-flagg"],
    ["Dylan Harper Hoops", "dylan-harper"],
    ["Ace Bailey Hoops", "ace-bailey"],
    ["Dylan Harper Hoops", "dylan-harper"],
  ]),
  "bball-select-blaster": blasterBball([
    ["Select Courtside — Cooper Flagg", "cooper-flagg"],
    ["Select Concourse — Ace Bailey", "ace-bailey"],
    ["Select Premier — Dylan Harper", "dylan-harper"],
    ["Cooper Flagg Select", "cooper-flagg"],
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
