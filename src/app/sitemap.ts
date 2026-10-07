import type { MetadataRoute } from "next";
import { PAGES } from "@/lib/seo";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(PAGES)
    .filter((p) => p.index)
    .map((p) => ({ url: `${SITE.url}${p.path === "/" ? "" : p.path}`, changeFrequency: "monthly", priority: p.path === "/" ? 1 : 0.6 }));
}
