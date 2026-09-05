import { ImageResponse } from "next/og";
import { products, calculateEV } from "@/lib/products";

export const runtime = "edge";
export const alt = "Rip Portal pack share card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ id: string }> };

function fmtMoney(n: number): string {
  const abs = Math.abs(n);
  const body = abs >= 100 ? abs.toFixed(0) : abs.toFixed(2);
  return `${n < 0 ? "-" : ""}$${body}`;
}

export default async function PackOpenGraphImage({ params }: Props) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  const name = product?.name ?? "Unknown pack";
  const format = product?.format ?? "";
  const emoji = product?.emoji ?? "📦";
  const price = product?.defaultPrice ?? 0;
  const { totalEV, roi, profit } = product
    ? calculateEV(product, product.defaultPrice)
    : { totalEV: 0, roi: 0, profit: 0 };
  const underEv = profit > 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: underEv
            ? "linear-gradient(145deg, #050505 0%, #052e1a 55%, #03140c 100%)"
            : "linear-gradient(145deg, #050505 0%, #0a1f14 50%, #03140c 100%)",
          color: "#ecfdf5",
          padding: 56,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              background: "linear-gradient(135deg, #4ade80, #059669)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
            }}
          >
            {emoji}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 28, fontWeight: 750, color: "#4ade80" }}>
              Rip Portal
            </div>
            <div style={{ fontSize: 18, color: "#94a3b8", letterSpacing: 3 }}>
              PACK EV SHARE
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.1 }}>
            {name}
          </div>
          <div style={{ fontSize: 26, color: "#a7f3d0" }}>{format}</div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
          }}
        >
          {[
            { label: "PRICE", value: fmtMoney(price) },
            { label: "EV", value: fmtMoney(totalEV) },
            {
              label: "ROI",
              value: `${roi >= 0 ? "+" : ""}${roi.toFixed(1)}%`,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "16px 22px",
                borderRadius: 16,
                background: "rgba(0,0,0,0.45)",
                border: "1px solid rgba(74,222,128,0.35)",
                minWidth: 160,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: "#64748b",
                  letterSpacing: 2,
                  marginBottom: 6,
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: underEv ? "#6ee7b7" : "#e2e8f0",
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 20, color: "#64748b" }}>
            ripsportal.com/pack/{id}
          </div>
          <div style={{ fontSize: 18, color: "#94a3b8" }}>
            Estimates, not guarantees
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
