#!/usr/bin/env node
/**
 * Rebuild src/data/priceHistory.json from the git history of
 * src/data/prices.json. Every point is a real past sheet value — nothing is
 * interpolated. Run after a weekly price refresh lands:
 *   node scripts/build-price-history.mjs
 * The VIP history API also appends the live sheet if it is newer than the
 * last committed point, so the newest sheet always shows.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const FILE = "src/data/prices.json";
const shas = execFileSync("git", ["log", "--format=%H", "--reverse", "--", FILE], {
  encoding: "utf8",
})
  .trim()
  .split("\n")
  .filter(Boolean);

/** date -> { id -> price } ; later commits for the same sheet date win */
const byDate = new Map();
for (const sha of shas) {
  let raw;
  try {
    raw = execFileSync("git", ["show", `${sha}:${FILE}`], { encoding: "utf8" });
  } catch {
    continue;
  }
  let sheet;
  try {
    sheet = JSON.parse(raw);
  } catch {
    continue;
  }
  if (!sheet?.updated || !sheet?.prices) continue;
  const prices = {};
  for (const [id, v] of Object.entries(sheet.prices)) {
    if (typeof v === "number" && Number.isFinite(v) && v > 0) prices[id] = v;
  }
  byDate.set(String(sheet.updated), prices);
}

const sheets = [...byDate.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([date, prices]) => ({ date, prices }));

writeFileSync(
  "src/data/priceHistory.json",
  JSON.stringify(
    {
      source:
        "Past Rip Portal price sheets (src/data/prices.json) from git history. Catalog market prices on each sheet date — not live quotes.",
      sheets,
    },
    null,
    1
  ) + "\n"
);
console.log(`wrote ${sheets.length} sheets: ${sheets.map((s) => s.date).join(", ")}`);
