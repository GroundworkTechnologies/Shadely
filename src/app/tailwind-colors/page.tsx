import type { Metadata } from "next";
import { TailwindExplorer } from "@/components/site/tailwind-explorer";
import { apcaLc, formatHsl } from "@/engine";
import { pageMetadata } from "@/lib/page-metadata";
import { tailwindFamilies } from "@/lib/tailwind-colors";

export const metadata: Metadata = pageMetadata("tailwindColors");

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
      <h1 className="text-3xl font-semibold">Tailwind CSS default colors</h1>
      <p className="mt-3 max-w-2xl text-base text-muted">
        These are the Tailwind CSS default colors in v4, read from the installed theme so the values always match. Click a shade to copy it, check APCA contrast, or start a palette from any family.
      </p>
      <div className="mt-10">
        <TailwindExplorer families={families} />
      </div>
    </div>
  );
}
