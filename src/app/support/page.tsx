import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Help with Rip Portal: how EV and Verdict work, alerts, Rip Log, deleting your account, and how to reach us.",
  alternates: { canonical: "https://www.ripsportal.com/support" },
};

const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: "Where do the prices come from?",
    a: (
      <>
        A price sheet refreshed weekly from public retailer and marketplace listings. Each
        product shows the date the sheet was updated. Products marked
        &ldquo;Unverified estimate&rdquo; don&apos;t count toward Under-EV or VALUE.
        EV and ROI are estimates, not guarantees.
      </>
    ),
  },
  {
    q: "Is Open real money?",
    a: (
      <>
        No. Open is a free simulation that uses catalog drop tables (math
        estimates, not official odds). There are no coins, gems, or paid opens, and nothing you pull can
        be cashed out.
      </>
    ),
  },
  {
    q: "How do Under-EV alerts work?",
    a: (
      <>
        Turn on alerts and you&apos;ll get a notification when a product on the
        price sheet flips under its estimated EV (or back). Quiet weeks send
        nothing. Turn them off any time with the same button.
      </>
    ),
  },
  {
    q: "Where is my Rip Log saved?",
    a: (
      <>
        On your device only. Clearing site data or deleting the app removes it.
      </>
    ),
  },
  {
    q: "How do I delete my account?",
    a: (
      <>
        <span className="hide-in-app">
          Sign in on <Link href="/vip" className="text-purple-300 hover:underline">VIP</Link> and
          tap <em>Delete account</em>. It removes your email, VIP status, alert
          subscriptions tied to that email, and flip-email signups, and cancels any
          subscription right away.{" "}
        </span>
        Or email lukewithflash@gmail.com from the address on the account and
        we&apos;ll delete it.
      </>
    ),
  },
  {
    q: "Do Buy links cost me more?",
    a: (
      <>
        No. Some Buy links are affiliate links, so a qualifying purchase can earn
        Rip Portal a commission at no extra cost to you.
      </>
    ),
  },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen portal-bg flex flex-col">
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-10">
        <Link href="/" className="text-[13px] text-green-400/90 hover:text-green-300">
          ← Rip Portal
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-green-400 neon-text">Support</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Help for the Rip Portal website and iPhone app.
        </p>

        <section className="mt-6 panel rounded-xl p-4 space-y-2 border border-cyan-500/25">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Contact</h2>
          <p className="text-sm text-zinc-300">
            Email{" "}
            <a href="mailto:lukewithflash@gmail.com?subject=Rip%20Portal%20support" className="text-cyan-300 hover:underline">
              lukewithflash@gmail.com
            </a>
            . Include the set or page and what you expected to see.
          </p>
        </section>

        <div className="mt-5 space-y-3">
          {FAQ.map((item) => (
            <section key={item.q} className="panel rounded-xl p-4 space-y-1.5">
              <h2 className="text-sm font-semibold text-zinc-100">{item.q}</h2>
              <p className="text-sm text-zinc-300 leading-relaxed">{item.a}</p>
            </section>
          ))}
        </div>

        <p className="mt-6 text-[13px] text-zinc-400">
          See also <Link href="/privacy" className="text-purple-300 hover:underline">Privacy</Link>,{" "}
          <Link href="/terms" className="text-purple-300 hover:underline">Terms</Link>, and{" "}
          <Link href="/about" className="text-purple-300 hover:underline">About</Link>.
        </p>
      </main>
    </div>
  );
}
