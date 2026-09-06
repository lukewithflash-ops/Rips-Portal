import {
  amazonSearchUrl,
  ebaySearchUrl,
  getAffiliateConfig,
  tcgplayerSearchUrl,
} from "@/lib/affiliate";

const FTC_SHORT =
  "As an affiliate we may earn from qualifying purchases.";

const linkClass =
  "inline-flex items-center justify-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg border transition-colors font-medium";

export type BuyLinksProps = {
  /** Search / product query sent to marketplaces */
  query: string;
  /** Compact = buttons only; default includes microcopy */
  compact?: boolean;
  /** Show optional Amazon button when associate tag is configured */
  showAmazon?: boolean;
  className?: string;
};

export function AffiliateDisclosure({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[10px] text-zinc-500 leading-relaxed ${className}`}>
      {FTC_SHORT}
    </p>
  );
}

export default function BuyLinks({
  query,
  compact = false,
  showAmazon = false,
  className = "",
}: BuyLinksProps) {
  const q = query.trim();
  if (!q) return null;

  const cfg = getAffiliateConfig();
  const tcg = tcgplayerSearchUrl(q);
  const ebay = ebaySearchUrl(q);
  const amazon =
    showAmazon || cfg.amazonAssociateTag ? amazonSearchUrl(q) : null;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex flex-wrap gap-2 items-center">
        <a
          href={tcg}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className={`${linkClass} bg-amber-500/10 border-amber-500/35 text-amber-100/95 hover:bg-amber-500/20`}
        >
          TCGPlayer
        </a>
        <a
          href={ebay}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className={`${linkClass} bg-blue-500/10 border-blue-500/35 text-blue-100/95 hover:bg-blue-500/20`}
        >
          eBay
        </a>
        {amazon && (
          <a
            href={amazon}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className={`${linkClass} bg-orange-500/10 border-orange-500/35 text-orange-100/95 hover:bg-orange-500/20`}
          >
            Amazon
          </a>
        )}
      </div>
      {!compact && (
        <p className="text-[10px] text-zinc-500 leading-relaxed">
          May earn from qualifying purchases.{" "}
          <span className="text-zinc-600">Opens in a new tab.</span>
        </p>
      )}
    </div>
  );
}

export { FTC_SHORT };
