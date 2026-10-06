"use client";

import { useState } from "react";
import { simulateVision, VISION_LABELS, visionPairs, type NamedScale, type VisionMode } from "@/engine";
import { Segmented } from "@/components/ui/segmented";
import { cn } from "@/lib/cn";

const LEVEL = { confusable: "Hard to tell apart", close: "Close", ok: "Distinct" } as const;

/** Which of your scales become hard to tell apart for people with a color-vision deficiency. */
export function VisionCheck({ scales }: { scales: NamedScale[] }) {
  const [mode, setMode] = useState<VisionMode>("deuteranopia");
  const colors = scales
    .filter((s) => s.kind !== "neutral")
    .map((s) => ({ name: s.name, hex: (s.steps.find((x) => x.stop === 500) ?? s.steps[5]!).hex }));
  const pairs = visionPairs(colors, mode);
  const risky = pairs.filter((p) => p.level !== "ok");

  return (
    <section aria-labelledby="vision-h" className="rounded-card border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <h2 id="vision-h" className="text-base font-medium">
            Color-vision check
          </h2>
          <p className="text-sm text-muted">Compares the 500 shade of each scale as seen with {VISION_LABELS[mode].toLowerCase()}.</p>
        </div>
        <Segmented
          label="Vision type"
          value={mode}
          onChange={setMode}
          options={[
            { value: "protanopia", label: "Protan" },
            { value: "deuteranopia", label: "Deutan" },
            { value: "tritanopia", label: "Tritan" },
            { value: "achromatopsia", label: "Mono" },
          ]}
        />
      </div>
      <div className="p-5">
        <p className="mb-4 text-sm" role="status">
          {risky.length === 0 ? "Every pair stays distinct." : `${risky.length} pair${risky.length > 1 ? "s" : ""} may be confused. Do not rely on color alone for these: add an icon, label or pattern.`}
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {pairs.slice(0, 8).map((p) => {
            const A = colors.find((c) => c.name === p.a)!;
            const B = colors.find((c) => c.name === p.b)!;
            return (
              <li key={`${p.a}-${p.b}`} className="flex items-center gap-3 rounded-control border border-border px-3 py-2 text-sm">
                <span aria-hidden className="flex overflow-hidden rounded-md border border-border">
                  <span className="size-7" style={{ background: simulateVision(A.hex, mode) }} />
                  <span className="size-7" style={{ background: simulateVision(B.hex, mode) }} />
                </span>
                <span className="min-w-0 flex-1 truncate">
                  {p.a} vs {p.b}
                </span>
                <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-medium", p.level === "ok" ? "bg-surface-muted text-muted" : "bg-foreground text-background")}>
                  {p.level === "ok" ? "✓ " : "! "}
                  {LEVEL[p.level]}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs text-muted">Distance is measured in OKLab: under 0.05 is hard to tell apart, under 0.10 is close. The simulation uses the Machado et al. (2009) model.</p>
      </div>
    </section>
  );
}
