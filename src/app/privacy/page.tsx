import type { Metadata } from "next";
import { PAGES } from "@/lib/seo";
import { SITE } from "@/lib/site";

const P = PAGES.privacy;
export const metadata: Metadata = { title: P.title, description: P.description, alternates: { canonical: P.path } };

export default function Privacy() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-10 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-medium [&_p]:mt-3 [&_p]:text-muted">
      <h1 className="text-3xl font-normal sm:text-4xl">No accounts, no tracking</h1>
      <p>{SITE.name} has no accounts, no analytics and no third-party scripts. Nothing you do here is sent to us.</p>

      <h2>What is stored</h2>
      <p>
        Your palette lives in the page address, so a link you share contains that palette. Saved palettes and your light or dark choice are kept in your browser&apos;s local storage on
        your own device.
      </p>

      <h2>What loads from elsewhere</h2>
      <p>The preview pages show photos from Unsplash, so your browser requests those images from Unsplash&apos;s servers. Fonts are served from this site.</p>

      <h2>Questions</h2>
      <p>
        Contact{" "}
        <a className="underline underline-offset-2" href={SITE.companyUrl}>
          {SITE.company}
        </a>
        .
      </p>
    </article>
  );
}
