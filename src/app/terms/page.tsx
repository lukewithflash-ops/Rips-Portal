import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "Rip Portal terms stub — entertainment and math estimates only; not financial advice.",
  alternates: { canonical: "https://ripsportal.com/terms" },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen portal-bg flex flex-col">
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-10">
        <Link
          href="/"
          className="text-[12px] text-green-400/90 hover:text-green-300"
        >
          ← Rip Portal
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-green-400 neon-text">
          Terms
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Short stub for the MVP. Entertainment use only.
        </p>

        <div className="mt-8 space-y-5 text-sm text-zinc-300 leading-relaxed">
          <section className="panel rounded-xl p-4 space-y-2">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Estimates, not advice
            </h2>
            <p>
              Rip Portal, Portal Verdict, Keeper EV, and Rip Log provide
              entertainment and mathematical estimates only. Nothing on this
              site is financial, investment, tax, or collecting advice.
            </p>
          </section>

          <section className="panel rounded-xl p-4 space-y-2">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              No EV guarantee
            </h2>
            <p>
              Expected value, ROI, fee nets, and verdicts are models. Pull
              rates, card prices, sealed markets, and platform fees change.
              There is no guarantee of accuracy, profit, or that your open will
              match the model. Variance is large — most chase opens still lose
              money at secondary prices.
            </p>
          </section>

          <section className="panel rounded-xl p-4 space-y-2">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Your responsibility
            </h2>
            <p>
              Verify live listings, fees, and product authenticity before you
              buy, rip, sell, or hold. You are solely responsible for your
              purchasing and selling decisions.
            </p>
          </section>

          <section className="panel rounded-xl p-4 space-y-2">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              As-is
            </h2>
            <p>
              The service is provided as-is without warranties of any kind to
              the fullest extent permitted by law. This stub is not a complete
              terms-of-service agreement and may be expanded later.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
