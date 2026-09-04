import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Rip Portal — Under-EV Deals";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(145deg, #050505 0%, #052e1a 50%, #03140c 100%)",
          color: "#ecfdf5",
          padding: 64,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 999,
              background: "linear-gradient(135deg, #4ade80, #059669)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
            }}
          >
            💎
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 42, fontWeight: 750, color: "#4ade80" }}>
              Rip Portal
            </div>
            <div style={{ fontSize: 22, color: "#94a3b8", letterSpacing: 4 }}>
              UNDER-EV WATCH
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.1 }}>
            Price under expected EV.
          </div>
          <div style={{ fontSize: 26, color: "#a7f3d0", maxWidth: 920 }}>
            Multi-hobby buy signals from catalog math — entertainment only, not
            financial advice.
          </div>
        </div>
        <div style={{ fontSize: 22, color: "#64748b" }}>ripsportal.com/deals</div>
      </div>
    ),
    { ...size }
  );
}
