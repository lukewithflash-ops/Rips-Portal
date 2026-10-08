import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import VipActions from "./VipActions";

const FREE = [
  "EV calculator and Verdict for every set",
  "Open — free pack simulator, no limits",
  "Rip Log saved on your device",
  "Under-EV Watch: top 2 rows",
];

const PAID = [
  {
    title: "Flip emails",
    body: "An email when a listed product flips under EV (or back). Nothing on quiet weeks.",
  },
  {
    title: "Full Under-EV list",
    body: "Every set on the price sheet that sits under EV, not just the top 2.",
  },
  {
    title: "Rip Log export",
    body: "Download your saved rips as a CSV for a spreadsheet.",
  },
  {
    title: "Price history",
    body: "Past sheet prices for a set, week by week.",
  },
];

export default function VipPage() {
  return (
    <div className="min-h-screen portal-bg flex flex-col">
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-10 pb-24">
        <div className="flex items-center justify-between gap-3">
          <BrandLogo height={34} compact />
          <Link
            href="/"
            className="text-[12px] text-emerald-400/90 hover:text-emerald-300 underline-offset-2 hover:underline"
          >
            ← Calculator
          </Link>
        </div>

        <section className="mt-4 panel rounded-2xl p-5 border border-amber-500/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/15 via-transparent to-purple-500/10 pointer-events-none" />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-widest text-amber-300/90 font-semibold mb-1">
              👑 VIP data plan
            </div>
            <h1 className="text-2xl md:text-3xl headline-flare tracking-tight">
              Rip Portal VIP
            </h1>
            <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
              More data on the same price sheet. It&apos;s alerts and exports
              only. No coins, no gems, no paid opens.
            </p>
            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl font-bold text-white">$5</span>
              <span className="text-sm text-zinc-400">/month</span>
              <span className="text-sm text-zinc-500">or</span>
              <span className="text-xl font-semibold text-white">$40</span>
              <span className="text-sm text-zinc-400">/year</span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">
              Cancel anytime. If a payment fails, the account goes back to free.
            </p>
          </div>
        </section>

        <VipActions />

        <section className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="panel rounded-2xl p-4 border border-amber-500/25">
            <h2 className="text-[10px] uppercase tracking-widest text-amber-300/90 font-semibold mb-2">
              VIP adds
            </h2>
            <ul className="space-y-2.5">
              {PAID.map((f) => (
                <li key={f.title}>
                  <div className="text-sm font-medium text-zinc-100">👑 {f.title}</div>
                  <div className="text-[12px] text-zinc-400 leading-relaxed">{f.body}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="panel rounded-2xl p-4 border border-emerald-500/20">
            <h2 className="text-[10px] uppercase tracking-widest text-emerald-400/90 font-semibold mb-2">
              Free, always
            </h2>
            <ul className="space-y-2">
              {FREE.map((f) => (
                <li key={f} className="text-[13px] text-zinc-300">
                  ✓ {f}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <p className="mt-6 text-[11px] text-zinc-500 leading-relaxed">
          Payments are handled by Stripe. Rip Portal stores your email and
          whether VIP is active, nothing else. EV figures are estimates for
          entertainment and math, not financial advice. See{" "}
          <Link href="/terms" className="text-purple-300 hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-purple-300 hover:underline">
            Privacy
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
