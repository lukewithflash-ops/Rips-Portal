import Link from "next/link";
import InstallAppButton from "@/components/InstallAppButton";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-green-500/10 bg-black/40">
      <div className="mx-auto max-w-5xl px-4 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-green-400/90 tracking-wide">
            Portal
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
            Tools for card rippers — Know before you rip
          </p>
        </div>
        <nav
          className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-zinc-400"
          aria-label="Legal"
        >
          <InstallAppButton />
          <Link href="/about" className="hover:text-green-300 transition-colors">
            About
          </Link>
          <Link
            href="/waitlist"
            className="hover:text-purple-300 transition-colors"
          >
            Join waitlist
          </Link>
          <Link
            href="/privacy"
            className="hover:text-green-300 transition-colors"
          >
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-green-300 transition-colors">
            Terms
          </Link>
          <Link href="/open" className="hover:text-cyan-300 transition-colors">
            Open
          </Link>
          <Link href="/deals" className="hover:text-emerald-300 transition-colors">
            Deals
          </Link>
          <Link href="/log" className="hover:text-cyan-300 transition-colors">
            Rip Log
          </Link>
        </nav>
      </div>
    </footer>
  );
}
