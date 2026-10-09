"use client";

import { useState } from "react";

/** Download (or share on phones) the recap PNG. */
export default function RecapDownload({ src, filename }: { src: string; filename: string }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const go = async () => {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch(src, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const file = new File([blob], filename, { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d?: ShareData) => boolean };
      if (typeof nav.share === "function" && nav.canShare?.({ files: [file] })) {
        try {
          await nav.share({ files: [file], title: "Rip Portal recap" });
          setNote("Shared.");
          return;
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") return;
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2500);
      setNote("Downloaded.");
    } catch {
      setNote("Couldn't make the image just now. Try again in a minute.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => void go()}
        disabled={busy}
        className="rounded-xl px-4 py-2.5 text-[14px] font-semibold bg-emerald-500/20 border border-emerald-400/50 text-emerald-100 hover:bg-emerald-500/30 disabled:opacity-60"
      >
        {busy ? "…" : "Download image"}
      </button>
      {note && <span className="text-[12px] text-zinc-400">{note}</span>}
    </div>
  );
}
