import { NextResponse } from "next/server";
import {
  signInEmailConfigured,
  vipFlagOn,
  vipLive,
} from "@/lib/vip/config";
import { currentEmail } from "@/lib/vip/session";
import { isVip } from "@/lib/vip/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Who is signed in and whether VIP gates/checkout are on. Never returns secrets. */
export async function GET() {
  const email = await currentEmail();
  const live = vipLive();
  const vip = email ? await isVip(email) : false;
  return NextResponse.json(
    {
      ok: true,
      email,
      vip,
      /** Gates apply only when checkout can actually be completed. */
      gatesOn: live,
      checkoutEnabled: live,
      flagOn: vipFlagOn(),
      signInEmailEnabled: signInEmailConfigured() && live,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
