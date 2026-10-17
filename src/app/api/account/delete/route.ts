import { NextResponse } from "next/server";
import { currentEmail, SESSION_COOKIE } from "@/lib/vip/session";
import { deleteAccountData } from "@/lib/accountDelete";

export const runtime = "nodejs";

/**
 * Delete the signed-in account and its server-side data.
 * Body: { confirm: "<same email>" } so a stray click can't delete anything.
 */
export async function POST(req: Request) {
  const email = await currentEmail();
  if (!email) {
    return NextResponse.json({ ok: false, error: "not_signed_in" }, { status: 401 });
  }
  let confirm = "";
  try {
    const body = (await req.json()) as { confirm?: string };
    confirm = String(body?.confirm || "").trim().toLowerCase();
  } catch {
    /* fall through */
  }
  if (confirm !== email) {
    return NextResponse.json({ ok: false, error: "confirm_mismatch" }, { status: 400 });
  }

  const result = await deleteAccountData(email);
  const res = NextResponse.json({ ok: result.stripe !== "failed", result });
  if (result.stripe !== "failed") {
    res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  }
  return res;
}
