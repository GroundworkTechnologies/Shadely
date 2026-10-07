import type { MetadataRoute } from "next";
import { PAGES } from "@/lib/seo";
import { SITE } from "@/lib/site";

const BUILT = new Date();

/** Every indexable page, at the exact address its canonical link uses. */
export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(PAGES)
    .filter((p) => p.index)
    .map((p) => ({
      url: `${SITE.url}${p.path}`,
      lastModified: BUILT,
      changeFrequency: "monthly",
      priority: p.path === "/" ? 1 : 0.6,
    }));
}
