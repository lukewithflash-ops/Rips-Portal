"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import Link from "next/link";
import { fmtMoney, type SimPull } from "@/lib/simulate";

export type CardZoomTier = "common" | "uncommon" | "rare" | "chase";

export interface CardZoomModalProps {
  pull: SimPull;
  tier: CardZoomTier;
  productId: string;
  productName: string;
  productEmoji?: string;
  onClose: () => void;
}

function getFocusable(root: HTMLElement): HTMLElement[] {
  const nodes = root.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );
  return Array.from(nodes).filter(
    (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1
  );
}

export default function CardZoomModal({
  pull,
  tier,
  productId,
  productName,
  productEmoji = "🃏",
  onClose,
}: CardZoomModalProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const title = pull.cardName || pull.name || pull.slotName;
  const value = pull.estValue ?? pull.avgValue;
  const isFiller = pull.odds === "filler" || value <= 0;
  const isChase = tier === "chase";

  useEffect(() => {
    previouslyFocused.current =
      typeof document !== "undefined"
        ? (document.activeElement as HTMLElement | null)
        : null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 30);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = getFocusable(panelRef.current);
      if (focusable.length === 0) {
        e.preventDefault();
        panelRef.current.focus();
        return;
      }
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !panelRef.current.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !panelRef.current.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onBackdrop = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  const onPanelKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    },
    [onClose]
  );

  return (
    <div
      className="card-zoom-backdrop"
      role="presentation"
      onMouseDown={onBackdrop}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className={`card-zoom-panel card-zoom-tier-${tier} ${
          isChase ? "card-zoom-panel-chase" : ""
        }`}
        onKeyDown={onPanelKeyDown}
      >
        <button
          ref={closeBtnRef}
          type="button"
          className="card-zoom-close"
          aria-label="Close card detail"
          onClick={onClose}
        >
          <span aria-hidden>×</span>
        </button>

        <div className="card-zoom-art-wrap">
          <div
            className={`card-zoom-art ${isChase ? "card-zoom-art-chase" : ""}`}
          >
            {pull.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pull.imageUrl}
                alt=""
                decoding="async"
                className="card-zoom-img"
                onError={(e) => {
                  const el = e.currentTarget;
                  el.style.display = "none";
                  const fb = el.nextElementSibling as HTMLElement | null;
                  if (fb) fb.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="card-zoom-art-fallback"
              style={{ display: pull.imageUrl ? "none" : "flex" }}
              aria-hidden
            >
              <span className="text-5xl">{productEmoji}</span>
            </div>
          </div>
        </div>

        <div className="card-zoom-body">
          <h2
            id={titleId}
            className="text-base sm:text-lg font-bold text-white leading-snug"
          >
            {title}
          </h2>

          <div id={descId} className="mt-3 space-y-2">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5">
              <div className="text-[9px] uppercase tracking-wider text-emerald-400/80">
                Estimated sim value
              </div>
              <div className="text-xl sm:text-2xl font-mono font-semibold text-emerald-300 mt-0.5">
                {isFiller ? "—" : fmtMoney(value)}
              </div>
            </div>

            {!isFiller && (
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="rounded-lg bg-black/40 border border-zinc-800 px-2 py-1.5">
                  <div className="text-[8px] uppercase tracking-wider text-zinc-600">
                    Slot avg
                  </div>
                  <div className="text-[11px] font-mono text-zinc-300 mt-0.5">
                    {fmtMoney(pull.avgValue)}
                  </div>
                </div>
                <div className="rounded-lg bg-black/40 border border-zinc-800 px-2 py-1.5">
                  <div className="text-[8px] uppercase tracking-wider text-zinc-600">
                    Rarity
                  </div>
                  <div className="text-[11px] text-zinc-300 mt-0.5 truncate">
                    {pull.slotName}
                  </div>
                </div>
                <div className="rounded-lg bg-black/40 border border-zinc-800 px-2 py-1.5">
                  <div className="text-[8px] uppercase tracking-wider text-zinc-600">
                    Odds
                  </div>
                  <div className="text-[11px] font-mono text-zinc-300 mt-0.5">
                    {pull.odds || "—"}
                  </div>
                </div>
              </div>
            )}

            {isFiller && (
              <p className="text-[11px] text-zinc-500">
                Pack filler · illustrative bulk for empty-pack feel (EV-honest
                $0).
              </p>
            )}

            <p className="text-[11px] leading-relaxed text-zinc-500">
              Illustrative estimate from Rip Portal’s free pack sim (slot rates ×
              model values) — not a live market quote or official pull rate.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href={`/?pack=${encodeURIComponent(productId)}`}
                className="text-[12px] px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/25"
                onClick={onClose}
              >
                View {productName} EV →
              </Link>
              <Link
                href={`/pack/${encodeURIComponent(productId)}`}
                className="text-[12px] px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200/90 hover:bg-cyan-500/20"
                onClick={onClose}
              >
                Pack page →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
