import { fmtMoney, type SimPull, type SimSession } from "@/lib/simulate";

export type ShareImageFormat = "story" | "square";

export interface ShareImageOptions {
  format?: ShareImageFormat;
  /** Max cards to draw in the grid (top hits first). */
  maxCards?: number;
}

const SIZES: Record<ShareImageFormat, { w: number; h: number }> = {
  story: { w: 1080, h: 1920 },
  square: { w: 1080, h: 1080 },
};

/** Same-origin proxy so canvas isn't tainted if a CDN omits CORS. */
export function proxiedCardImageUrl(remoteUrl: string): string {
  return `/api/card-image?url=${encodeURIComponent(remoteUrl)}`;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function loadCardArt(remoteUrl: string | undefined): Promise<HTMLImageElement | null> {
  if (!remoteUrl) return null;
  // Prefer same-origin proxy (reliable for canvas).
  const viaProxy = await loadImage(proxiedCardImageUrl(remoteUrl));
  if (viaProxy) return viaProxy;
  // Fallback: direct CDN with CORS (Scrydex sends ACAO *).
  return loadImage(remoteUrl);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function truncate(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) {
    t = t.slice(0, -1);
  }
  return `${t}…`;
}

function pickShareCards(session: SimSession, maxCards: number): SimPull[] {
  const all = session.packs.flatMap((pk) => pk.pulls);
  const scored = [...all].sort((a, b) => {
    const av = a.estValue ?? a.avgValue ?? 0;
    const bv = b.estValue ?? b.avgValue ?? 0;
    if (bv !== av) return bv - av;
    return (a.cardName || a.name).localeCompare(b.cardName || b.name);
  });
  // Prefer cards with art when possible, but keep ranking.
  const withArt = scored.filter((p) => !!p.imageUrl);
  const without = scored.filter((p) => !p.imageUrl);
  const merged = [...withArt, ...without];
  // Deduplicate by name+value so multi-hits don't flood the collage.
  const seen = new Set<string>();
  const unique: SimPull[] = [];
  for (const p of merged) {
    const key = `${p.cardName || p.name}|${p.estValue ?? 0}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(p);
    if (unique.length >= maxCards) break;
  }
  return unique;
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const ir = img.width / img.height;
  const tr = w / h;
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;
  if (ir > tr) {
    sw = img.height * tr;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / tr;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function drawPlaceholderCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string
) {
  ctx.fillStyle = "#12121c";
  roundRect(ctx, x, y, w, h, 18);
  ctx.fill();
  ctx.strokeStyle = "rgba(57,255,20,0.25)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#64748b";
  ctx.font = "600 28px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🃏", x + w / 2, y + h / 2 - 18);
  ctx.font = "500 18px system-ui, sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText(truncate(ctx, label, w - 24), x + w / 2, y + h / 2 + 28);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

/**
 * Render a shareable collage of a free pack sim (story or square).
 * Uses /api/card-image so remote art does not taint the canvas.
 */
export async function renderOpenShareImage(
  session: SimSession,
  options: ShareImageOptions = {}
): Promise<Blob> {
  const format = options.format ?? "story";
  const maxCards = options.maxCards ?? (format === "story" ? 8 : 6);
  const { w, h } = SIZES[format];
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_unavailable");

  // Background
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#030306");
  bg.addColorStop(0.45, "#0a1a12");
  bg.addColorStop(1, "#0a0614");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Soft neon orbs
  const orb = (cx: number, cy: number, r: number, color: string) => {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  };
  orb(w * 0.15, h * 0.12, 420, "rgba(57,255,20,0.18)");
  orb(w * 0.85, h * 0.28, 380, "rgba(191,0,255,0.14)");
  orb(w * 0.5, h * 0.92, 460, "rgba(0,240,255,0.10)");

  const pad = 56;
  let y = pad;

  // Branding
  ctx.fillStyle = "#4ade80";
  ctx.font = "750 42px system-ui, sans-serif";
  ctx.fillText("🌀 Rip Portal", pad, y + 42);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "600 22px system-ui, sans-serif";
  ctx.fillText("FREE PACK SIM", pad, y + 78);
  y += 110;

  // Product
  const productLine = `${session.quantity}× ${session.product.name}`;
  ctx.fillStyle = "#f1f5f9";
  ctx.font = "700 48px system-ui, sans-serif";
  const productMax = w - pad * 2;
  ctx.fillText(truncate(ctx, productLine, productMax), pad, y + 48);
  y += 70;

  ctx.fillStyle = "#a7f3d0";
  ctx.font = "500 26px system-ui, sans-serif";
  const meta = `${session.product.format} · Sim ${fmtMoney(session.totalSimValue)} · EV ${fmtMoney(session.expectedEV)}`;
  ctx.fillText(truncate(ctx, meta, productMax), pad, y + 28);
  y += 56;

  // Divider
  ctx.strokeStyle = "rgba(57,255,20,0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad, y);
  ctx.lineTo(w - pad, y);
  ctx.stroke();
  y += 36;

  const cards = pickShareCards(session, maxCards);
  const topHitValue = cards[0] ? cards[0].estValue ?? cards[0].avgValue ?? 0 : 0;

  // Preload arts
  const arts = await Promise.all(cards.map((c) => loadCardArt(c.imageUrl)));

  // Grid layout
  const cols = format === "story" ? 2 : cards.length <= 4 ? 2 : 3;
  const gap = 28;
  const gridWidth = w - pad * 2;
  const cellW = (gridWidth - gap * (cols - 1)) / cols;
  // Card aspect ~2.5:3.5 trading card → height from width
  const artH = cellW * 1.28;
  const labelH = 78;
  const cellH = artH + labelH;
  const rows = Math.ceil(Math.max(1, cards.length) / cols);

  const gridTop = y;
  const availableBottom =
    format === "story" ? h - 160 : h - 120; // leave room for watermark
  const maxGridH = availableBottom - gridTop;
  let scale = 1;
  if (rows * cellH + (rows - 1) * gap > maxGridH && maxGridH > 200) {
    scale = maxGridH / (rows * cellH + (rows - 1) * gap);
  }
  const drawCellW = cellW * scale;
  const drawArtH = artH * scale;
  const drawLabelH = labelH * scale;
  const drawCellH = drawArtH + drawLabelH;
  const drawGap = gap * scale;
  // Re-center horizontally after scale
  const usedGridW = cols * drawCellW + (cols - 1) * drawGap;
  const gridLeft = (w - usedGridW) / 2;

  if (cards.length === 0) {
    ctx.fillStyle = "#94a3b8";
    ctx.font = "500 28px system-ui, sans-serif";
    ctx.fillText("No named hits this open — still a free sim.", pad, y + 40);
  }

  cards.forEach((card, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = gridLeft + col * (drawCellW + drawGap);
    const cy = gridTop + row * (drawCellH + drawGap);
    const value = card.estValue ?? card.avgValue ?? 0;
    const isTop = i === 0 || (topHitValue > 0 && value >= topHitValue * 0.85 && value >= 15);
    const name = card.cardName || card.name || card.slotName;

    // Card plate
    ctx.save();
    if (isTop) {
      ctx.shadowColor = "rgba(250,204,21,0.55)";
      ctx.shadowBlur = 28 * scale;
    } else if (value >= 50) {
      ctx.shadowColor = "rgba(191,0,255,0.4)";
      ctx.shadowBlur = 18 * scale;
    }
    ctx.fillStyle = "#0c0c16";
    roundRect(ctx, x, cy, drawCellW, drawCellH, 22 * scale);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = isTop
      ? "rgba(250,204,21,0.75)"
      : value >= 50
        ? "rgba(191,0,255,0.55)"
        : "rgba(57,255,20,0.28)";
    ctx.lineWidth = isTop ? 3.5 : 2;
    roundRect(ctx, x, cy, drawCellW, drawCellH, 22 * scale);
    ctx.stroke();

    // Art
    const artPad = 12 * scale;
    const artX = x + artPad;
    const artY = cy + artPad;
    const artW = drawCellW - artPad * 2;
    const artBoxH = drawArtH - artPad;
    const img = arts[i];
    ctx.save();
    roundRect(ctx, artX, artY, artW, artBoxH, 14 * scale);
    ctx.clip();
    if (img) {
      drawCover(ctx, img, artX, artY, artW, artBoxH);
    } else {
      drawPlaceholderCard(ctx, artX, artY, artW, artBoxH, name);
    }
    ctx.restore();

    // Name + $
    const textY = cy + drawArtH + 8 * scale;
    ctx.fillStyle = "#e2e8f0";
    ctx.font = `${isTop ? 700 : 600} ${Math.max(16, 22 * scale)}px system-ui, sans-serif`;
    ctx.fillText(
      truncate(ctx, name, drawCellW - 24 * scale),
      x + 12 * scale,
      textY + 22 * scale
    );
    ctx.fillStyle = isTop ? "#facc15" : "#6ee7b7";
    ctx.font = `700 ${Math.max(16, 24 * scale)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.fillText(
      value > 0 ? fmtMoney(value) : "—",
      x + 12 * scale,
      textY + 50 * scale
    );

    if (isTop && i === 0) {
      ctx.fillStyle = "rgba(250,204,21,0.95)";
      ctx.font = `750 ${Math.max(14, 18 * scale)}px system-ui, sans-serif`;
      ctx.fillText("TOP HIT", x + 12 * scale, cy + 28 * scale);
    }
  });

  // Soft watermark (not a giant URL CTA)
  ctx.fillStyle = "rgba(148,163,184,0.55)";
  ctx.font = "500 24px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Simulated · ripsportal.com", w / 2, h - 48);
  ctx.textAlign = "left";

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob_failed"))),
      "image/png",
      0.92
    );
  });
  return blob;
}

export interface SingleCardShareMeta {
  productId: string;
  productName: string;
  productEmoji?: string;
}

/**
 * Story-sized (1080×1920) share image for ONE pull — large art, name, $, watermark.
 * Reuses the same canvas helpers + /api/card-image proxy as the multi-pull collage.
 */
export async function renderSingleCardShareImage(
  pull: SimPull,
  meta: SingleCardShareMeta,
  options: Pick<ShareImageOptions, "format"> = {}
): Promise<Blob> {
  const format = options.format ?? "story";
  const { w, h } = SIZES[format];
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_unavailable");

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#030306");
  bg.addColorStop(0.45, "#0a1a12");
  bg.addColorStop(1, "#0a0614");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const orb = (cx: number, cy: number, r: number, color: string) => {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  };
  orb(w * 0.15, h * 0.12, 420, "rgba(57,255,20,0.18)");
  orb(w * 0.85, h * 0.28, 380, "rgba(191,0,255,0.14)");
  orb(w * 0.5, h * 0.92, 460, "rgba(0,240,255,0.10)");

  const pad = 56;
  let y = pad;

  ctx.fillStyle = "#4ade80";
  ctx.font = "750 42px system-ui, sans-serif";
  ctx.fillText("🌀 Rip Portal", pad, y + 42);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "600 22px system-ui, sans-serif";
  ctx.fillText("FREE PACK SIM", pad, y + 78);
  y += 110;

  const productLine = meta.productName;
  ctx.fillStyle = "#f1f5f9";
  ctx.font = "700 40px system-ui, sans-serif";
  ctx.fillText(truncate(ctx, productLine, w - pad * 2), pad, y + 40);
  y += 64;

  ctx.strokeStyle = "rgba(57,255,20,0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad, y);
  ctx.lineTo(w - pad, y);
  ctx.stroke();
  y += 40;

  const name = pull.cardName || pull.name || pull.slotName;
  const value = pull.estValue ?? pull.avgValue ?? 0;
  const isHit = value >= 50;
  const isTop = value >= 100;

  const art = await loadCardArt(pull.imageUrl);

  // Large centered card plate
  const maxArtW = Math.min(w - pad * 2, format === "story" ? 780 : 860);
  const artAspect = 5 / 7;
  let artW = maxArtW;
  let artH = artW / artAspect;
  const maxArtH = format === "story" ? h * 0.52 : h * 0.48;
  if (artH > maxArtH) {
    artH = maxArtH;
    artW = artH * artAspect;
  }
  const platePad = 22;
  const labelBlock = 150;
  const plateW = artW + platePad * 2;
  const plateH = artH + platePad + labelBlock;
  const plateX = (w - plateW) / 2;
  const plateY = y;

  ctx.save();
  if (isTop) {
    ctx.shadowColor = "rgba(250,204,21,0.55)";
    ctx.shadowBlur = 36;
  } else if (isHit) {
    ctx.shadowColor = "rgba(191,0,255,0.45)";
    ctx.shadowBlur = 28;
  } else {
    ctx.shadowColor = "rgba(57,255,20,0.25)";
    ctx.shadowBlur = 18;
  }
  ctx.fillStyle = "#0c0c16";
  roundRect(ctx, plateX, plateY, plateW, plateH, 28);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = isTop
    ? "rgba(250,204,21,0.8)"
    : isHit
      ? "rgba(191,0,255,0.6)"
      : "rgba(57,255,20,0.35)";
  ctx.lineWidth = isTop ? 4 : 2.5;
  roundRect(ctx, plateX, plateY, plateW, plateH, 28);
  ctx.stroke();

  const artX = plateX + platePad;
  const artY = plateY + platePad;
  ctx.save();
  roundRect(ctx, artX, artY, artW, artH, 18);
  ctx.clip();
  if (art) {
    drawCover(ctx, art, artX, artY, artW, artH);
  } else {
    drawPlaceholderCard(
      ctx,
      artX,
      artY,
      artW,
      artH,
      meta.productEmoji || name
    );
  }
  ctx.restore();

  if (isTop) {
    ctx.fillStyle = "rgba(250,204,21,0.95)";
    ctx.font = "750 28px system-ui, sans-serif";
    ctx.fillText("HIT", artX + 16, artY + 36);
  }

  const textX = plateX + platePad;
  const textY = artY + artH + 28;
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "700 36px system-ui, sans-serif";
  ctx.fillText(truncate(ctx, name, plateW - platePad * 2), textX, textY + 8);

  ctx.fillStyle = isTop ? "#facc15" : "#6ee7b7";
  ctx.font = "700 48px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText(value > 0 ? fmtMoney(value) : "—", textX, textY + 68);

  if (pull.slotName) {
    ctx.fillStyle = "#94a3b8";
    ctx.font = "500 22px system-ui, sans-serif";
    const slotLine = pull.odds ? `${pull.slotName} · ${pull.odds}` : pull.slotName;
    ctx.fillText(truncate(ctx, slotLine, plateW - platePad * 2), textX, textY + 108);
  }

  ctx.fillStyle = "rgba(148,163,184,0.55)";
  ctx.font = "500 24px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Simulated · ripsportal.com", w / 2, h - 48);
  ctx.textAlign = "left";

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob_failed"))),
      "image/png",
      0.92
    );
  });
  return blob;
}

export function canShareFiles(file: File): boolean {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return false;
  }
  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
  };
  if (typeof nav.canShare === "function") {
    try {
      return nav.canShare({ files: [file] });
    } catch {
      return false;
    }
  }
  // Older WebKit: try share and let caller catch AbortError / NotAllowed.
  return true;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2500);
}

async function shareBlobAsPng(
  blob: Blob,
  filename: string
): Promise<"shared" | "downloaded" | "cancelled" | "unsupported"> {
  const file = new File([blob], filename, { type: "image/png" });

  if (canShareFiles(file)) {
    try {
      // Files-only when possible so IG Stories / share sheet prioritizes the image
      // (not a link-first caption). Web cannot force-open the IG Stories camera.
      await navigator.share({ files: [file] });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return "cancelled";
      }
      // Some browsers reject files-only — retry with a tiny title, still no URL.
      try {
        await navigator.share({
          files: [file],
          title: "Rip Portal",
        });
        return "shared";
      } catch (err2) {
        if (err2 instanceof DOMException && err2.name === "AbortError") {
          return "cancelled";
        }
      }
    }
  } else if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return "unsupported";
  }

  downloadBlob(blob, filename);
  return "downloaded";
}

export async function shareOrDownloadOpenImage(
  session: SimSession,
  format: ShareImageFormat = "story"
): Promise<"shared" | "downloaded" | "cancelled" | "unsupported"> {
  const blob = await renderOpenShareImage(session, { format });
  const filename =
    format === "story"
      ? `rip-portal-${session.product.id}-story.png`
      : `rip-portal-${session.product.id}-square.png`;
  return shareBlobAsPng(blob, filename);
}

export async function shareOrDownloadSingleCardImage(
  pull: SimPull,
  meta: SingleCardShareMeta,
  format: ShareImageFormat = "story"
): Promise<"shared" | "downloaded" | "cancelled" | "unsupported"> {
  const blob = await renderSingleCardShareImage(pull, meta, { format });
  const slug = (pull.cardName || pull.name || meta.productId)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "card";
  const filename =
    format === "story"
      ? `rip-portal-${meta.productId}-${slug}-story.png`
      : `rip-portal-${meta.productId}-${slug}-square.png`;
  return shareBlobAsPng(blob, filename);
}

export async function downloadSingleCardShareImage(
  pull: SimPull,
  meta: SingleCardShareMeta,
  format: ShareImageFormat = "story"
): Promise<void> {
  const blob = await renderSingleCardShareImage(pull, meta, { format });
  const slug = (pull.cardName || pull.name || meta.productId)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "card";
  const filename =
    format === "story"
      ? `rip-portal-${meta.productId}-${slug}-story.png`
      : `rip-portal-${meta.productId}-${slug}-square.png`;
  downloadBlob(blob, filename);
}

export async function downloadOpenShareImage(
  session: SimSession,
  format: ShareImageFormat = "story"
): Promise<void> {
  const blob = await renderOpenShareImage(session, { format });
  const filename =
    format === "story"
      ? `rip-portal-${session.product.id}-story.png`
      : `rip-portal-${session.product.id}-square.png`;
  downloadBlob(blob, filename);
}
