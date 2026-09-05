import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Rip Portal privacy stub — localStorage for Rip Log, no account required for MVP.",
  alternates: { canonical: "https://ripsportal.com/privacy" },
};

export default function PrivacyPage() {
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
          Privacy
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Short stub for the MVP. Updated as features grow.
        </p>

        <div className="mt-8 space-y-5 text-sm text-zinc-300 leading-relaxed">
          <section className="panel rounded-xl p-4 space-y-2">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              No account required
            </h2>
            <p>
              The EV calculator, Verdict, and Rip Log MVP work without creating
              an account. You can use the tools without signing in.
            </p>
          </section>

          <section className="panel rounded-xl p-4 space-y-2">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Rip Log &amp; local storage
            </h2>
            <p>
              Recent Rip Log sessions may be saved in your browser&apos;s{" "}
              <code className="text-cyan-300/90 text-[12px]">localStorage</code>{" "}
              on this device so you can reopen them. That data stays local
              unless you share a session link yourself. Clear site data in your
              browser to remove it.
            </p>
          </section>

          <section className="panel rounded-xl p-4 space-y-2">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Deal alert push subscriptions
            </h2>
            <p>
              If you enable under-EV deal notifications, your browser&apos;s Web
              Push subscription endpoint is stored so we can send deal alerts.
            </p>
          </section>

          <section className="panel rounded-xl p-4 space-y-2">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Waitlist
            </h2>
            <p>
              If you join the Portal waitlist, your email and selected interests
              are sent to the site operator so we can follow up about new tools.
              A copy may also be cached in this browser&apos;s localStorage.
            </p>
          </section>

          <section className="panel rounded-xl p-4 space-y-2">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Analytics
            </h2>
            <p>
              If Vercel Analytics is enabled on this deployment, it may collect
              aggregated, privacy-oriented usage metrics (page views, etc.). We
              do not sell personal data. Optional email submitted via the
              Insider claim form goes to the form provider you see on that
              request.
            </p>
          </section>

          <section className="panel rounded-xl p-4 space-y-2">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Contact
            </h2>
            <p>
              For privacy questions about Portal / Rip Portal, use the contact
              path on the site when available. This stub is not a full legal
              policy.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
