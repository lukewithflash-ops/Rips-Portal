import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Portal — Rip Portal, Portal Verdict, and Rip Log. Multi-hobby pack EV tools for collectors.",
  alternates: { canonical: "https://ripsportal.com/about" },
};

export default function AboutPage() {
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
          About Portal
        </h1>
        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
          Portal is the brand behind collector tools that help you know before
          you rip — math-first estimates for multi-hobby sealed product.
        </p>

        <section className="mt-8 space-y-4 text-sm text-zinc-300 leading-relaxed">
          <div className="panel rounded-xl p-4">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">
              Rip Portal
            </h2>
            <p>
              Pack expected-value calculator for Pokémon, Topps Baseball,
              Basketball, and One Piece. Catalog defaults, your price, and
              clear ROI — entertainment math, not a promise.
            </p>
          </div>
          <div className="panel rounded-xl p-4">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">
              Portal Verdict
            </h2>
            <p>
              A lightweight Rip vs buy singles vs hold sealed layer on top of
              EV. Same model, framed as a decision aid with disclaimers.
            </p>
          </div>
          <div className="panel rounded-xl p-4">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">
              Rip Log
            </h2>
            <p>
              Log a session and compare pulls to expected EV. Stays on your
              device for the MVP — a personal notebook, not a marketplace.
            </p>
          </div>
        </section>

        <section className="mt-8 text-sm text-zinc-400 leading-relaxed space-y-3">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            Mission
          </h2>
          <p>
            Multi-hobby collectors deserve transparent math before they crack
            wax. Portal aims to make EV, fees, and variance readable — without
            pretending the chase is risk-free.
          </p>
          <p>
            Built by Luke. An LLC may be formed under the Portal name as the
            project grows; this page is a brand overview, not a filing or
            registered-agent listing. No EIN, street address, or legal entity
            claims are published here until they exist.
          </p>
        </section>

        <p className="mt-8 text-[12px] text-zinc-500">
          Questions or pack tips? Reach out via the Insider form on the home
          page when available.
        </p>
      </main>
    </div>
  );
}
