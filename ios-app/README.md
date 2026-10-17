# Rip Portal — iPhone app

Capacitor 8 shell for the iPhone. It loads the live site
(`https://www.ripsportal.com`) and adds native pieces:

| Native piece | Where |
| --- | --- |
| Push alerts via APNs (Under-EV flips) | `@capacitor/push-notifications`, server: `src/lib/apns.ts`, `src/lib/apnsStore.ts`, `/api/push/apns/*` |
| Haptics on pack reveal / hits | `@capacitor/haptics`, `src/app/open/page.tsx` → `src/lib/native.ts` |
| Native share sheet (verdict, Open pulls, recap) | `@capacitor/share` + `@capacitor/filesystem` |
| Buy / retailer links open in Safari | `@capacitor/app-launcher`, `src/components/NativeAppBridge.tsx` |
| Bundled offline page | `www/offline.html` (`server.errorPath`) |

- Bundle ID `com.ripsportal.app`, name **Rip Portal**, iPhone only, iOS 15+, portrait.
- The app appends `RipPortalApp/1.0` to the user agent. The site uses it to
  hide VIP prices/upgrade/checkout (`.hide-in-app`) and `src/proxy.ts`
  redirects `/vip` → `/features` inside the app. VIP is not sold in the app.
- Website changes ship through Vercel as usual; the app picks them up on next
  launch. Rebuild the app only when native code, plugins, icons, or
  `capacitor.config.json` change.

## Build
No Mac needed: `codemagic.yaml` (repo root, workflow `ios-testflight`) builds,
signs, and uploads to TestFlight. Local (Mac + Xcode 26):

```bash
cd ios-app && npm ci && npx cap sync ios && npx cap open ios
```
(Capacitor CLI needs Node 22+.)

## Server env for push (Vercel, all four or it stays off)
`APNS_KEY_ID`, `APNS_TEAM_ID`, `APNS_KEY_P8`, `APNS_BUNDLE_ID=com.ripsportal.app`
(optional `APNS_SANDBOX=1` for Xcode debug builds only).
