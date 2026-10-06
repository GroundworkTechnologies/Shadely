"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { bestText, colorName, contrastMatrix, formatRatio, scorePair, type ContrastMetric, type NamedScale } from "@/engine";
import { Segmented } from "@/components/ui/segmented";
import { cn } from "@/lib/cn";

const fmt = (metric: ContrastMetric, v: number) => (metric === "wcag" ? `${formatRatio(v)}:1` : `Lc ${Math.floor(v)}`);

function firstStop(scale: NamedScale, metric: ContrastMetric, textOnShade: boolean, other: string) {
  return scale.steps.find((s) => (textOnShade ? scorePair(other, s.hex, metric) : scorePair(s.hex, other, metric)).pass);
}

export function ContrastPanel({ scale }: { scale: NamedScale }) {
  const [metric, setMetric] = useState<ContrastMetric>("wcag");
  const hexes = scale.steps.map((s) => s.hex);
  const matrix = contrastMatrix(hexes, metric);
  const onWhite = firstStop(scale, metric, false, "#ffffff");
  const whiteOn = firstStop(scale, metric, true, "#ffffff");
  const threshold = metric === "wcag" ? "4.5:1 (AA)" : "Lc 75";

  return (
    <section aria-labelledby="contrast-h" id="contrast" className="scroll-mt-4 rounded-card border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <h2 id="contrast-h" className="text-base font-medium">
            Accessibility <span className="font-normal text-muted">· {colorName((scale.steps.find((s) => s.isAnchor) ?? scale.steps[5]!).hex).family} ({scale.name})</span>
          </h2>
          <p className="text-sm text-muted">
            Body-text threshold: {threshold}.{" "}
            {metric === "apca" && "APCA is a draft standard (WCAG 3); WCAG 2.2 remains the compliance baseline."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Segmented
            label="Contrast metric"
            value={metric}
            onChange={setMetric}
            options={[
              { value: "wcag", label: "WCAG 2.2" },
              { value: "apca", label: "APCA" },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div>
          <h3 className="mb-2 text-sm font-medium">Each shade as a background</h3>
          <ul className="grid gap-1.5">
            {scale.steps.map((s) => {
              const best = bestText(s.hex, metric);
              return (
                <li key={s.stop} className="flex items-center gap-3 rounded-control px-3 py-1.5 text-sm" style={{ backgroundColor: s.hex, color: best.color }}>
                  <span className="w-9 font-medium tabular-nums">{s.stop}</span>
                  <span className="tabular-nums text-xs opacity-90">{best.color === "#ffffff" ? "white" : "black"} text</span>
                  <span className="ml-auto tabular-nums">{fmt(metric, best.score.value)}</span>
                  <span className="w-20 text-right text-xs font-medium">
                    {best.score.pass ? "✓ " : "✕ "}
                    {best.score.label}
                  </span>
                </li>
              );
            })}
          </ul>
          <dl className="mt-4 grid gap-1 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Lightest {scale.name} shade that works as text on white</dt>
              <dd className="font-medium">{onWhite ? onWhite.stop : "none"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Lightest {scale.name} shade that works as a background for white text</dt>
              <dd className="font-medium">{whiteOn ? whiteOn.stop : "none"}</dd>
            </div>
          </dl>
        </div>

        <div className="min-w-0">
          <h3 className="mb-2 text-sm font-medium">Pairing matrix</h3>
          <p className="mb-2 text-xs text-muted">Rows are backgrounds, columns are text. A tick means the pair passes {threshold} for body text.</p>
          <div className="overflow-x-auto">
            <table className="border-separate border-spacing-0.5 text-center text-xs">
              <caption className="sr-only">Contrast of every {scale.name} shade used as text on every {scale.name} shade</caption>
              <thead>
                <tr>
                  <td />
                  {scale.steps.map((s) => (
                    <th key={s.stop} scope="col" className="px-1 pb-1 font-medium text-muted">
                      {s.stop}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scale.steps.map((bg, r) => (
                  <tr key={bg.stop}>
                    <th scope="row" className="pr-1.5 text-right font-medium text-muted">
                      {bg.stop}
                    </th>
                    {scale.steps.map((fg, c) => {
                      const cell = matrix[r]![c]!;
                      const same = r === c;
                      return (
                        <td
                          key={fg.stop}
                          title={same ? undefined : `${bg.stop} background, ${fg.stop} text: ${fmt(metric, cell.value)} ${cell.label}`}
                          aria-label={same ? `${bg.stop} on itself` : `${bg.stop} background, ${fg.stop} text: ${fmt(metric, cell.value)}, ${cell.label}`}
                          className={cn("relative size-8 rounded-sm font-medium", same && "opacity-30")}
                          style={{ backgroundColor: bg.hex, color: fg.hex }}
                        >
                          {same ? "" : "Aa"}
                          {!same && cell.pass && <Check aria-hidden strokeWidth={3} className="absolute right-0.5 top-0.5 size-2.5 rounded-full bg-white p-px text-black" />}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
