import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  createSessionToken,
  readSignInToken,
  sessionCookieOptions,
} from "@/lib/vip/session";
import { claimNonce } from "@/lib/vip/store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const dest = new URL("/vip", url.origin);
  const payload = readSignInToken(url.searchParams.get("token") || "");
  if (!payload || !(await claimNonce(payload.n).catch(() => false))) {
    dest.searchParams.set("signin", "expired");
    return NextResponse.redirect(dest);
  }
  const token = createSessionToken(payload.e);
  const res = NextResponse.redirect(dest);
  if (token) res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}
