/**
 * Illustrative card pools for the free /open simulator.
 * When a slot hits, we pick a named card (art + est $) so reveals feel like
 * a card hit the table — not a spreadsheet tier label.
 *
 * Pool estValues are weighted to average near each slot's catalog avgValue
 * so long-run EV stays honest (still oddsNum × slot avg).
 * Names/art are public/example pools — not a guarantee of that exact pull.
 */

import type { ArtStatus, Category, Product, RaritySlot } from "@/lib/products";

/** Branded card back when we lack that card's real art — never show another set's art. */
export const RIP_PORTAL_CARD_BACK = "/cards/rip-portal-card-back.svg";

/** True when URL is missing or our branded pack-only back (no real card art). */
export function isBrandedCardBack(imageUrl?: string | null): boolean {
  if (!imageUrl) return true;
  return (
    imageUrl === RIP_PORTAL_CARD_BACK ||
    imageUrl.endsWith("/cards/rip-portal-card-back.svg")
  );
}

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
 * Keep name + Scrydex pokemon id adjacent — same honesty rule as opc.
 * Never pair a name with art from another card/set.
 */
const poke = (
  name: string,
  id: string,
  estValue: number,
  weight?: number
): PoolCard => ({
  name,
  imageUrl: S(id),
  estValue,
  ...(weight !== undefined ? { weight } : {}),
});
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
    poke("Erika's Oddish", "me2pt5-1", 0.12, 8),
    poke("Charmander", "me2pt5-20", 0.16, 6),
    poke("Psyduck", "me2pt5-39", 0.24, 5),
    poke("Dratini", "me2pt5-150", 0.2, 5),
    poke("Totodile", "me2pt5-41", 0.24, 4),
    poke("Ethan's Slugma", "me2pt5-23", 0.1, 4),
    poke("N's Darumaka", "me2pt5-32", 0.18, 3),
    poke("Team Rocket's Tarountula", "me2pt5-18", 0.09, 3),
  ],
  1: [
    poke("Mega Charizard Y ex", "me2pt5-22", 7.5, 2),
    poke("Ethan's Ho-Oh ex", "me2pt5-26", 0.89, 4),
    poke("Cinderace ex", "me2pt5-38", 0.82, 4),
    poke("Mega Meganium ex", "me2pt5-10", 1.13, 3),
    poke("Erika's Vileplume ex", "me2pt5-3", 0.79, 3),
  ],
  2: [
    poke("Psyduck — Illustration Rare", "me2pt5-226", 70, 1),
  ],
  3: [
    poke("Mega Charizard Y ex", "me2pt5-22", 1.7, 3),
    poke("Ethan's Ho-Oh ex", "me2pt5-26", 1.1, 4),
    poke("Cinderace ex", "me2pt5-38", 2.4, 3),
  ],
  4: [
    poke("Mega Feraligatr ex — Mega Attack Rare", "me2pt5-274", 40, 2),
    poke("Mega Charizard Y ex", "me2pt5-22", 16, 4),
    poke("Ethan's Ho-Oh ex", "me2pt5-26", 10, 4),
  ],
  5: [
    poke("Mega Gengar ex SIR", "me2pt5-284", 1120, 1),
    poke("Pikachu ex SIR (276)", "me2pt5-276", 1100, 1),
    poke("Mega Dragonite ex SIR", "me2pt5-290", 710, 2),
    poke("Pikachu ex SIR (277)", "me2pt5-277", 380, 4),
    poke("Team Rocket's Mewtwo ex SIR", "me2pt5-281", 380, 4),
    poke("Lillie's Clefairy ex SIR", "me2pt5-280", 170, 7),
    poke("N's Zoroark ex SIR", "me2pt5-286", 165, 7),
    poke("Mega Feraligatr ex SIR", "me2pt5-274", 155, 7),
    poke("Steven's Metagross ex SIR", "me2pt5-289", 90, 8),
    poke("Mega Diancie ex SIR", "me2pt5-282", 55, 8),
  ],
  6: [
    poke("Mega Charizard Y ex — Mega Hyper Rare", "me2pt5-294", 420, 3),
    poke("Mega Dragonite ex — Mega Hyper Rare", "me2pt5-295", 250, 2),
  ],
};

const ascendedEtb: ProductPools = {
  0: [
    poke("Erika's Oddish — bulk commons", "me2pt5-1", 4, 3),
    poke("Charmander — reverse / uncommon stack", "me2pt5-20", 7, 3),
    poke("Psyduck — better bulk", "me2pt5-39", 10, 2),
    poke("Dratini — popular reverses", "me2pt5-150", 8, 2),
  ],
  1: [
    poke("Psyduck — Illustration Rare", "me2pt5-226", 35, 2),
    poke("Psyduck — Illustration Rare", "me2pt5-226", 28, 3),
    poke("Ethan's Ho-Oh ex", "me2pt5-26", 22, 3),
    poke("Cinderace ex", "me2pt5-38", 30, 2),
  ],
  2: [
    poke("Mega Feraligatr ex — Mega Attack Rare", "me2pt5-274", 24, 2),
    poke("Mega Charizard Y ex — Double Rare", "me2pt5-22", 18, 3),
    poke("Mega Charizard Y ex", "me2pt5-22", 14, 3),
  ],
  3: [
    poke("Mega Gengar ex SIR", "me2pt5-284", 1120, 1),
    poke("Pikachu ex SIR", "me2pt5-276", 1100, 1),
    poke("Mega Dragonite ex SIR", "me2pt5-290", 710, 2),
    poke("Lillie's Clefairy ex SIR", "me2pt5-280", 170, 5),
    poke("N's Zoroark ex SIR", "me2pt5-286", 165, 5),
    poke("Team Rocket's Mewtwo ex SIR", "me2pt5-281", 380, 2),
    poke("Steven's Metagross ex SIR", "me2pt5-289", 70, 6),
  ],
  4: [
    poke("Mega Charizard Y ex — Mega Hyper Rare", "me2pt5-294", 420, 3),
    poke("Mega Dragonite ex — Mega Hyper Rare", "me2pt5-295", 220, 2),
  ],
};

const ascendedBundle: ProductPools = {
  0: [
    poke("Erika's Oddish — bulk across 6 packs", "me2pt5-1", 3.5, 3),
    poke("Charmander — reverse holo stack", "me2pt5-20", 4.8, 3),
    poke("Psyduck — better bulk", "me2pt5-39", 6.5, 2),
  ],
  1: [
    poke("Psyduck — Illustration Rare", "me2pt5-226", 28, 2),
    poke("Psyduck — Illustration Rare", "me2pt5-226", 18, 4),
    poke("Ethan's Ho-Oh ex", "me2pt5-26", 14, 3),
  ],
  2: [
    poke("Mega Charizard Y ex", "me2pt5-22", 12, 3),
    poke("Mega Feraligatr ex — MAR", "me2pt5-274", 18, 2),
    poke("Cinderace ex", "me2pt5-38", 8, 3),
  ],
  3: [
    poke("Mega Gengar ex SIR", "me2pt5-284", 1120, 1),
    poke("Pikachu ex SIR", "me2pt5-276", 1100, 1),
    poke("Team Rocket's Mewtwo ex SIR", "me2pt5-281", 380, 3),
    poke("Lillie's Clefairy ex SIR", "me2pt5-280", 170, 5),
    poke("Steven's Metagross ex SIR", "me2pt5-289", 70, 6),
  ],
  4: [
    poke("Mega Charizard Y ex — Mega Hyper Rare", "me2pt5-294", 420, 3),
    poke("Mega Dragonite ex — Mega Hyper Rare", "me2pt5-295", 200, 2),
  ],
};

const prismaticPack: ProductPools = {
  0: [
    poke("Eevee", "sv8pt5-1", 0.12, 5),
  ],
  1: [
    poke("Eevee", "sv8pt5-1", 1.5, 3),
  ],
  2: [
    poke("Espeon ex", "sv8pt5-155", 14, 2),
    poke("Sylveon ex", "sv8pt5-156", 12, 2),
    poke("Leafeon ex", "sv8pt5-144", 9, 3),
    poke("Umbreon ex", "sv8pt5-161", 18, 1),
  ],
  3: [
    poke("Eevee", "sv8pt5-1", 16, 3),
    poke("Leafeon ex", "sv8pt5-144", 35, 2),
    poke("Espeon ex", "sv8pt5-155", 28, 2),
    poke("Sylveon ex", "sv8pt5-156", 30, 2),
  ],
  4: [
    poke("Umbreon ex SIR", "sv8pt5-161", 450, 1),
    poke("Sylveon ex SIR", "sv8pt5-156", 220, 3),
    poke("Espeon ex SIR", "sv8pt5-155", 120, 5),
    poke("Leafeon ex SIR", "sv8pt5-144", 95, 4),
  ],
  5: [
    poke("Umbreon ex SIR", "sv8pt5-161", 1400, 1),
    poke("Sylveon ex SIR", "sv8pt5-156", 700, 2),
    poke("Espeon ex SIR", "sv8pt5-155", 500, 2),
  ],
};

const surgingPack: ProductPools = {
  0: [
    poke("Exeggcute", "sv8-1", 0.13, 5),
    poke("Pikachu line — Quaxly", "sv8-50", 0.2, 4),
    poke("Annihilape", "sv8-100", 0.35, 4),
    poke("Eevee", "sv8-143", 0.45, 3),
    poke("Snorlax", "sv8-144", 0.55, 2),
  ],
  1: [
    poke("Skeledirge", "sv8-31", 0.85, 4),
    poke("Chien-Pao", "sv8-56", 1.2, 3),
    poke("Dialga", "sv8-135", 1.5, 2),
    poke("Palkia", "sv8-136", 1.4, 2),
  ],
  2: [
    poke("Pikachu ex", "sv8-57", 12, 1),
    poke("Latias ex", "sv8-76", 6, 2),
    poke("Ceruledge ex", "sv8-36", 4, 4),
    poke("Sylveon ex", "sv8-86", 5, 3),
    poke("Hydreigon ex", "sv8-119", 3.5, 3),
  ],
  3: [
    poke("Latios — Illustration Rare", "sv8-203", 35, 1),
    poke("Ceruledge — Illustration Rare", "sv8-197", 25, 2),
    poke("Feebas — Illustration Rare", "sv8-198", 10, 4),
    poke("Spheal — Illustration Rare", "sv8-199", 9, 3),
    poke("Exeggcute — Illustration Rare", "sv8-192", 7, 3),
  ],
  4: [
    poke("Pikachu ex SIR", "sv8-238", 280, 1),
    poke("Latias ex SIR", "sv8-239", 180, 2),
    poke("Milotic ex SIR", "sv8-237", 120, 3),
    poke("Alolan Exeggutor ex SIR", "sv8-242", 45, 4),
    poke("Archaludon ex SIR", "sv8-241", 25, 4),
    poke("Pikachu ex — Hyper Rare", "sv8-247", 85, 2),
  ],
};

const destinedPack: ProductPools = {
  0: [
    poke("Pinsir", "sv10-1", 0.15, 5),
    poke("Ethan's Cyndaquil", "sv10-32", 0.25, 4),
    poke("Team Rocket's Houndour", "sv10-37", 0.2, 4),
    poke("Torchic", "sv10-40", 0.3, 3),
  ],
  1: [
    poke("Ethan's Typhlosion", "sv10-34", 1.2, 3),
    poke("Cynthia's Roserade", "sv10-8", 0.95, 4),
    poke("Team Rocket's Spidops", "sv10-20", 0.9, 3),
    poke("Blaziken", "sv10-42", 1.1, 2),
  ],
  2: [
    poke("Ethan's Ho-Oh ex", "sv10-39", 5, 2),
    poke("Team Rocket's Mewtwo ex", "sv10-81", 8, 1),
    poke("Yanmega ex", "sv10-3", 3.5, 4),
    poke("Arboliva ex", "sv10-23", 4, 3),
  ],
  3: [
    poke("Misty's Psyduck — Illustration Rare", "sv10-193", 55, 1),
    poke("Team Rocket's Meowth — Illustration Rare", "sv10-203", 22, 3),
  ],
  4: [
    poke("Team Rocket's Mewtwo ex SIR", "sv10-231", 320, 1),
    poke("Ethan's Ho-Oh ex SIR", "sv10-230", 160, 2),
    poke("Cynthia's Garchomp ex SIR", "sv10-232", 120, 3),
    poke("Team Rocket's Moltres ex SIR", "sv10-229", 80, 4),
    poke("Team Rocket's Mewtwo ex — Hyper Rare", "sv10-240", 65, 3),
  ],
};

const journeyPack: ProductPools = {
  0: [
    poke("Caterpie", "sv9-1", 0.12, 5),
    poke("Hop's Wooloo", "sv9-135", 0.25, 4),
  ],
  1: [
    poke("Hop's Wooloo", "sv9-135", 1.1, 3),
    poke("Caterpie", "sv9-1", 0.85, 3),
  ],
  2: [
    poke("N's Zoroark ex", "sv9-98", 5, 2),
    poke("Iono's Bellibolt ex", "sv9-53", 4, 3),
  ],
  3: [
    poke("Hop's Wooloo — Illustration Rare", "sv9-170", 20, 2),
    poke("N's Zoroark ex", "sv9-98", 12, 2),
    poke("Iono's Bellibolt ex", "sv9-53", 10, 3),
  ],
  4: [
    poke("N's Zoroark ex SIR", "sv9-185", 220, 1),
    poke("Iono's Bellibolt ex SIR", "sv9-183", 90, 3),
  ],
};

const obsidianPack: ProductPools = {
  0: [
    poke("Oddish", "sv3-1", 0.12, 5),
  ],
  1: [
    poke("Oddish", "sv3-1", 1.0, 3),
    poke("Charizard ex", "sv3-125", 1.5, 2),
  ],
  2: [
    poke("Charizard ex", "sv3-125", 8, 2),
    poke("Pidgeot ex", "sv3-164", 5, 3),
    poke("Charizard ex — Ultra Rare", "sv3-215", 6, 2),
  ],
  3: [
    poke("Ninetales — Illustration Rare", "sv3-199", 35, 2),
    poke("Cleffa — Illustration Rare", "sv3-202", 30, 2),
    poke("Gloom — Illustration Rare", "sv3-198", 18, 3),
    poke("Pidgey — Illustration Rare", "sv3-207", 12, 4),
  ],
  4: [
    poke("Charizard ex SIR", "sv3-223", 180, 1),
    poke("Pidgeot ex SIR", "sv3-225", 45, 3),
    poke("Charizard ex — Ultra Rare", "sv3-215", 55, 3),
    poke("Charizard ex — Hyper Rare", "sv3-228", 70, 2),
  ],
};

const temporalPack: ProductPools = {
  0: [
    poke("Iron Leaves ex", "sv5-203", 0.5, 1),
    poke("Walking Wake ex", "sv5-205", 0.5, 1),
  ],
  1: [
    poke("Iron Leaves ex", "sv5-203", 1.2, 1),
    poke("Walking Wake ex", "sv5-205", 1.2, 1),
  ],
  2: [
    poke("Iron Leaves ex", "sv5-203", 5, 1),
    poke("Walking Wake ex", "sv5-205", 5, 1),
  ],
  3: [
    poke("Iron Leaves ex", "sv5-203", 14, 1),
    poke("Walking Wake ex", "sv5-205", 14, 1),
  ],
  4: [
    poke("Iron Leaves ex SIR", "sv5-203", 120, 2),
    poke("Walking Wake ex SIR", "sv5-205", 100, 2),
  ],
};

const paradoxPack: ProductPools = {
  0: [
    poke("Roaring Moon ex SIR", "sv4-248", 0.5, 1),
    poke("Iron Valiant ex SIR", "sv4-251", 0.5, 1),
  ],
  1: [
    poke("Roaring Moon ex SIR", "sv4-248", 1.2, 1),
    poke("Iron Valiant ex SIR", "sv4-251", 1.2, 1),
  ],
  2: [
    poke("Roaring Moon ex SIR", "sv4-248", 6, 1),
    poke("Iron Valiant ex SIR", "sv4-251", 5, 1),
  ],
  3: [
    poke("Roaring Moon ex SIR", "sv4-248", 18, 1),
    poke("Iron Valiant ex SIR", "sv4-251", 14, 1),
  ],
  4: [
    poke("Roaring Moon ex SIR", "sv4-248", 160, 1),
    poke("Iron Valiant ex SIR", "sv4-251", 90, 2),
  ],
};

const paldeaPack: ProductPools = {
  0: [
    poke("Sprigatito", "sv2-1", 0.12, 5),
  ],
  1: [
    poke("Sprigatito", "sv2-1", 1.0, 3),
  ],
  2: [
    poke("Iono SIR", "sv2-269", 5, 2),
    poke("Sprigatito", "sv2-1", 3, 3),
  ],
  3: [
    poke("Iono SIR", "sv2-269", 18, 2),
    poke("Sprigatito", "sv2-1", 8, 3),
  ],
  4: [
    poke("Iono SIR", "sv2-269", 180, 1),
  ],
};

const chaosRising: ProductPools = {
  0: [
    poke("Weedle", "me4-1", 0.09, 5),
    poke("Froakie", "me4-20", 0.18, 4),
    poke("Golbat", "me4-50", 0.2, 4),
    poke("Chespin", "me4-5", 0.15, 3),
  ],
  1: [
    poke("Mega Greninja ex", "me4-22", 2.5, 2),
    poke("Mega Pyroar ex", "me4-15", 2.0, 3),
    poke("Mega Floette ex", "me4-35", 2.2, 3),
    poke("Beedrill ex", "me4-3", 1.8, 4),
    poke("Cinccino ex", "me4-73", 2.4, 2),
  ],
  2: [
    poke("Mega Greninja ex — Ultra Rare", "me4-100", 9, 2),
    poke("Mega Floette ex — Ultra Rare", "me4-101", 5, 3),
    poke("Mega Dragalge ex — Ultra Rare", "me4-104", 4, 3),
    poke("Cinccino ex — Ultra Rare", "me4-105", 6, 2),
  ],
  3: [
    poke("Froakie — Illustration Rare", "me4-88", 12, 2),
    poke("Ampharos — Illustration Rare", "me4-90", 10, 3),
    poke("Xerneas — Illustration Rare", "me4-91", 9, 3),
    poke("Chespin — Illustration Rare", "me4-87", 6, 4),
  ],
  4: [
    poke("Mega Greninja ex SIR", "me4-116", 160, 1),
    poke("Cinccino ex SIR", "me4-119", 50, 3),
    poke("Mega Dragalge ex SIR", "me4-118", 35, 3),
    poke("Mega Floette ex SIR", "me4-117", 25, 4),
  ],
  5: [
    poke("Mega Greninja ex — Mega Hyper Rare", "me4-122", 400, 2),
  ],
};

const perfectOrder: ProductPools = {
  0: [
    poke("Spinarak", "me3-1", 0.1, 5),
    poke("Rowlet", "me3-10", 0.15, 4),
    poke("Gastly", "me3-48", 0.2, 4),
    poke("Clefairy", "me3-30", 0.18, 3),
  ],
  1: [
    poke("Mega Zygarde ex", "me3-47", 2.5, 2),
    poke("Mega Starmie ex", "me3-21", 2.2, 3),
    poke("Mega Clefable ex", "me3-31", 2.0, 3),
    poke("Meowth ex", "me3-62", 3.5, 2),
    poke("Decidueye ex", "me3-12", 1.8, 4),
  ],
  2: [
    poke("Meowth ex — Ultra Rare", "me3-107", 10, 2),
    poke("Mega Zygarde ex — Ultra Rare", "me3-104", 5, 3),
    poke("Mega Starmie ex — Ultra Rare", "me3-102", 6, 3),
    poke("Mega Clefable ex — Ultra Rare", "me3-103", 5, 3),
  ],
  3: [
    poke("Clefairy — Illustration Rare", "me3-94", 16, 2),
    poke("Dedenne — Illustration Rare", "me3-93", 10, 3),
    poke("Rowlet — Illustration Rare", "me3-90", 8, 3),
    poke("Espurr — Illustration Rare", "me3-95", 6, 4),
  ],
  4: [
    poke("Meowth ex SIR", "me3-121", 200, 1),
    poke("Mega Clefable ex SIR", "me3-119", 55, 3),
    poke("Mega Zygarde ex SIR", "me3-120", 50, 3),
    poke("Mega Starmie ex SIR", "me3-118", 40, 4),
  ],
  5: [
    poke("Mega Zygarde ex — Mega Hyper Rare", "me3-124", 450, 2),
  ],
};

const pitchBlack: ProductPools = {
  0: [
    poke("Tropius", "me5-1", 0.1, 5),
    poke("Slowpoke", "me5-29", 0.25, 4),
    poke("Litwick", "me5-36", 0.2, 4),
    poke("Popplio", "me5-18", 0.15, 3),
  ],
  1: [
    poke("Mega Darkrai ex", "me5-48", 3.0, 2),
    poke("Mega Chandelure ex", "me5-38", 2.5, 3),
    poke("Mega Zeraora ex", "me5-27", 2.2, 3),
    poke("Morpeko ex", "me5-55", 2.0, 3),
    poke("Wailord ex", "me5-16", 1.8, 4),
  ],
  2: [
    poke("Mega Darkrai ex — Ultra Rare", "me5-101", 12, 2),
    poke("Mega Chandelure ex — Ultra Rare", "me5-99", 7, 3),
    poke("Mega Zeraora ex — Ultra Rare", "me5-98", 6, 3),
    poke("Morpeko ex — Ultra Rare", "me5-102", 5, 3),
  ],
  3: [
    poke("Slowbro — Illustration Rare", "me5-90", 14, 2),
    poke("Goldeen — Illustration Rare", "me5-87", 10, 3),
    poke("Primarina — Illustration Rare", "me5-88", 8, 3),
    poke("Armarouge — Illustration Rare", "me5-86", 6, 4),
  ],
  4: [
    poke("Mega Darkrai ex SIR", "me5-116", 250, 1),
    poke("Morpeko ex SIR", "me5-117", 80, 3),
    poke("Mega Zeraora ex SIR", "me5-114", 55, 3),
    poke("Mega Chandelure ex SIR", "me5-115", 45, 4),
  ],
  5: [
    poke("Mega Darkrai ex — Mega Hyper Rare", "me5-120", 500, 2),
  ],
};

/** 30th Celebration — Scrydex set code me55. Name↔id pairs from EN checklist. */
function thirtiethPools(promoName: string, promoId: string): ProductPools {
  const bulk = [
    poke("Exeggcute", "me55-1", 0.25, 4),
    poke("Vulpix", "me55-9", 0.2, 4),
    poke("Slowpoke", "me55-16", 0.3, 3),
    poke("Wishiwashi", "me55-22", 0.25, 3),
    poke("Marill", "me55-67", 0.25, 3),
    poke("Eevee", "me55-116", 0.5, 2),
    poke("Snorlax", "me55-119", 0.7, 2),
    poke("Mew", "me55-65", 1.2, 1),
  ];
  const pikachuRares = [
    poke("Pikachu Rare (#23)", "me55-23", 2.0, 3),
    poke("Pikachu Rare (#27)", "me55-27", 3.6, 2),
    poke("Pikachu Rare (#32)", "me55-32", 3.8, 2),
    poke("Pikachu Rare (#36)", "me55-36", 3.5, 2),
    poke("Pikachu Rare (#40)", "me55-40", 6.8, 1),
    poke("Pikachu Rare (#48)", "me55-48", 2.6, 3),
    poke("Pikachu Rare (#52)", "me55-52", 1.5, 3),
  ];
  const doubleRare = [
    poke("Fuecoco ex", "me55-15", 2.5, 3),
    poke("Greninja ex", "me55-21", 3.0, 3),
    poke("Pikachu ex (#53)", "me55-53", 4.5, 2),
    poke("Pikachu ex (#54)", "me55-54", 3.5, 2),
    poke("Mewtwo ex", "me55-64", 3.0, 2),
    poke("Mew ex", "me55-66", 7.0, 1),
    poke("Espeon ex", "me55-70", 2.5, 2),
    poke("Sylveon ex", "me55-71", 2.4, 2),
    poke("Gengar ex", "me55-90", 4.0, 2),
    poke("Umbreon ex", "me55-92", 3.5, 2),
    poke("Jirachi ex", "me55-102", 2.0, 3),
    poke("Salamence ex", "me55-109", 1.8, 3),
  ];
  const irs = [
    poke("Maushold — Illustration Rare", "me55-146", 28, 1),
    poke("Meowth — Illustration Rare", "me55-144", 21, 2),
    poke("Galarian Meowth — Illustration Rare", "me55-141", 16, 2),
    poke("Alolan Meowth — Illustration Rare", "me55-139", 15, 2),
    poke("Articuno — Illustration Rare", "me55-132", 15, 2),
    poke("Lapras — Illustration Rare", "me55-131", 14, 2),
    poke("Moltres — Illustration Rare", "me55-130", 14, 2),
    poke("Zapdos — Illustration Rare", "me55-133", 12, 2),
    poke("Hisuian Zorua — Illustration Rare", "me55-145", 12, 2),
    poke("Morpeko — Illustration Rare", "me55-135", 11, 3),
    poke("Alolan Exeggutor — Illustration Rare", "me55-129", 5, 4),
  ];
  // Classic Collection reprints are not in Scrydex me55 — omit curated pool
  // so resolveSlotCard falls back to slot label + branded back (honest).
  const sirs = [
    poke("Mew ex SIR", "me55-152", 175, 1),
    poke("Gengar ex SIR", "me55-154", 130, 2),
    poke("Pikachu ex SIR (#150)", "me55-150", 110, 2),
    poke("Pikachu ex SIR (#149)", "me55-149", 92, 2),
    poke("Mewtwo ex SIR", "me55-151", 87, 2),
    poke("Sylveon ex SIR", "me55-153", 72, 3),
    poke("Jirachi ex SIR", "me55-155", 71, 3),
    poke("Greninja ex SIR", "me55-148", 40, 4),
    poke("Salamence ex SIR", "me55-156", 29, 4),
    poke("Fuecoco ex SIR", "me55-147", 23, 5),
  ];
  const futuristic = [
    poke("Mew ex — Futuristic Rare", "me55-158", 110, 2),
    poke("Mewtwo ex — Futuristic Rare", "me55-157", 78, 2),
  ];
  const promo = [
    poke(promoName, promoId, 12, 3),
  ];
  return {
    0: bulk,
    1: pikachuRares,
    2: doubleRare,
    3: irs,
    // 4 Classic Collection: intentionally omitted (no verified me55 art)
    5: sirs,
    6: futuristic,
    7: promo,
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
  "poke-obsidian-pack": obsidianPack,
  "poke-temporal-pack": temporalPack,
  "poke-paradox-pack": paradoxPack,
  "poke-paldea-pack": paldeaPack,
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
  "poke-30th-etb": thirtiethPools("Nidorina (promo)", "me55-88"),
  "poke-30th-pc-etb": thirtiethPools("Nidorina (PC promo)", "me55-88"),
  "poke-30th-bundle": thirtiethPools("Pikachu Rare", "me55-40"),
  "poke-30th-poster": thirtiethPools("Articuno (promo set art)", "me55-132"),
  "poke-30th-tech-sticker-exeggutor": thirtiethPools("Alolan Exeggutor (promo)", "me55-129"),
  "poke-30th-tech-sticker-lucario": thirtiethPools("Lucario (promo)", "me55-83"),
  "poke-30th-ex-box-sylveon": thirtiethPools("Sylveon ex (promo)", "me55-153"),
  "poke-30th-ex-box-greninja": thirtiethPools("Greninja ex (promo)", "me55-148"),
  "poke-30th-knockout": thirtiethPools("Eevee (promo)", "me55-116"),
  "poke-30th-binder": thirtiethPools("Pikachu Rare", "me55-32"),
  "poke-30th-mini-tin": thirtiethPools("Pikachu ex", "me55-149"),
  "poke-30th-upc-day": thirtiethPools("Pikachu ex (day) + Espeon ex", "me55-149"),
  "poke-30th-upc-night": thirtiethPools("Pikachu ex (night) + Umbreon ex", "me55-150"),
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


/** Conservative art readiness for /open. Explicit product.artStatus wins. */
export function getArtStatus(product: Product): ArtStatus {
  if (product.artStatus) return product.artStatus;
  const pools = cardPoolsByProduct[product.id];
  if (!pools) return "none";
  // Has any curated slot pool → pack-only (name/rarity/$ only until marked complete).
  const hasPool = Object.values(pools).some((slot) => slot && slot.length > 0);
  return hasPool ? "pack-only" : "none";
}

export function isFeaturedOpenProduct(product: Product): boolean {
  const status = getArtStatus(product);
  return status === "complete" || status === "pack-only";
}


/** Full official rarity label for pack-only pulls — never bare "SIR" / "… expected". */
export function formatPackOnlySlotLabel(slot: RaritySlot): string {
  let n = slot.name.trim();
  // Drop EV-model "expected" / "expected value" suffixes (catalog math, not a card title).
  n = n.replace(/\s*\(?\s*expected(?:\s+value)?\s*\)?\s*$/i, "").trim();
  n = n.replace(/\s+expected(?:\s+value)?\b/gi, "").trim();

  const catalog: Array<[RegExp, string]> = [
    [/^SIR$/i, "Special Illustration Rare (SIR)"],
    [/^Special Illustration Rare$/i, "Special Illustration Rare (SIR)"],
    [/^IR$/i, "Illustration Rare (IR)"],
    [/^Illustration Rare$/i, "Illustration Rare (IR)"],
    [/^IRs?$/i, "Illustration Rare (IR)"],
    [/^DR$/i, "Double Rare (DR)"],
    [/^Double Rare$/i, "Double Rare (DR)"],
    [/^RR$/i, "Double Rare (RR)"],
    [/^UR$/i, "Ultra Rare (UR)"],
    [/^Ultra Rare$/i, "Ultra Rare (UR)"],
    [/^MAR$/i, "Mega Attack Rare (MAR)"],
    [/^Mega Attack Rare$/i, "Mega Attack Rare (MAR)"],
    [/^MHR$/i, "Mega Hyper Rare (MHR)"],
    [/^Mega Hyper Rare$/i, "Mega Hyper Rare (MHR)"],
    [/^FR$/i, "Futuristic Rare (FR)"],
    [/^Futuristic Rare$/i, "Futuristic Rare (FR)"],
    [/^Classic Collection$/i, "Classic Collection"],
    [/^URs?\s*\/\s*MARs?$/i, "Ultra Rare / Mega Attack Rare"],
    [/^RRs?\s*\+\s*IRs?$/i, "Double Rare + Illustration Rare"],
    [/^IRs?\s+expected$/i, "Illustration Rare (IR)"],
  ];
  for (const [re, label] of catalog) {
    if (re.test(n)) return label;
  }
  // Expand leading acronyms inside longer labels.
  n = n
    .replace(/\bSIR\b/g, "Special Illustration Rare (SIR)")
    .replace(/\bMAR\b/g, "Mega Attack Rare (MAR)")
    .replace(/\bMHR\b/g, "Mega Hyper Rare (MHR)")
    .replace(/\b(?<!Illustration )IR\b/g, "Illustration Rare (IR)");
  // Collapse duplicate expansions if acronym already expanded.
  n = n.replace(
    /Special Illustration Rare \(SIR\) \(SIR\)/g,
    "Special Illustration Rare (SIR)"
  );
  n = n.replace(/\s+/g, " ").trim();
  return n || slot.name.trim();
}

export function resolveSlotCard(
  product: Product,
  slotIndex: number,
  slot: RaritySlot,
  rng: () => number = Math.random
): PoolCard {
  const status = getArtStatus(product);
  // pack-only / none: rarity + slot $ only — branded back, never wrong-set art.
  if (status !== "complete") {
    // Prefer curated pool *names* when present, but always force branded back (no wrong-set art).
    const pool = cardPoolsByProduct[product.id]?.[slotIndex];
    if (pool && pool.length > 0) {
      const scaled = scalePoolToSlotAvg(pool, slot.avgValue);
      const pick = pickWeightedCard(scaled, rng);
      const label = pick.name?.trim() || formatPackOnlySlotLabel(slot);
      return {
        name: label,
        imageUrl: RIP_PORTAL_CARD_BACK,
        estValue:
          typeof pick.estValue === "number" && pick.estValue > 0
            ? pick.estValue
            : slot.avgValue,
      };
    }
    return {
      name: formatPackOnlySlotLabel(slot),
      imageUrl: RIP_PORTAL_CARD_BACK,
      // Always anchor to catalog slot avg — never ship $0.00 when the slot has value.
      estValue: slot.avgValue,
    };
  }
  const pool = cardPoolsByProduct[product.id]?.[slotIndex];
  if (pool && pool.length > 0) {
    const scaled = scalePoolToSlotAvg(pool, slot.avgValue);
    const pick = pickWeightedCard(scaled, rng);
    return {
      ...pick,
      imageUrl: pick.imageUrl || RIP_PORTAL_CARD_BACK,
    };
  }
  // Complete but missing a slot pool: still avoid inventing names/art.
  return {
    name: slot.name,
    imageUrl: RIP_PORTAL_CARD_BACK,
    estValue: slot.avgValue,
  };
}

/** Illustrative zero-$ fillers so empty/miss packs still feel like a pack open. */
export function emptyPackFillers(
  product: Product,
  rng: () => number = Math.random
): PoolCard[] {
  const status = getArtStatus(product);
  const count = 2 + (rng() < 0.5 ? 1 : 0);
  const bulkSlot = product.slots[0];
  const bulkName = bulkSlot
    ? formatPackOnlySlotLabel(bulkSlot)
    : "Bulk";
  // pack-only/none: official slot labels only — branded back, no invented names/art.
  if (status !== "complete") {
    return Array.from({ length: count }, () => ({
      name: bulkName,
      imageUrl: RIP_PORTAL_CARD_BACK,
      estValue: 0,
      weight: 1,
    }));
  }
  const pool0 = cardPoolsByProduct[product.id]?.[0];
  const out: PoolCard[] = [];
  for (let i = 0; i < count; i++) {
    if (pool0 && pool0.length > 0) {
      const pick = pickWeightedCard(pool0, rng);
      out.push({
        name: pick.name,
        imageUrl: pick.imageUrl || RIP_PORTAL_CARD_BACK,
        estValue: 0,
        weight: 1,
      });
    } else {
      out.push({
        name: bulkName,
        imageUrl: RIP_PORTAL_CARD_BACK,
        estValue: 0,
        weight: 1,
      });
    }
  }
  return out;
}

export const CARD_POOL_DISCLAIMER =
  "Illustrative card names & art for the vibe — not a promise you'll pull that exact card. $ estimates follow our EV slot model, not live market quotes.";
