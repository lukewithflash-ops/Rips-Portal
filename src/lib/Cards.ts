export type CardGame = "pokemon" | "baseball" | "basketball" | "onepiece";

export interface ChaseCard {
  id: string;
  name: string;
  set: string;
  number?: string;
  rarity: string;
  game: CardGame;
  rawLow: number;
  rawHigh: number;
  rawMid: number;
  psa9?: number;
  psa10?: number;
  notes?: string;
  emoji?: string;
}

/** Curated chase list — illustrative mid-2026 ranges. Update periodically. */
export const chaseCards: ChaseCard[] = [
  {
    id: "ah-gengar-sir",
    name: "Mega Gengar ex",
    set: "Ascended Heroes",
    number: "284/217",
    rarity: "Special Illustration Rare (SIR)",
    game: "pokemon",
    rawLow: 950,
    rawHigh: 1300,
    rawMid: 1120,
    psa9: 1200,
    psa10: 2800,
    notes: "Top chase of the set. High liquidity.",
    emoji: "👻",
  },
  {
    id: "ah-pikachu-276",
    name: "Pikachu ex",
    set: "Ascended Heroes",
    number: "276/217",
    rarity: "Special Illustration Rare (SIR)",
    game: "pokemon",
    rawLow: 1000,
    rawHigh: 1200,
    rawMid: 1100,
    psa9: 1150,
    psa10: 3200,
    notes: "Treekachu art. Strong PSA 10 premium.",
    emoji: "⚡",
  },
  {
    id: "ah-dragonite-sir",
    name: "Mega Dragonite ex",
    set: "Ascended Heroes",
    number: "290/217",
    rarity: "Special Illustration Rare (SIR)",
    game: "pokemon",
    rawLow: 650,
    rawHigh: 800,
    rawMid: 710,
    psa9: 750,
    psa10: 1800,
    notes: "Third major SIR chase.",
    emoji: "🐉",
  },
  {
    id: "ah-charizard-gold",
    name: "Mega Charizard Y ex",
    set: "Ascended Heroes",
    number: "294/217",
    rarity: "Mega Hyper Rare (Gold)",
    game: "pokemon",
    rawLow: 380,
    rawHigh: 480,
    rawMid: 420,
    psa9: 500,
    psa10: 1400,
    notes: "Gold hyper rare — tough grade.",
    emoji: "🔥",
  },
  {
    id: "ah-pikachu-277",
    name: "Pikachu ex",
    set: "Ascended Heroes",
    number: "277/217",
    rarity: "Special Illustration Rare (SIR)",
    game: "pokemon",
    rawLow: 350,
    rawHigh: 420,
    rawMid: 380,
    psa9: 420,
    psa10: 1100,
    notes: "Alternate Pikachu SIR.",
    emoji: "⚡",
  },
  {
    id: "ah-mewtwo",
    name: "Team Rocket's Mewtwo ex",
    set: "Ascended Heroes",
    number: "281/217",
    rarity: "Special Illustration Rare (SIR)",
    game: "pokemon",
    rawLow: 340,
    rawHigh: 420,
    rawMid: 380,
    psa9: 400,
    psa10: 1000,
    notes: "Nostalgia demand.",
    emoji: "🧠",
  },
  {
    id: "ah-clefairy",
    name: "Lillie's Clefairy ex",
    set: "Ascended Heroes",
    number: "280/217",
    rarity: "Special Illustration Rare (SIR)",
    game: "pokemon",
    rawLow: 150,
    rawHigh: 190,
    rawMid: 170,
    psa9: 200,
    psa10: 550,
    notes: "Trainer Pokémon appeal.",
    emoji: "🎀",
  },
  {
    id: "ah-zoroark",
    name: "N's Zoroark ex",
    set: "Ascended Heroes",
    number: "286/217",
    rarity: "Special Illustration Rare (SIR)",
    game: "pokemon",
    rawLow: 140,
    rawHigh: 180,
    rawMid: 165,
    psa9: 190,
    psa10: 650,
    notes: "Solid mid-tier SIR.",
    emoji: "🦊",
  },
  {
    id: "ah-feraligatr",
    name: "Mega Feraligatr ex",
    set: "Ascended Heroes",
    number: "274/217",
    rarity: "Special Illustration Rare / MAR",
    game: "pokemon",
    rawLow: 130,
    rawHigh: 170,
    rawMid: 155,
    psa9: 180,
    psa10: 500,
    notes: "Starter Mega chase.",
    emoji: "🐊",
  },
  {
    id: "ah-psyduck",
    name: "Psyduck",
    set: "Ascended Heroes",
    number: "226/217",
    rarity: "Illustration Rare (IR)",
    game: "pokemon",
    rawLow: 55,
    rawHigh: 85,
    rawMid: 70,
    psa9: 90,
    psa10: 250,
    notes: "Popular IR; grades well.",
    emoji: "🦆",
  },
  {
    id: "mlb-kurtz-red",
    name: "Nick Kurtz Red Refractor /5",
    set: "2025 Topps Chrome Update",
    number: "USC178",
    rarity: "Red Refractor",
    game: "baseball",
    rawLow: 1500,
    rawHigh: 2200,
    rawMid: 1900,
    psa9: 2100,
    psa10: 4500,
    notes: "Low-numbered RC parallel — high variance.",
    emoji: "⚾",
  },
  {
    id: "mlb-skenes-helix",
    name: "Paul Skenes Helix",
    set: "2025 Topps Chrome Update Helix",
    number: "HX-18",
    rarity: "Helix Insert",
    game: "baseball",
    rawLow: 250,
    rawHigh: 350,
    rawMid: 290,
    psa9: 450,
    psa10: 950,
    notes: "Insert chase; PSA 10 premium strong.",
    emoji: "⚾",
  },
  {
    id: "mlb-wood-red",
    name: "James Wood Red Refractor /5",
    set: "2025 Topps Chrome Update",
    number: "USC95",
    rarity: "Red Refractor",
    game: "baseball",
    rawLow: 450,
    rawHigh: 650,
    rawMid: 550,
    psa9: 800,
    psa10: 2300,
    notes: "Prospect demand.",
    emoji: "⚾",
  },
  {
    id: "op-luffy-sec",
    name: "Monkey.D.Luffy (SEC)",
    set: "OP-16 / modern booster",
    rarity: "Secret Rare",
    game: "onepiece",
    rawLow: 40,
    rawHigh: 90,
    rawMid: 65,
    psa9: 100,
    psa10: 220,
    notes: "Illustrative SEC range — check current listings.",
    emoji: "🏴‍☠️",
  },
];

export function searchCards(query: string): ChaseCard[] {
  const q = query.trim().toLowerCase();
  if (!q) return chaseCards;
  return chaseCards.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.set.toLowerCase().includes(q) ||
      (c.number && c.number.toLowerCase().includes(q)) ||
      c.rarity.toLowerCase().includes(q) ||
      c.game.toLowerCase().includes(q)
  );
}
