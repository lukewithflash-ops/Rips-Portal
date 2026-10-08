/** Client helper: fetch the verdict OG image and share or download it. */

function downloadBlob(blob: Blob, filename: string) {
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

function canShareFiles(file: File): boolean {
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
  return true;
}

export function verdictImageUrl(productId: string, price: number): string {
  const params = new URLSearchParams({
    id: productId,
    price: String(Math.round(price * 100) / 100),
  });
  return `/api/verdict?${params.toString()}`;
}

export async function shareOrDownloadVerdictImage(
  productId: string,
  price: number
): Promise<"shared" | "downloaded" | "cancelled"> {
  const res = await fetch(verdictImageUrl(productId, price));
  if (!res.ok) throw new Error(`verdict_image_${res.status}`);
  const blob = await res.blob();
  const filename = `rip-portal-${productId}-verdict.png`;
  const file = new File([blob], filename, { type: "image/png" });

  if (canShareFiles(file)) {
    try {
      await navigator.share({
        files: [file],
        title: "Rip Portal verdict",
      });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  downloadBlob(blob, filename);
  return "downloaded";
}
