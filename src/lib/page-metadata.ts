import type { Metadata } from "next";
import { PAGES, type PageKey } from "./seo";
import { SITE } from "./site";

/**
 * All the metadata a page needs, from one entry in PAGES, so the title, description, canonical
 * link and social tags always agree (and differ between pages).
 */
// A page that sets its own openGraph or twitter object replaces the inherited share image, so it is repeated here.
const SHARE_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: "Shadely: one color in, an accessible Tailwind palette out" };

export function pageMetadata(key: PageKey): Metadata {
  const p = PAGES[key];
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: p.path },
    ...(p.index ? {} : { robots: { index: false, follow: true } }),
    openGraph: { type: "website", siteName: SITE.name, locale: "en_US", title: p.title, description: p.description, url: p.path, images: [SHARE_IMAGE] },
    twitter: { card: "summary_large_image", title: p.title, description: p.description, images: [SHARE_IMAGE.url] },
  };
}
