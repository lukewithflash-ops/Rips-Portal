# Rip Portal

**Know before you rip.**

Calculate expected value for Pokémon (Ascended Heroes focus), Topps Chrome Basketball Update, Topps Baseball, and One Piece packs.

Neon portal vibes. Free forever core tool.

## Features

- Category tabs: Pokémon · Basketball · Baseball · One Piece
- Focus products: **Ascended Heroes** + **2025-26 Topps Chrome Update**
- Editable price field (plug in current market prices)
- Instant EV + ROI % calculation
- Rarity contribution breakdown
- Mobile-friendly dark neon UI

## Quick Start (Local)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel (Recommended – Free)

1. Push this folder to a new GitHub repository
2. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
3. Click **Add New Project** → Import your repo
4. Vercel auto-detects Next.js → Click **Deploy**
5. Done. You get a free `*.vercel.app` URL

Optional: Custom domain is `ripsportal.com` (connect in Vercel project settings).

## Project Structure

```
src/
  app/
    page.tsx          ← Main calculator UI
    layout.tsx        ← Metadata + fonts
    globals.css       ← Portal neon theme
  lib/
    products.ts       ← All product data + EV math
```

## Updating Data

Edit `src/lib/products.ts` to change prices, odds, or add new products.  
Redeploy after changes.

## Notes

- All odds and average values are **approximate** community estimates.
- Prices move daily — users should adjust the price field.
- Not affiliated with Pokémon, Topps, One Piece, or any card company.

---

Built for collectors who want the math before the dopamine.

## Web Push (under-EV flip alerts)

Background notifications via standard Web Push + VAPID (`web-push` package; no paid service).

- Opt-in: "Get alerts" on `/deals` and `/vip`. Permission is asked only on tap. iPhone needs Add to Home Screen first.
- Subscriptions live in the existing Upstash Redis (`/api/push/subscribe`, `/api/push/unsubscribe`). Expired ones (404/410) are dropped on send.
- The Monday cron (`/api/push/notify-deals`) sends a push and the flip email only when an Under-EV row flips. Quiet weeks send nothing. When VIP checkout is live, pushes follow the flip-email rule (VIP accounts only). `/open` never checks VIP.
- `/api/push/status` reports (booleans only) whether push is on.
- Test: `curl -X POST https://www.ripsportal.com/api/push/test -H "Authorization: Bearer $CRON_SECRET"` sends a test notification to every subscriber.

Env (Vercel → Production), then redeploy (the public key is inlined at build):
`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (`mailto:…`), plus `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `CRON_SECRET`. Generate keys with `npx web-push generate-vapid-keys`.

Never commit `VAPID_PRIVATE_KEY`.

## Affiliate buy links

Optional marketplace affiliate IDs power TCGPlayer / eBay (and optional Amazon) buy buttons. Without them, buttons still open plain search URLs. Logic lives in `src/lib/affiliate.ts` + `BuyLinks`.

Set in Vercel / `.env.local` (see `.env.example`):

| Variable | Purpose | Status |
|---|---|---|
| `NEXT_PUBLIC_TCGPLAYER_AFFILIATE_ID` | Legacy numeric id → URLs get `partner=<id>` (production uses `7736131`), or Impact path `c/…/…/…` / full partner URL | Live — keep `7736131` unless migrating to Impact |
| `NEXT_PUBLIC_EBAY_CAMPAIGN_ID` | eBay Partner Network campaign id (`campid` on rover links) | **Pending** — signup elsewhere; leave unset until campid is ready (plain eBay search still works) |
| `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG` | Optional Amazon Associates tag | Optional |

Signup:

- TCGPlayer affiliates: [https://affiliate.tcgplayer.com/](https://affiliate.tcgplayer.com/)
- eBay Partner Network: [https://partnernetwork.ebay.com/](https://partnernetwork.ebay.com/)

Do not invent or hardcode an eBay `campid` in the repo. FTC disclosure appears in the footer and near Buy buttons.

