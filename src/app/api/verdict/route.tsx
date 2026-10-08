import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { findProduct, productDisplayName } from "@/lib/products";
import { computeVerdict, type VerdictKind } from "@/lib/verdict";

export const runtime = "nodejs";

let swirlDataUrl: string | null = null;

async function swirlSrc(): Promise<string> {
  if (swirlDataUrl) return swirlDataUrl;
  const buf = await readFile(
    path.join(process.cwd(), "public/icons/portal-app-icon.png")
  );
  swirlDataUrl = `data:image/png;base64,${buf.toString("base64")}`;
  return swirlDataUrl;
}

function fmtMoney(n: number): string {
  const abs = Math.abs(n);
  const body = abs >= 100 ? abs.toFixed(0) : abs.toFixed(2);
  return `${n < 0 ? "-" : ""}$${body}`;
}

function verdictLabel(kind: VerdictKind): string {
  if (kind === "rip") return "Rip";
  if (kind === "singles") return "Buy singles";
  return "Hold sealed";
}

function verdictColor(kind: VerdictKind): string {
  if (kind === "rip") return "#4ade80";
  if (kind === "singles") return "#67e8f9";
  return "#fbbf24";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = (url.searchParams.get("id") || "").trim();
  const product = id ? findProduct(id) : undefined;
  if (!product) {
    return new Response("Unknown product", { status: 404 });
  }

  const rawPrice = url.searchParams.get("price");
  let price = product.defaultPrice;
  let priceLabel = "Catalog price";
  if (rawPrice != null && rawPrice !== "") {
    const parsed = Number(rawPrice);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100000) {
      return new Response("Bad price", { status: 400 });
    }
    price = Math.round(parsed * 100) / 100;
    if (Math.abs(price - product.defaultPrice) > 0.009) {
      priceLabel = "Your price";
    }
  }

  const verdict = computeVerdict(product, price);
  const roiText = `${verdict.roi >= 0 ? "+" : ""}${verdict.roi.toFixed(1)}%`;
  const name = productDisplayName(product);
  const accent = verdictColor(verdict.primary);
  const logo = await swirlSrc();

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(145deg, #050508 0%, #0a1a12 48%, #120818 100%)",
          color: "#f8fafc",
          padding: "56px 64px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo}
            width={72}
            height={72}
            alt=""
            style={{ borderRadius: 16 }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 34, fontWeight: 750, color: "#4ade80" }}>
              Rip Portal
            </div>
            <div
              style={{
                fontSize: 18,
                color: "#94a3b8",
                letterSpacing: 3,
              }}
            >
              VERDICT
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              fontSize: name.length > 28 ? 48 : 58,
              fontWeight: 750,
              lineHeight: 1.05,
              letterSpacing: -1,
            }}
          >
            {name}
          </div>
          <div style={{ fontSize: 26, color: "#a7f3d0" }}>{product.format}</div>
        </div>

        <div style={{ display: "flex", gap: 20 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              background: "#0c0c16",
              border: "2px solid rgba(57,255,20,0.25)",
              borderRadius: 20,
              padding: "22px 26px",
            }}
          >
            <div style={{ fontSize: 16, color: "#64748b", letterSpacing: 2 }}>
              {priceLabel.toUpperCase()}
            </div>
            <div style={{ fontSize: 48, fontWeight: 750, marginTop: 6 }}>
              {fmtMoney(price)}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              background: "#0c0c16",
              border: "2px solid rgba(57,255,20,0.25)",
              borderRadius: 20,
              padding: "22px 26px",
            }}
          >
            <div style={{ fontSize: 16, color: "#64748b", letterSpacing: 2 }}>
              EV ROI
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 750,
                marginTop: 6,
                color: verdict.roi >= 0 ? "#4ade80" : "#f87171",
              }}
            >
              {roiText}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1.15,
              background: "#0c0c16",
              border: `2px solid ${accent}`,
              borderRadius: 20,
              padding: "22px 26px",
            }}
          >
            <div style={{ fontSize: 16, color: "#64748b", letterSpacing: 2 }}>
              VERDICT
            </div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 750,
                marginTop: 8,
                color: accent,
              }}
            >
              {verdictLabel(verdict.primary)}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ fontSize: 28, color: "#cbd5e1", fontWeight: 650 }}>
            ripsportal.com
          </div>
          <div style={{ fontSize: 16, color: "#64748b" }}>
            Catalog math · not financial advice
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );

  image.headers.set(
    "Cache-Control",
    "public, max-age=300, stale-while-revalidate=600"
  );
  return image;
}
