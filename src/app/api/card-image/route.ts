import { NextRequest, NextResponse } from "next/server";

/** Hosts we already trust for Next/Image + pool art CDNs. */
const ALLOWED_HOSTS = new Set([
  "images.scrydex.com",
  "images.pokemontcg.io",
  "limitlesstcg.nyc3.cdn.digitaloceanspaces.com",
]);

const MAX_BYTES = 2_500_000;

function isAllowedUrl(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (!ALLOWED_HOSTS.has(url.hostname)) return null;
  return url;
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ error: "missing_url" }, { status: 400 });
  }

  const target = isAllowedUrl(raw);
  if (!target) {
    return NextResponse.json({ error: "url_not_allowed" }, { status: 400 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        // Some CDNs behave better with a normal browser UA.
        "User-Agent":
          "Mozilla/5.0 (compatible; RipPortalCardProxy/1.0; +https://ripsportal.com)",
      },
      // Cache at the edge / CDN when possible.
      next: { revalidate: 60 * 60 * 24 * 7 },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "upstream_failed", status: upstream.status },
        { status: 502 }
      );
    }

    const contentType = upstream.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "not_image" }, { status: 502 });
    }

    const buf = Buffer.from(await upstream.arrayBuffer());
    if (buf.byteLength === 0 || buf.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: "bad_size" }, { status: 502 });
    }

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
        // Same-origin proxy → safe for canvas tainting.
        "Access-Control-Allow-Origin": "*",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "proxy_exception" }, { status: 502 });
  }
}
