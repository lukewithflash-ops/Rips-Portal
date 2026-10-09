import type { MetadataRoute } from "next";
import { products, pricesUpdated } from "@/lib/products";
import { listSets } from "@/lib/sets";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/open`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${base}/log`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/deals`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/vip`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/waitlist`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${base}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${base}/recap`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${base}/shop`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.35,
    },
  ];

  // Shareable pack pages for the full catalog (hot + chase + value)
  const packRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/pack/${p.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p.tag === "hot" || p.tag === "chase" ? 0.9 : 0.75,
  }));

  // Per-set EV pages (only products with a real sheet price)
  const sheetDate = new Date(`${pricesUpdated}T12:00:00Z`);
  const evRoutes: MetadataRoute.Sitemap = [
    {
      url: `${base}/ev`,
      lastModified: sheetDate,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
    ...listSets().map((g) => ({
      url: `${base}/ev/${g.slug}`,
      lastModified: sheetDate,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];

  return [...staticRoutes, ...evRoutes, ...packRoutes];
}
