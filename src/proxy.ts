import { NextResponse, type NextRequest } from "next/server";

/**
 * iPhone app only: VIP is not sold in the app (App Store guideline 3.1.1), so
 * /vip and /vip/history open the free-features page instead. The website is
 * untouched — this matches only requests whose user agent carries the app tag.
 */
export function proxy(request: NextRequest) {
  const ua = request.headers.get("user-agent") || "";
  if (!ua.includes("RipPortalApp/")) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/features";
  url.search = "";
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: ["/vip", "/vip/:path*"],
};
