# Rip Portal

**Multiverse Pack EV Calculator**

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

Optional: Buy a domain (e.g. `ripportal.com`) and connect it in Vercel project settings.

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

## Web Push (under-EV deal alerts)

Background notifications for installed PWAs (no OneSignal).

1. Create a free Upstash Redis database → copy REST URL + token.
2. Set Vercel env vars (see `.env.example`): `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `CRON_SECRET`.
3. `vercel.json` cron hits `/api/push/notify-deals` Mondays 16:00 UTC (≈9am PT). Vercel Hobby may require Pro for crons — otherwise trigger the route manually with `Authorization: Bearer $CRON_SECRET`.

Never commit `VAPID_PRIVATE_KEY`.

