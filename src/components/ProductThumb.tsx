"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";

type ThumbProduct = Pick<Product, "image" | "name">;

/**
 * One product image for picker rows, the name chip, and the pack stage.
 * Same src and object-contain so a set never shows a different thumb.
 */
export default function ProductThumb({
  product,
  className = "",
}: {
  product: ThumbProduct;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const src = product.image?.trim();
  if (!src || broken) {
    return (
      <span
        className={`inline-block shrink-0 rounded-md border border-zinc-700/70 bg-gradient-to-b from-zinc-800/80 to-zinc-950/90 ${className}`}
        aria-hidden
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={`shrink-0 rounded-md border border-zinc-700/80 bg-zinc-900 object-contain ${className}`}
      decoding="async"
      onError={() => setBroken(true)}
    />
  );
}
