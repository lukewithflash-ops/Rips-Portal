"use client";

import { useState } from "react";
import { shareOrDownloadVerdictImage } from "@/lib/verdictShare";

export default function VerdictShareButton({
  productId,
  price,
  className = "",
}: {
  productId: string;
  price: number;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const onClick = async () => {
    if (busy || !Number.isFinite(price) || price < 0) return;
    setBusy(true);
    setNote(null);
    try {
      const outcome = await shareOrDownloadVerdictImage(productId, price);
      if (outcome === "shared") setNote("Shared");
      else if (outcome === "downloaded") setNote("Saved image");
      else setNote(null);
    } catch {
      setNote("Couldn’t build share image");
    } finally {
      setBusy(false);
      window.setTimeout(() => setNote(null), 2800);
    }
  };

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => void onClick()}
        disabled={busy}
        className="text-[11px] px-2.5 py-1.5 rounded-lg bg-black/40 border border-zinc-700 text-zinc-200 hover:border-emerald-500/40 hover:text-emerald-200 transition-colors disabled:opacity-40"
      >
        {busy ? "Building…" : "Share verdict"}
      </button>
      {note && <span className="text-[10px] text-zinc-500">{note}</span>}
    </span>
  );
}
