import type { Metadata } from "next";
import Link from "next/link";
import { CopySwatch } from "@/components/site/copy-swatch";
import { tailwindFamilies } from "@/lib/tailwind-colors";

export const metadata: Metadata = {
  title: "Tailwind CSS default colors (v4)",
  description: "Every Tailwind CSS v4 default color with OKLCH and hex values. Click a shade to copy it, or use any shade as the base for a new palette.",
  alternates: { canonical: "/tailwind-colors" },
};

export default function TailwindColorsPage() {
  const families = tailwindFamilies();
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10">
      <h1 className="text-3xl font-normal">Tailwind CSS default colors</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Read straight from the installed Tailwind v4 theme, so values never drift. Click a shade to copy its OKLCH value. “Use” opens it as the base of a new palette.
      </p>
      <div className="mt-8 grid gap-5">
        {families.map((f) => (
          <section key={f.name} aria-label={f.name}>
            <div className="mb-1.5 flex items-center justify-between">
              <h2 className="text-sm font-medium capitalize">{f.name}</h2>
              <Link href={`/?b=${f.steps[5]!.hex.slice(1)}`} className="text-sm text-muted underline underline-offset-2 hover:text-foreground">
                Use {f.name} 500
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
