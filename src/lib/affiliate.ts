/**
 * Affiliate buy-link helpers.
 * IDs are optional — search URLs always work; commission params apply when configured.
 */

export type AffiliateConfig = {
  tcgplayerAffiliateId: string | null;
  ebayCampaignId: string | null;
  amazonAssociateTag: string | null;
};

function trimOrNull(v: string | undefined): string | null {
  const t = (v ?? "").trim();
  return t.length > 0 ? t : null;
}

export function getAffiliateConfig(): AffiliateConfig {
  return {
    tcgplayerAffiliateId: trimOrNull(
      process.env.NEXT_PUBLIC_TCGPLAYER_AFFILIATE_ID
    ),
    ebayCampaignId: trimOrNull(process.env.NEXT_PUBLIC_EBAY_CAMPAIGN_ID),
    amazonAssociateTag: trimOrNull(
      process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG
    ),
  };
}

function enc(q: string): string {
  return encodeURIComponent(q.trim());
}

/**
 * TCGPlayer product search.
 * Supports Impact partner path (c/acct/ad/camp or full partner.tcgplayer.com URL),
 * legacy partner= id, or m-… style ids.
 */
export function tcgplayerSearchUrl(query: string): string {
  const q = query.trim();
  const dest = `https://www.tcgplayer.com/search/all/product?q=${enc(q)}&view=grid`;
  const id = getAffiliateConfig().tcgplayerAffiliateId;
  if (!id) return dest;

  // Full Impact / partner tracking base → deep-link with u=
  if (
    id.includes("partner.tcgplayer.com") ||
    id.includes("tcgplayer.pxf.io") ||
    id.startsWith("http://") ||
    id.startsWith("https://")
  ) {
    const base = id.split("?")[0]!.replace(/\/$/, "");
    const url = new URL(base);
    url.searchParams.set("u", dest);
    return url.toString();
  }

  // Impact path fragment: c/123/456/789
  if (/^c\/\d+\/\d+\/\d+/i.test(id)) {
    const url = new URL(`https://partner.tcgplayer.com/${id.replace(/\/$/, "")}`);
    url.searchParams.set("u", dest);
    return url.toString();
  }

  // Legacy partner= or m-… style
  const sep = dest.includes("?") ? "&" : "?";
  if (id.startsWith("m-") || id.toLowerCase().startsWith("partner=")) {
    const param = id.toLowerCase().startsWith("partner=")
      ? id
      : `partner=${encodeURIComponent(id)}`;
    return `${dest}${sep}${param}`;
  }

  return `${dest}${sep}partner=${encodeURIComponent(id)}`;
}

/**
 * eBay search via rover when campaign id is set; plain search otherwise.
 */
export function ebaySearchUrl(query: string): string {
  const q = query.trim();
  const dest = `https://www.ebay.com/sch/i.html?_nkw=${enc(q)}`;
  const campid = getAffiliateConfig().ebayCampaignId;
  if (!campid) return dest;

  const mpre = encodeURIComponent(dest);
  return `https://rover.ebay.com/rover/1/711-53200-19255-0/1?campid=${encodeURIComponent(
    campid
  )}&toolid=10001&mpre=${mpre}`;
}

/**
 * Amazon search; tag= only when associate tag is configured.
 */
export function amazonSearchUrl(query: string): string {
  const q = query.trim();
  const tag = getAffiliateConfig().amazonAssociateTag;
  const base = `https://www.amazon.com/s?k=${enc(q)}`;
  if (!tag) return base;
  return `${base}&tag=${encodeURIComponent(tag)}`;
}
