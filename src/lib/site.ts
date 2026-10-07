import { PAGES } from "./seo";

export const SITE = {
  name: "Shadely",
  tagline: "Tailwind Color Palette Generator",
  description: PAGES.home.description,
  // Production address. Set NEXT_PUBLIC_SITE_URL to override it, for example on a preview deployment.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://shadely.groundwork.co.ke").replace(/\/$/, ""),
  company: "Groundwork Technologies",
  companyUrl: "https://groundwork.co.ke",
  repoUrl: "https://github.com/GroundworkTechnologies/Shadely",
} as const;
