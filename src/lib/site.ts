import { PAGES } from "./seo";

export const SITE = {
  name: "Shadely",
  tagline: "Tailwind Color Palette Generator",
  description: PAGES.home.description,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  company: "Groundwork Technologies",
  companyUrl: "https://groundwork.co.ke",
  repoUrl: "https://github.com/GroundworkTechnologies/Shadely",
} as const;
