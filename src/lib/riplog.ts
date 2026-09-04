import { calculateEV, products, type Product } from "@/lib/products";

export const RIP_LOG_DISCLAIMER =
  "Rip Log is a personal math notebook for entertainment — not financial, investment, or collecting advice. Values use catalog slot averages, not live market quotes. Variance is huge; a single session proves nothing about +EV.";

/** Compact session payload for URL sharing (no DB). */
export interface RipLogSessionV1 {
  v: 1;
  /** Product id */
  p: string;
  /** Quantity ripped */
  q: number;
  /** Price paid per unit */
  pr: number;
  /** Hit counts per slot index (same order as product.slots) */
  c: number[];
  /** Optional note */
  n?: string;
}

export interface RipLogStats {
  product: Product;
  quantity: number;
  pricePerUnit: number;
  costPaid: number;
  expectedEV: number;
  actualValue: number;
  profitVsCost: number;
  roiVsCost: number;
  expectedProfit: number;
  /** Actual − expected EV for the session */
  vsExpected: number;
  /** (actual − expected) / expected * 100 when expected > 0 */
  vsExpectedPct: number | null;
  slotRows: {
    name: string;
    count: number;
    avgValue: number;
    value: number;
    expectedCount: number;
  }[];
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  const b64 =
    typeof btoa === "function"
      ? btoa(bin)
      : Buffer.from(bytes).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  if (typeof atob === "function") {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  return new Uint8Array(Buffer.from(b64, "base64"));
}

export function encodeSession(session: RipLogSessionV1): string {
  const json = JSON.stringify(session);
  const bytes = new TextEncoder().encode(json);
  return toBase64Url(bytes);
}

export function decodeSession(encoded: string): RipLogSessionV1 | null {
  try {
    const bytes = fromBase64Url(encoded.trim());
    const json = new TextDecoder().decode(bytes);
    const data = JSON.parse(json) as RipLogSessionV1;
    if (data?.v !== 1 || typeof data.p !== "string") return null;
    if (!Number.isFinite(data.q) || data.q < 1) return null;
    if (!Number.isFinite(data.pr) || data.pr < 0) return null;
    if (!Array.isArray(data.c)) return null;
    return {
      v: 1,
      p: data.p,
      q: Math.min(9999, Math.floor(data.q)),
      pr: Math.round(data.pr * 100) / 100,
      c: data.c.map((n) =>
        Math.max(0, Math.min(99999, Math.floor(Number(n) || 0)))
      ),
      ...(typeof data.n === "string" && data.n.trim()
        ? { n: data.n.trim().slice(0, 120) }
        : {}),
    };
  } catch {
    return null;
  }
}

export function findProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function buildSession(
  product: Product,
  quantity: number,
  pricePerUnit: number,
  counts: number[],
  note?: string
): RipLogSessionV1 {
  const padded = product.slots.map((_, i) =>
    Math.max(0, Math.floor(counts[i] ?? 0))
  );
  return {
    v: 1,
    p: product.id,
    q: Math.max(1, Math.floor(quantity)),
    pr: Math.max(0, Math.round(pricePerUnit * 100) / 100),
    c: padded,
    ...(note?.trim() ? { n: note.trim().slice(0, 120) } : {}),
  };
}

export function computeRipLogStats(session: RipLogSessionV1): RipLogStats | null {
  const product = findProduct(session.p);
  if (!product) return null;

  const quantity = Math.max(1, session.q);
  const pricePerUnit = Math.max(0, session.pr);
  const { totalEV } = calculateEV(product, pricePerUnit);

  const slotRows = product.slots.map((slot, i) => {
    const count = Math.max(0, Math.floor(session.c[i] ?? 0));
    return {
      name: slot.name,
      count,
      avgValue: slot.avgValue,
      value: count * slot.avgValue,
      expectedCount: slot.oddsNum * quantity,
    };
  });

  const actualValue = slotRows.reduce((sum, r) => sum + r.value, 0);
  const costPaid = pricePerUnit * quantity;
  const expectedEV = totalEV * quantity;
  const profitVsCost = actualValue - costPaid;
  const roiVsCost = costPaid > 0 ? (profitVsCost / costPaid) * 100 : 0;
  const expectedProfit = expectedEV - costPaid;
  const vsExpected = actualValue - expectedEV;
  const vsExpectedPct =
    expectedEV > 0 ? (vsExpected / expectedEV) * 100 : null;

  return {
    product,
    quantity,
    pricePerUnit,
    costPaid,
    expectedEV,
    actualValue,
    profitVsCost,
    roiVsCost,
    expectedProfit,
    vsExpected,
    vsExpectedPct,
    slotRows,
  };
}

export function sessionSharePath(encoded: string): string {
  return `/log?s=${encoded}`;
}

const LS_KEY = "rip-portal-log-v1";

export function saveSessionLocal(encoded: string, label: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    const list: { e: string; label: string; at: number }[] = raw
      ? JSON.parse(raw)
      : [];
    const next = [
      { e: encoded, label, at: Date.now() },
      ...list.filter((x) => x.e !== encoded),
    ].slice(0, 12);
    window.localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / private mode */
  }
}

export function loadLocalSessions(): { e: string; label: string; at: number }[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as { e: string; label: string; at: number }[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function fmtMoney(n: number): string {
  const abs = Math.abs(n);
  const body = abs >= 100 ? abs.toFixed(0) : abs.toFixed(2);
  return `${n < 0 ? "-" : ""}$${body}`;
}

export function fmtPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}
