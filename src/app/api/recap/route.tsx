import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { buildRecap, type RecapRow } from "@/lib/recap";

export const runtime = "nodejs";

const W = 1080;
const H = 1350;

let swirl: string | null = null;
async function swirlSrc(): Promise<string> {
  if (swirl) return swirl;
  const buf = await readFile(path.join(process.cwd(), "public/icons/portal-app-icon.png"));
  swirl = `data:image/png;base64,${buf.toString("base64")}`;
  return swirl;
}

const thumbCache = new Map<string, string | null>();
/** Catalog product image → small PNG data URL (webp isn't drawn by the OG renderer). */
async function thumb(image?: string): Promise<string | null> {
  const src = (image || "").trim();
  if (!src.startsWith("/products/")) return null;
  if (thumbCache.has(src)) return thumbCache.get(src)!;
  try {
    const file = path.join(process.cwd(), "public", src);
    const png = await sharp(await readFile(file))
      .resize(120, 150, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    const url = `data:image/png;base64,${png.toString("base64")}`;
    thumbCache.set(src, url);
    return url;
  } catch {
    thumbCache.set(src, null);
    return null;
  }
}

function fmtMoney(n: number): string {
  const abs = Math.abs(n);
  const body = abs >= 100 ? abs.toFixed(0) : abs.toFixed(2);
  return `${n < 0 ? "-" : ""}$${body}`;
}
function fmtRoi(roi: number): string {
  return `${roi >= 0 ? "+" : ""}${roi.toFixed(1)}%`;
}

function Row({ r, rank, img, under }: { r: RecapRow; rank: number; img: string | null; under: boolean }) {
  const roiColor = under ? "#4ade80" : "#f87171";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 22,
        background: "#0c0c16",
        border: `2px solid ${under ? "rgba(74,222,128,0.35)" : "rgba(148,163,184,0.18)"}`,
        borderRadius: 24,
        padding: "18px 24px",
      }}
    >
      <div style={{ display: "flex", width: 44, fontSize: 30, fontWeight: 750, color: under ? "#4ade80" : "#64748b" }}>
        {rank}
      </div>
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} width={72} height={90} alt="" style={{ objectFit: "contain" }} />
      ) : (
        <div style={{ display: "flex", width: 72, height: 90 }} />
      )}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", fontSize: r.name.length > 34 ? 26 : 30, fontWeight: 700, color: "#f8fafc", lineHeight: 1.1 }}>
          {r.name.length > 72 ? `${r.name.slice(0, 70)}…` : r.name}
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "#94a3b8", marginTop: 6 }}>
          {r.format.length > 40 ? `${r.format.slice(0, 38)}…` : r.format}
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "#cbd5e1", marginTop: 6 }}>
          {fmtMoney(r.price)} price · {fmtMoney(r.totalEV)} EV
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        <div style={{ display: "flex", fontSize: 40, fontWeight: 800, color: roiColor }}>{fmtRoi(r.roi)}</div>
        <div style={{ display: "flex", fontSize: 18, color: "#64748b", letterSpacing: 2 }}>ROI</div>
      </div>
    </div>
  );
}

export async function GET() {
  const recap = buildRecap(5);
  const logo = await swirlSrc();
  const underImgs = await Promise.all(recap.under.map((r) => thumb(r.product.image)));
  const closeImgs = await Promise.all(recap.closest.map((r) => thumb(r.product.image)));

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(160deg, #050508 0%, #0a1a12 50%, #120818 100%)",
          color: "#f8fafc",
          padding: "64px 60px 56px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={84} height={84} alt="" style={{ borderRadius: 20 }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 40, fontWeight: 800, color: "#4ade80" }}>Rip Portal</div>
            <div style={{ display: "flex", fontSize: 20, color: "#94a3b8", letterSpacing: 4 }}>WEEKLY UNDER-EV RECAP</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 44 }}>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.05 }}>
            {recap.underCount === 0
              ? "Nothing under EV this week"
              : recap.underCount === 1
                ? "1 product under EV"
                : `${recap.underCount} products under EV`}
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#a7f3d0", marginTop: 12 }}>
            Prices {recap.dateLabel} · catalog price below modeled EV
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 36, flex: 1 }}>
          {recap.under.map((r, i) => (
            <Row key={r.product.id} r={r} rank={i + 1} img={underImgs[i] ?? null} under />
          ))}
          {recap.closest.length > 0 && (
            <div style={{ display: "flex", fontSize: 22, color: "#94a3b8", letterSpacing: 3, marginTop: recap.under.length ? 14 : 0 }}>
              CLOSEST TO EV (STILL UNDER WATER)
            </div>
          )}
          {recap.closest.map((r, i) => (
            <Row key={r.product.id} r={r} rank={recap.under.length + i + 1} img={closeImgs[i] ?? null} under={false} />
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 24 }}>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 750, color: "#e2e8f0" }}>ripsportal.com</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ display: "flex", fontSize: 18, color: "#64748b" }}>EV = modeled estimate · not financial advice</div>
            <div style={{ display: "flex", fontSize: 18, color: "#64748b" }}>Know before you rip.</div>
          </div>
        </div>
      </div>
    ),
    { width: W, height: H }
  );
  image.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
  return image;
}
