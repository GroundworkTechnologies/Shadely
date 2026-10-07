/**
 * Titles and descriptions for every page, kept together so they can be checked as a set
 * (see SEO.md): "Name: Tagline" titles, descriptions under 160 characters, nothing duplicated.
 */
export interface PageSeo {
  path: string;
  title: string;
  description: string;
  /** Page has a single primary keyword; it must appear in the title and description. */
  keyword: string;
  index: boolean;
}

export const PAGES = {
  home: {
    path: "/",
    title: "Tailwind CSS Color Generator",
    description: "Turn one brand color into a Tailwind color palette that passes contrast. Free, with live previews and exports for Tailwind, shadcn/ui and Flutter.",
    keyword: "Tailwind color palette",
    index: true,
  },
  tailwindColors: {
    path: "/tailwind-colors",
    title: "Shadely: Tailwind CSS Default Colors",
    description: "Browse every Tailwind CSS v4 default color with OKLCH and hex values. Click a shade to copy it, or start your own palette from it.",
    keyword: "Tailwind CSS default colors",
    index: true,
  },
  about: {
    path: "/about",
    title: "Shadely: How Our OKLCH Color Scales Work",
    description: "See how Shadely builds OKLCH color scales, checks WCAG and APCA contrast, and exports to Tailwind v4, v3, shadcn/ui and mobile apps.",
    keyword: "OKLCH color scales",
    index: true,
  },
  privacy: {
    path: "/privacy",
    title: "Shadely: No Accounts, No Tracking",
    description: "Shadely has no accounts, no analytics and no uploads. Your palettes stay in your browser. Read exactly what is stored and why.",
    keyword: "no accounts",
    index: true,
  },
  palettes: {
    path: "/palettes",
    title: "Shadely: Your Saved Palettes",
    description: "The palettes you saved in this browser. They never leave your device, and you can back them up as a file.",
    keyword: "saved palettes",
    index: false,
  },
} as const satisfies Record<string, PageSeo>;

export type PageKey = keyof typeof PAGES;
