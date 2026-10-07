import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // /api/og draws the share image for shared palette links; social crawlers must be able to fetch it.
    rules: { userAgent: "*", allow: ["/", "/api/og"], disallow: ["/api/", "/palettes"] },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
