import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMetadata("about");

const FAQ = [
  ["Is Shadely free?", "Yes. Every feature works without paying or signing up."],
  ["Do I need an account?", "No. Your palette lives in the page address, so you can share it as a link. Saved palettes stay in your browser."],
  ["Does it work with Tailwind v3?", "Yes. Export a v3 config as ESM, CommonJS or TypeScript, or a Tailwind v4 theme block. Hex is safest for v3."],
  ["Which contrast standard does it use?", "WCAG 2.2 is the default. APCA, the draft method for WCAG 3, is there as a second opinion."],
] as const;

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
};

export default function About() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-10 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-medium [&_h3]:mt-6 [&_h3]:font-medium [&_li]:mt-1 [&_p]:mt-3 [&_p]:text-muted [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-muted">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <h1 className="text-3xl font-normal sm:text-4xl">How Shadely builds your color scales</h1>
      <p>
        Shadely turns one color into a full set of OKLCH color scales, from 50 to 950, ready for Tailwind CSS. It is made by{" "}
        <a className="underline underline-offset-2" href={SITE.companyUrl}>
          {SITE.company}
        </a>
        . Try it on the{" "}
        <Link className="underline underline-offset-2" href="/">
          palette generator
        </Link>
        .
      </p>

      <h2>Your color keeps its place</h2>
      <p>Your color lands on the shade it naturally belongs to. A light yellow is not forced to 500, and a deep navy is not made brighter than it is.</p>

      <h2>Even steps in every hue</h2>
      <p>
        Scales are built in OKLCH, where equal steps in lightness look equal across hues. The shape follows Tailwind v4&apos;s own palettes. Colors that do not fit on screen lose
        a little chroma and keep their lightness and hue, instead of being clipped.
      </p>

      <h2>Contrast you can check</h2>
      <p>Every number is computed from the exact hex values you export. Check each shade against the others in the pairing matrix, or switch on the AA option to adjust the shades that fall short.</p>

      <h2>Export to your stack</h2>
      <ul>
        <li>Tailwind v4 theme and Tailwind v3 config</li>
        <li>CSS variables, modern CSS and SCSS</li>
        <li>JSON, W3C design tokens, Tokens Studio and Style Dictionary</li>
        <li>shadcn/ui theme, Flutter, Android, Jetpack Compose and iOS</li>
      </ul>

      <h2>Common questions</h2>
      {FAQ.map(([q, a]) => (
        <section key={q}>
          <h3>{q}</h3>
          <p>{a}</p>
        </section>
      ))}
    </article>
  );
}
