import type { Metadata } from "next";
import Link from "next/link";
import { CopySwatch } from "@/components/site/copy-swatch";
import { PAGES } from "@/lib/seo";
import { tailwindFamilies } from "@/lib/tailwind-colors";

const P = PAGES.tailwindColors;
export const metadata: Metadata = { title: P.title, description: P.description, alternates: { canonical: P.path } };

export default function TailwindColorsPage() {
  const families = tailwindFamilies();
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10">
      <h1 className="text-3xl font-normal">Tailwind CSS default colors</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Every Tailwind CSS default color, read from the Tailwind v4 theme so the values always match. Click a shade to copy its OKLCH value, or pick a family to start a palette from its 500 shade.
      </p>
      <div className="mt-8 grid gap-5">
        {families.map((f) => (
          <section key={f.name} aria-label={f.name}>
            <div className="mb-1.5 flex items-center justify-between">
              <h2 className="text-sm font-medium capitalize">{f.name}</h2>
              <Link href={`/?b=${f.steps[5]!.hex.slice(1)}`} className="text-sm text-muted underline underline-offset-2 hover:text-foreground">
                Start a palette from {f.name} 500
              </Link>
            </div>
            <ul className="grid grid-cols-11 overflow-hidden rounded-control border border-border">
              {f.steps.map((s) => (
                <li key={s.stop}>
                  <CopySwatch hex={s.hex} oklch={s.oklch} label={`${f.name}-${s.stop}`} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted">Tailwind v3 values are the legacy hex palette; they are not bundled here because Tailwind v4 no longer ships them.</p>
    </div>
  );
}
