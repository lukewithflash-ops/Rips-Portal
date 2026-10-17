// Small copies of /public/products/* for picker rows (same image, resized).
// Run: node scripts/make-thumbs.mjs   (skips thumbs that are already newer)
import sharp from "sharp";
import { readdirSync, mkdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const SRC = "public/products";
const OUT = join(SRC, "thumb");
mkdirSync(OUT, { recursive: true });
let made = 0;
for (const f of readdirSync(SRC)) {
  if (!/\.(webp|png|jpe?g)$/i.test(f)) continue;
  const inPath = join(SRC, f);
  const outPath = join(OUT, f.replace(/\.(png|jpe?g)$/i, ".webp"));
  if (existsSync(outPath) && statSync(outPath).mtimeMs >= statSync(inPath).mtimeMs) continue;
  await sharp(inPath)
    .resize({ height: 336, width: 336, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(outPath);
  made++;
}
console.log(`thumbs: ${made} written`);
