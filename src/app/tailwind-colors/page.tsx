import type { Metadata } from "next";
import { TailwindExplorer } from "@/components/site/tailwind-explorer";
import { apcaLc, formatHsl } from "@/engine";
import { PAGES } from "@/lib/seo";
import { tailwindFamilies } from "@/lib/tailwind-colors";

const P = PAGES.tailwindColors;
export const metadata: Metadata = { title: P.title, description: P.description, alternates: { canonical: P.path } };

export default function TailwindColorsPage() {
  const families = tailwindFamilies().map((f) => ({
    name: f.name,
    steps: f.steps.map((s) => ({
      ...s,
      hsl: formatHsl(s.hex),
      lcWhite: Math.round(apcaLc("#ffffff", s.hex)),
      lcBlack: Math.round(apcaLc("#000000", s.hex)),
    })),
  }));
  return (
    <div className="page-container py-10">
      <h1 className="text-3xl font-semibold">Tailwind Colors</h1>
      <p className="mt-3 max-w-2xl text-base text-muted">
        Every Tailwind CSS v4 default color, read from the installed theme so the values always match. Click a shade to copy it, check APCA contrast, or start a palette from any family.
      </p>
      <div className="mt-10">
        <TailwindExplorer families={families} />
      </div>
    </div>
  );
}
