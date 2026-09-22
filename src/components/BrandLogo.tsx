import Link from "next/link";

type BrandLogoProps = {
  /** Image height in px (width scales with lockup aspect). */
  height?: number;
  href?: string | null;
  className?: string;
  /** Compact: slightly smaller for mobile headers */
  compact?: boolean;
};

/**
 * Wide "PORTAL RIPS" lockup (logo B) for site chrome.
 * PWA icons use logo A separately under /public/icons/.
 */
export default function BrandLogo({
  height = 36,
  href = "/",
  className = "",
  compact = false,
}: BrandLogoProps) {
  const h = compact ? Math.min(height, 32) : height;
  // Source lockup is ~16:9; at header size keep readable width
  const w = Math.round(h * (1280 / 720));

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/portal-rips-header.png"
      alt="Portal Rips"
      width={w}
      height={h}
      className={`object-contain object-left select-none ${className}`}
      style={{ height: h, width: "auto", maxWidth: compact ? 140 : 180 }}
      decoding="async"
    />
  );

  if (href === null) {
    return <span className="inline-flex items-center shrink-0">{img}</span>;
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400/70 rounded-sm"
      aria-label="Portal Rips home"
    >
      {img}
    </Link>
  );
}

/** Small square app mark (logo A) for install toast / favicon-sized chrome. */
export function BrandAppIcon({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icons/portal-app-icon.png"
      alt=""
      width={size}
      height={size}
      className={`rounded-md object-cover shrink-0 ${className}`}
      decoding="async"
      aria-hidden
    />
  );
}
