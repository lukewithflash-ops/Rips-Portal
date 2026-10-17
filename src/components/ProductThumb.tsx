"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";

type ThumbProduct = Pick<Product, "image" | "name">;

/** Resized copy of a local product shot (scripts/make-thumbs.mjs). Same image, fewer bytes. */
function smallSrc(src: string): string {
  return src.startsWith("/products/") && !src.startsWith("/products/thumb/")
    ? src.replace("/products/", "/products/thumb/").replace(/\.(png|jpe?g)$/i, ".webp")
    : src;
}

/**
 * One product image for picker rows, the name chip, and the pack stage.
 * Same image and object-contain so a set never shows a different thumb.
 * `small` (list rows) loads the resized copy and falls back to the original.
 */
export default function ProductThumb({
  product,
  className = "",
  small = false,
}: {
  product: ThumbProduct;
  className?: string;
  small?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  const [useOriginal, setUseOriginal] = useState(false);
  const src = product.image?.trim();
  if (!src || broken) {
    return (
      <span
        className={`inline-block shrink-0 rounded-md border border-zinc-700/70 bg-gradient-to-b from-zinc-800/80 to-zinc-950/90 ${className}`}
        aria-hidden
      />
    );
  }
  const shown = small && !useOriginal ? smallSrc(src) : src;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={shown}
      alt=""
      className={`shrink-0 rounded-md border border-zinc-700/80 bg-zinc-900 object-contain ${className}`}
      decoding="async"
      loading="lazy"
      onError={() => (shown !== src ? setUseOriginal(true) : setBroken(true))}
    />
  );
}
