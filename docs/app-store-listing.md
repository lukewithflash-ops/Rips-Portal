# Rip Portal — App Store / PWA listing notes

**Name:** Rip Portal  
**Subtitle:** Know before you rip  
**Support URL:** https://ripsportal.com/privacy (mailto: lukewithflash@gmail.com)  
**Marketing URL:** https://ripsportal.com  
**Privacy URL:** https://ripsportal.com/privacy  

## First-line description
Know before you rip. Free educational pack sim + EV calculator for Pokémon, sports cards, and One Piece — estimates, not guarantees. Not gambling. No real-money opens.

## Full description (draft)
Rip Portal helps collectors see pack expected value before they crack wax. Browse catalog defaults for Pokémon TCG, Topps Baseball, Basketball, and One Piece; compare your price to unit EV and ROI; get a Portal Verdict; log sessions; and run a free educational pack simulation.

- Free EV calculator with catalog prices and your price
- Under-EV Watch for packs trading under estimated EV
- Rip Log to compare pulls vs expected value (stays on device for MVP)
- Free Pack Opener — simulation only, no gems, no paid crates
- Installable PWA (standalone) with honest offline shell

Not a casino. No real-money wagering. No in-app purchases for pack opens.

## Keywords
pack EV, TCG, Pokémon, Topps, One Piece, booster pack expected value, card EV calculator, under EV, rip log, collector tools

**Do not use:** casino, loot, slots, gambling, betting, wager

## Age rating
Match the in-app /open disclaimer: educational simulation of collectible pack odds and EV math. Not a casino, no real-money wagering, no paid pack opens. Recommend the same content rating lane as other collector/utility EV tools (no simulated gambling for cash prizes). Suggested store copy: “Infrequent/Mild Simulated Gambling” only if the store forces a gambling-adjacent label for pack *simulation* UI — prefer Utility / Entertainment without gambling tags when the form allows, and stress “educational odds math, no real-money opens.”

## Monetization / IAP
- **IAP for packs:** none (and none planned for opens).
- No coins, gems, or paid crates.
- **VIP later (if any):** data / alerts only — never paid mystery opens or gambling mechanics.

## Screenshot briefs (6)

### 1 — Pack rip
Phone frame on `/open` results: tear/reveal moment with a chase or IR/SIR soft-hit frame, session chip showing packs · spent · hits · vs EV, sticky **Open another**.

### 2 — EV vs price
Home calculator for the same set (e.g. Surging Sparks Booster Pack): catalog price vs unit EV / ROI, Portal Verdict chip visible, purple-forward chrome. Full set name visible (no clip).

### 3 — Under-EV
`/deals` Under-EV Watch list with a few packs under EV, emerald accent rows, clear “math estimates only” cue in chrome.

### 4 — Log summary
`/log` session summary: quantity, cost, sim/logged value vs expected EV, link back to Open / Calculator.

### 5 — Home screen / install
Installed PWA icon: swirl-only portal mark on black (no creatures, no wordmark). Optional: install toast “Install Rip Portal” after a successful EV calc or pack open.

### 6 — Offline honesty
App chrome with the amber offline banner: “Offline — prices may be stale / last updated …” while `/`, `/open`, `/deals`, or `/log` still load from the shell. Do not imply live prices.

## Assets
- **App icon / Apple touch / splash:** swirl-only oval portal (green→purple) on `#030306` / black — see `public/icons/` (`icon-192`, `icon-512`, `icon-512-maskable`, `apple-touch-icon`, `splash-swirl-1024`). Header wordmark (`public/brand/`) stays separate for website chrome only.
- Device PNGs for store screenshots are not bundled in this PR — capture from a real phone or simulator when submitting. These briefs are the shot list.

## PWA checklist (Phase 1)
- [x] `manifest`: name / short_name **Rip Portal**, theme/background `#030306`, display `standalone`, start_url `/`, scope `/`
- [x] Icons 192 / 512 / maskable + apple-touch = swirl-only
- [x] Install prompt once, after EV calc or pack open (hidden on `/open` during primary CTA)
- [x] Offline shell + honest stale-price banner
- [x] Deep links `/`, `/open`, `/deals`, `/log` from home-screen icon

## Explicitly out of scope (this phase)
- Capacitor / native wrapper (Phase 3 later)
- Coins, gems, paid crates
- Rename to Portal Rips / Rips Portal
