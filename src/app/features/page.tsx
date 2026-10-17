import type { Metadata } from "next";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import PushAlertsCore from "@/components/PushAlertsCore";

export const metadata: Metadata = {
  title: "What's in Rip Portal",
  description:
    "Everything in Rip Portal: EV calculator and Verdict, free pack simulator, Rip Log, Under-EV Watch, and flip alerts.",
  alternates: { canonical: "https://www.ripsportal.com/features" },
};

const FEATURES: { icon: string; title: string; body: string; href: string; cta: string }[] = [
  {
    icon: "⚡",
    title: "EV calculator + Verdict",
    body: "Pick a set, enter what you'd pay, and see expected value, ROI, and a plain-English verdict.",
    href: "/",
    cta: "Open calculator",
  },
  {
    icon: "🎁",
    title: "Open — free pack simulator",
    body: "Rip as many simulated packs as you want. Real catalog drop tables, no coins, no paid opens.",
    href: "/open",
    cta: "Rip a pack",
  },
  {
    icon: "💎",
    title: "Under-EV Watch",
    body: "Products on the weekly price sheet that sit under their estimated EV.",
    href: "/deals",
    cta: "See the watch",
  },
  {
    icon: "📝",
    title: "Rip Log",
    body: "Log what you paid and pulled, and compare it with EV. Saved on your phone.",
    href: "/log",
    cta: "Open Rip Log",
  },
];

/** Free-features page. The iPhone app opens this in place of /vip. */
export default function FeaturesPage() {
  return (
    <div className="min-h-screen portal-bg flex flex-col">
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-10 pb-24">
        <div className="flex items-center justify-between gap-3">
          <BrandLogo height={34} compact />
          <Link href="/" className="text-[13px] text-emerald-400/90 hover:text-emerald-300">
            ← Calculator
          </Link>
        </div>

        <h1 className="mt-6 text-2xl md:text-3xl headline-flare tracking-tight">What&apos;s in Rip Portal</h1>
        <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
          Know before you rip. Every tool below is free. EV figures are estimates, not guarantees.
        </p>

        <div className="mt-6 grid gap-3">
          {FEATURES.map((f) => (
            <section key={f.title} className="panel rounded-2xl p-4 border border-emerald-500/20">
              <h2 className="text-base font-semibold text-zinc-100">
                <span aria-hidden>{f.icon}</span> {f.title}
              </h2>
              <p className="mt-1 text-[13px] text-zinc-400 leading-relaxed">{f.body}</p>
              <Link
                href={f.href}
                className="mt-3 inline-flex items-center min-h-[36px] rounded-lg px-3 text-[13px] font-medium border border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              >
                {f.cta} →
              </Link>
            </section>
          ))}
        </div>

        <div className="mt-4">
          <PushAlertsCore context="vip" />
        </div>

        <p className="mt-6 text-[12px] text-zinc-500 leading-relaxed">
          Questions or want your data deleted? See{" "}
          <Link href="/support" className="text-purple-300 hover:underline">Support</Link> and{" "}
          <Link href="/privacy" className="text-purple-300 hover:underline">Privacy</Link>.
        </p>
      </main>
    </div>
  );
}
