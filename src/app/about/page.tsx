import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `${SITE.name} is a free Tailwind color palette generator by ${SITE.company}.`,
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-10 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-medium [&_p]:mt-3 [&_p]:text-muted [&_li]:mt-1 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-muted">
      <h1 className="text-3xl font-normal">About {SITE.name}</h1>
      <p>
        {SITE.name} turns one color into a complete, accessible Tailwind palette. It is built by{" "}
        <a className="underline underline-offset-2" href={SITE.companyUrl}>
          {SITE.company}
        </a>
        .
      </p>
      <h2>How scales are made</h2>
      <p>
        Scales are generated in OKLCH, where equal lightness steps look equal across hues. The shape of the lightness and chroma curves follows Tailwind v4’s own palettes. Your color is
        pinned exactly at the stop it naturally belongs to, so a light yellow is not forced to 500 and a deep navy is not forced to look brighter than it is. Out-of-gamut shades are
        brought into sRGB by reducing chroma at constant lightness and hue, never by clipping channels.
      </p>
      <h2>Accessibility</h2>
      <p>
        Contrast is computed from the exact hex values you export. WCAG 2.2 is the default metric. APCA, the draft WCAG 3 method, is available as an informational second opinion.
      </p>
      <h2>Formats</h2>
      <ul>
        <li>Tailwind v4 <code>@theme</code> and Tailwind v3 config (ESM, CommonJS, TypeScript)</li>
        <li>CSS variables and SCSS</li>
        <li>JSON, W3C design tokens, Tokens Studio</li>
      </ul>
      <p>Everything runs in your browser. There are no accounts and no uploads.</p>
    </article>
  );
}
