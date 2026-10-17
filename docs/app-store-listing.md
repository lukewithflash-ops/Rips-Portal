# Rip Portal — App Store listing (iPhone)

App: Capacitor shell in `ios-app/` (loads https://www.ripsportal.com + native push,
haptics, share sheet, Safari for Buy links, bundled offline page). Bundle ID
`com.ripsportal.app`. iPhone only. Free. No in-app purchases.

## App information
| Field | Value |
| --- | --- |
| Name | Rip Portal |
| Subtitle (≤30) | Know before you rip |
| Primary category | Utilities |
| Secondary category | Entertainment |
| Price | Free |
| In-app purchases | None |
| Support URL | https://www.ripsportal.com/support |
| Marketing URL | https://www.ripsportal.com |
| Privacy Policy URL | https://www.ripsportal.com/privacy |
| Copyright | 2026 Luke Rodden |
| Export compliance | Standard HTTPS only — `ITSAppUsesNonExemptEncryption = NO` is set in Info.plist |

## Promotional text (≤170)
Know before you rip. See a pack's expected value before you buy, rip free simulated packs, and get a ping when something flips under EV.

## Description
Know before you rip.

Rip Portal shows the expected value (EV) of trading card and sports card packs
before you open them. Pick a set, enter what you'd pay, and get EV, ROI, and a
plain-English Verdict.

• EV calculator + Verdict for every set on the weekly price sheet
• Open: a free pack simulator using catalog drop tables. No coins, no gems, no paid opens, nothing to cash out
• Under-EV Watch: products priced under their estimated EV
• Flip alerts: a notification when a product flips under EV (or back). Quiet weeks send nothing
• Rip Log: log what you paid and pulled and compare it with EV, saved on your phone
• Share your Verdict or pulls as an image

Prices are estimates from a weekly sheet, shown with the date they were updated.
Products marked "Unverified estimate" are left out of Under-EV. Some Buy links are
affiliate links; they open the retailer in Safari at no extra cost to you.

Rip Portal is a math tool, not gambling. There is no real-money wagering and no
way to buy packs or opens in the app.

## Keywords (≤100, no trademarks)
`pack EV,expected value,TCG,trading cards,sports cards,booster,pack opener,card value,collector,ROI`

**Never use** (name, subtitle, keywords, screenshots): Pokémon, Topps, One Piece,
Panini, or other brand names; casino, loot, slots, gambling, betting, wager. Keep
brand logos and card art out of screenshot captions.

## Age rating questionnaire (recommended answers)
- Gambling (real money): **No**
- Simulated gambling: **Infrequent/Mild** (honest, conservative: the pack opener
  simulates random pulls; no money, no prizes, no paid opens). Expect a 13+ rating.
- Contests / sweepstakes: No
- Loot boxes / paid random items: **No** (nothing random is sold)
- Unrestricted web access: **No** (app loads only ripsportal.com; outside links open in Safari)
- User-generated content, messaging, chat: No
- Advertising: No third-party ads (Buy links are affiliate links to physical products)
- Violence, mature themes, profanity, medical, horror: None
- Made for Kids: No

## App Privacy ("nutrition label")
Tracking: **No** (no ad SDKs, no cross-app tracking, no ATT prompt).

| Data type | Collected when | Linked to user | Purpose |
| --- | --- | --- | --- |
| Contact Info → Email Address | Only if the user joins the waitlist / flip emails | Yes | App Functionality |
| Identifiers → Device ID (APNs push token) | Only if the user taps Get alerts | No | App Functionality |
| Usage Data → Product Interaction | Page views + Buy-link clicks (Vercel Web Analytics, cookieless) | No | Analytics |

Not collected: location, contacts, photos (saving a share image to Photos is
user-initiated and stays on device), purchases, financial info, health,
diagnostics, browsing history outside the app. Rip Log stays on device.

## Account deletion (5.1.1(v))
The iPhone app has no sign-up or sign-in, so no accounts are created in the app.
Website accounts can be deleted at ripsportal.com/vip → Delete account, or by
emailing lukewithflash@gmail.com (documented on /support and /privacy).

## VIP in the iPhone app (3.1.1)
VIP is not offered in v1 of the app. In the app (`RipPortalApp/` user agent):
VIP price, Upgrade links, checkout, and the crown are hidden (`.hide-in-app`) and
`/vip` redirects to `/features` (free features). Revisit with StoreKit/RevenueCat
in a later version.

## App Review notes (paste into "Notes")
Rip Portal is a free tool for card collectors: it estimates the expected value of
trading card packs before purchase. No account or sign-in is needed, and there are
no in-app purchases.

Native features: push notifications (APNs) for Under-EV price flips, haptic
feedback during the pack simulator, the native share sheet for Verdict/pull/recap
images, Buy links opened in Safari, and a bundled offline screen.

"Open" is a free educational simulation using each product's catalog drop table.
There is no real money, no paid opens, no currency, and no prizes; nothing can be
purchased or cashed out. Buy links are affiliate links to physical products sold
by third-party retailers and open in Safari.

To try alerts: open Under-EV Watch (💎) → Get alerts → Allow. Alerts are sent only
when a product's status changes on the weekly price sheet; we can trigger a test
alert on request.

Contact: lukewithflash@gmail.com

## Screenshots — 6.9" iPhone (1320 × 2868 portrait), 3–6 shots
Capture inside the app (TestFlight build) or from the 6.9" renders in
`docs/screenshots/` if present. No brand logos in captions; product photos only
as they appear in the app.
1. **EV + Verdict** — calculator on a booster pack: price, EV, ROI, Verdict chip. Caption: "Know the EV before you rip."
2. **Open** — pack simulator mid-reveal with the session chip (packs · spent · hits · vs EV). Caption: "Rip free simulated packs."
3. **Under-EV Watch** — list with the price-sheet date visible. Caption: "See what's under EV."
4. **Alerts** — the iOS notification banner for an Under-EV flip (or the Get alerts card). Caption: "Get pinged when a deal flips."
5. **Rip Log** — session summary vs EV. Caption: "Log your rips."
6. **Share** — share sheet over a Verdict image. Caption: "Share your Verdict."

## Assets
- App icon: `public/icons/app-icon-1024.png` (1024×1024, opaque RGB, swirl on #030306),
  also in `ios-app/ios/App/App/Assets.xcassets/AppIcon.appiconset/`.
- Launch screen: swirl on #030306 (`Splash.imageset`).

## Out of scope
- Android (no device to test)
- Coins, gems, paid opens, loot boxes — never
- VIP purchase inside the app (v1)
