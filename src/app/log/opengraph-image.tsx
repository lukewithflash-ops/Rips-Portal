import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Rip Portal — Rip Log";
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
            "linear-gradient(145deg, #050505 0%, #0a1a24 50%, #031018 100%)",
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
              background: "linear-gradient(135deg, #22d3ee, #0891b2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
            }}
          >
            📝
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 42, fontWeight: 750, color: "#4ade80" }}>
              Rip Portal
            </div>
            <div style={{ fontSize: 22, color: "#94a3b8", letterSpacing: 4 }}>
              RIP LOG
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.1 }}>
            Session vs expected EV.
          </div>
          <div style={{ fontSize: 26, color: "#a7f3d0", maxWidth: 920 }}>
            Personal math notebook for collectors — share a link, not a ledger.
          </div>
        </div>
        <div style={{ fontSize: 22, color: "#64748b" }}>ripsportal.com/log</div>
      </div>
    ),
    { ...size }
  );
}
