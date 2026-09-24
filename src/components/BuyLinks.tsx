import {
  amazonSearchUrl,
  ebaySearchUrl,
  getAffiliateConfig,
  tcgplayerSearchUrl,
} from "@/lib/affiliate";

const FTC_SHORT =
  "As an affiliate we may earn from qualifying purchases.";

export type BuyLinksProps = {
  /** Search / product query sent to marketplaces */
  query: string;
  /** Compact = smaller buttons; disclosure still shown unless hideDisclosure */
  compact?: boolean;
  /** Show optional Amazon button when associate tag is configured */
  showAmazon?: boolean;
  /**
   * Sports / Topps: lead with eBay and de-emphasize TCGPlayer
   * (TCG search is weak for sports sealed).
   */
  preferEbay?: boolean;
  /** Hide TCGPlayer entirely (sports rows). */
  hideTcgplayer?: boolean;
  /** Button size — lg for Under-EV Watch primary CTAs */
  size?: "sm" | "md" | "lg";
  /** Skip the short affiliate line (rare; prefer showing it) */
  hideDisclosure?: boolean;
  className?: string;
};

export function AffiliateDisclosure({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[10px] text-zinc-500 leading-relaxed ${className}`}>
      {FTC_SHORT}
    </p>
  );
}

function sizeClasses(size: "sm" | "md" | "lg"): string {
  if (size === "lg") {
    return "text-[13px] px-3.5 py-2.5 rounded-xl font-semibold";
  }
  if (size === "md") {
    return "text-[12px] px-3 py-2 rounded-xl font-semibold";
  }
  return "text-[11px] px-2.5 py-1.5 rounded-lg font-medium";
}

export default function BuyLinks({
  query,
  compact = false,
  showAmazon = false,
  preferEbay = false,
  hideTcgplayer = false,
  size = "sm",
  hideDisclosure = false,
  className = "",
}: BuyLinksProps) {
  const q = query.trim();
  if (!q) return null;

  const cfg = getAffiliateConfig();
  const tcg = tcgplayerSearchUrl(q);
  const ebay = ebaySearchUrl(q);
  const amazon =
    showAmazon || cfg.amazonAssociateTag ? amazonSearchUrl(q) : null;

  const base =
    "inline-flex items-center justify-center gap-1.5 border transition-colors";
  const sz = sizeClasses(size);

  const ebayBtn = (
    <a
      key="ebay"
      href={ebay}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className={`${base} ${sz} ${
        preferEbay
          ? "bg-blue-500/20 border-blue-400/55 text-blue-50 hover:bg-blue-500/30 shadow-sm shadow-blue-950/30"
          : "bg-blue-500/10 border-blue-500/35 text-blue-100/95 hover:bg-blue-500/20"
      }`}
    >
      {preferEbay ? "Buy on eBay" : "eBay"}
    </a>
  );

  const tcgBtn =
    hideTcgplayer ? null : (
      <a
        key="tcg"
        href={tcg}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className={`${base} ${sz} ${
          preferEbay
            ? "bg-zinc-800/60 border-zinc-700/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 text-[10px] px-2 py-1.5"
            : "bg-amber-500/10 border-amber-500/35 text-amber-100/95 hover:bg-amber-500/20"
        }`}
      >
        {preferEbay ? "TCGPlayer" : "TCGPlayer"}
      </a>
    );

  const amazonBtn = amazon ? (
    <a
      key="amazon"
      href={amazon}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className={`${base} ${sz} bg-orange-500/10 border-orange-500/35 text-orange-100/95 hover:bg-orange-500/20`}
    >
      Amazon
    </a>
  ) : null;

  const buttons = preferEbay
    ? [ebayBtn, tcgBtn, amazonBtn]
    : [tcgBtn, ebayBtn, amazonBtn];

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex flex-wrap gap-2 items-center">
        {buttons.filter(Boolean)}
      </div>
      {!hideDisclosure && (
        <p className="text-[10px] text-zinc-500 leading-relaxed">
          {FTC_SHORT}{" "}
          {!compact && (
            <span className="text-zinc-600">Opens in a new tab.</span>
          )}
        </p>
      )}
    </div>
  );
}

export { FTC_SHORT };
