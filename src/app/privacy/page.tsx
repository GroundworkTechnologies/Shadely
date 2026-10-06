import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: `${SITE.name} has no accounts and no tracking. Palettes stay in your browser.`,
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-10 [&_p]:mt-3 [&_p]:text-muted">
      <h1 className="text-3xl font-normal">Privacy</h1>
      <p>{SITE.name} has no accounts, no analytics and no third-party scripts.</p>
      <p>
        Your palette lives in the page address, so a link you share contains that palette. Saved palettes and your light/dark preference are stored in your browser’s local storage and
        never sent to a server.
      </p>
      <p>
        Questions? Contact{" "}
        <a className="underline underline-offset-2" href={SITE.companyUrl}>
          {SITE.company}
        </a>
        .
      </p>
    </article>
  );
}
