# Site data

- `prices.json` — override `defaultPrice` by product id without rewriting slot math.
  1. Edit a price
  2. Bump `updated` (YYYY-MM-DD)
  3. Commit / PR (or ask Trader’s Monday routine)

Slot odds and `avgValue` still live in `src/lib/products.ts`.
