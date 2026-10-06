"use client";

import { Copy } from "lucide-react";
import { formatHsl, formatOklch, formatRgb, type NamedScale } from "@/engine";

export function ColorInfoPanel({ scale, onCopy }: { scale: NamedScale; onCopy: (text: string, label: string) => void }) {
  const cell = (text: string, label: string) => (
    <button type="button" onClick={() => onCopy(text, label)} aria-label={`Copy ${label} ${text}`} className="group inline-flex items-center gap-1.5 rounded px-1.5 py-1 font-mono text-xs hover:bg-surface-muted">
      {text}
      <Copy className="size-3 opacity-0 group-hover:opacity-60 group-focus-visible:opacity-60" aria-hidden />
    </button>
  );
  return (
    <section aria-labelledby="info-h" id="color-info" className="scroll-mt-4 rounded-2xl border border-border bg-surface">
      <div className="border-b border-border p-4">
        <h2 id="info-h" className="text-base font-semibold">
          Color info <span className="font-normal text-muted">· {scale.name}</span>
        </h2>
        <p className="text-sm text-muted">Every value for every stop. Click any value to copy it.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="text-muted">
            <tr>
              {["", "Stop", "Tailwind class", "Hex", "OKLCH", "HSL", "RGB"].map((h, i) => (
                <th key={i} scope="col" className="px-3 py-2 font-medium">
                  {h || <span className="sr-only">Swatch</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scale.steps.map((s) => (
              <tr key={s.stop} className="border-t border-border">
                <td className="px-3 py-1.5">
                  <span aria-hidden className="block size-6 rounded-md border border-border" style={{ backgroundColor: s.hex }} />
                </td>
                <th scope="row" className="px-3 py-1.5 font-medium">
                  {s.stop}
                  {s.isAnchor && <span className="ml-2 rounded bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-muted">base</span>}
                  {s.clipped && <span className="ml-2 rounded bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-muted">gamut-limited</span>}
                </th>
                <td>{cell(`bg-${scale.name}-${s.stop}`, "class")}</td>
                <td>{cell(s.hex, "hex")}</td>
                <td>{cell(formatOklch(s.oklch), "oklch")}</td>
                <td>{cell(formatHsl(s.hex), "hsl")}</td>
                <td>{cell(formatRgb(s.hex), "rgb")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
