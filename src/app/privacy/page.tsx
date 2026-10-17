import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Rip Portal stores, where it goes, and how to delete it. No account needed for the calculator, Open, or Rip Log.",
  alternates: { canonical: "https://www.ripsportal.com/privacy" },
};

const UPDATED = "October 17, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel rounded-xl p-4 space-y-2">
      <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">{title}</h2>
      {children}
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen portal-bg flex flex-col">
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-10">
        <Link href="/" className="text-[13px] text-green-400/90 hover:text-green-300">
          ← Rip Portal
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-green-400 neon-text">Privacy</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Last updated {UPDATED}. This covers the website and the Rip Portal iPhone app.
        </p>

        <div className="mt-8 space-y-5 text-sm text-zinc-300 leading-relaxed">
          <Section title="The short version">
            <p>
              The EV calculator, Verdict, Open (the free pack simulator), and Rip
              Log work without an account. We don&apos;t sell personal data, we
              don&apos;t run ad trackers, and we don&apos;t track you across other
              apps or sites.
            </p>
          </Section>

          <Section title="Saved only on your device">
            <p>
              Rip Log sessions, prices you type (&ldquo;your price&rdquo;), shop
              inventory, and a few display preferences are saved in this
              browser&apos;s or app&apos;s local storage. They are not uploaded.
              Clearing site data (or deleting the app) removes them.
            </p>
          </Section>

          <Section title="What we store on our servers">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-zinc-100">Alert subscriptions.</strong> If you turn on
                Under-EV alerts, we store the push subscription (a browser push
                endpoint, or an Apple push token in the iPhone app). If you&apos;re signed in,
                your account email is saved with it. Turning alerts off removes it.
              </li>
              <li>
                <strong className="text-zinc-100">Waitlist and flip emails.</strong> If you join
                the waitlist, we store your email and the interests you picked so we
                can email you when a product flips into or out of Under-EV. Every
                email has an unsubscribe link.
              </li>
              <li>
                <strong className="text-zinc-100">VIP account.</strong> If you sign in, we store
                your email, whether VIP is active, and (if you subscribe on the
                website) your Stripe customer and subscription ids. Signing in sets one
                cookie that keeps you signed in for 30 days.
              </li>
            </ul>
          </Section>

          <Section title="Services we use">
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-zinc-100">Vercel</strong>: hosts the site and API. Vercel Web Analytics counts page views and Buy-link clicks without cookies and without identifying you.</li>
              <li><strong className="text-zinc-100">Upstash Redis</strong>: stores the alert subscriptions, waitlist emails, and VIP records listed above.</li>
              <li><strong className="text-zinc-100">Resend</strong>: sends sign-in links and flip emails.</li>
              <li><strong className="text-zinc-100">FormSubmit</strong>: may forward a waitlist signup (email + interests) to our inbox.</li>
              <li><strong className="text-zinc-100">Stripe</strong>: processes VIP payments on the website. We never see your card number.</li>
              <li><strong className="text-zinc-100">Push services</strong>: your browser vendor&apos;s push service (or Apple Push Notification service in the app) delivers alerts.</li>
              <li><strong className="text-zinc-100">Card image hosts</strong>: card art comes from public card-image databases (Scrydex, pokemontcg.io, Limitless), fetched through our server.</li>
            </ul>
          </Section>

          <Section title="Affiliate / Buy links">
            <p>
              Buy links to TCGplayer, eBay, or Amazon may carry affiliate tags.
              They open the retailer&apos;s own site, which has its own privacy
              policy. A qualifying purchase can earn Rip Portal a commission at no
              extra cost to you.
            </p>
          </Section>

          <Section title="Delete your data">
            <ul className="list-disc pl-5 space-y-1.5">
              <li className="hide-in-app">
                Signed in? Go to <Link href="/vip" className="text-purple-300 hover:underline">VIP</Link>{" "}
                → <em>Delete account</em>. That removes your email, VIP status, alert
                subscriptions tied to that email, and flip-email signups, and cancels
                any subscription right away.
              </li>
              <li>Alerts: tap <em>Turn off</em> on any alerts button.</li>
              <li>Flip emails: use the unsubscribe link in any email.</li>
              <li>
                Anything else, or if you can&apos;t sign in: email{" "}
                <a href="mailto:lukewithflash@gmail.com" className="text-cyan-300 hover:underline">lukewithflash@gmail.com</a>{" "}
                and we&apos;ll delete it.
              </li>
            </ul>
          </Section>

          <Section title="Kids">
            <p>Rip Portal isn&apos;t directed at children under 13 and doesn&apos;t knowingly collect their data.</p>
          </Section>

          <Section title="Contact">
            <p>
              Questions: <a href="mailto:lukewithflash@gmail.com" className="text-cyan-300 hover:underline">lukewithflash@gmail.com</a>.
              See also <Link href="/support" className="text-purple-300 hover:underline">Support</Link> and{" "}
              <Link href="/terms" className="text-purple-300 hover:underline">Terms</Link>.
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
}
