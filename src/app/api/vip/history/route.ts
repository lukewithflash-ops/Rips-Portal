import { NextResponse } from "next/server";
import history from "@/data/priceHistory.json";
import priceSheet from "@/data/prices.json";
import { findProduct, productDisplayName, resolveProductId } from "@/lib/products";
import { vipLive } from "@/lib/vip/config";
import { currentEmail } from "@/lib/vip/session";
import { isVip } from "@/lib/vip/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Sheet = { date: string; prices: Record<string, number> };

/** Price history for one product from past Rip Portal price sheets. VIP only. */
export async function GET(req: Request) {
  const id = resolveProductId(new URL(req.url).searchParams.get("id") || "");
  const product = findProduct(id);
  if (!product) {
    return NextResponse.json({ ok: false, error: "unknown_product" }, { status: 404 });
  }

  const email = await currentEmail();
  if (!vipLive() || !(await isVip(email))) {
    return NextResponse.json(
      { ok: false, error: "vip_required" },
      { status: email ? 403 : 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const sheets: Sheet[] = [...((history as unknown as { sheets: Sheet[] }).sheets)];
  const live = priceSheet as unknown as { updated: string; prices: Record<string, number> };
  if (!sheets.some((s) => s.date === live.updated)) {
    sheets.push({ date: live.updated, prices: live.prices });
  }
  sheets.sort((a, b) => a.date.localeCompare(b.date));

  const points: { date: string; price: number }[] = [];
  for (const s of sheets) {
    let price: number | undefined;
    for (const [rawId, v] of Object.entries(s.prices)) {
      if (resolveProductId(rawId) === product.id && typeof v === "number") price = v;
    }
    if (price != null) points.push({ date: s.date, price });
  }

  return NextResponse.json(
    {
      ok: true,
      id: product.id,
      name: `${productDisplayName(product)} · ${product.format}`,
      points,
      note: "Catalog market price on each Rip Portal sheet date. Not live quotes.",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
