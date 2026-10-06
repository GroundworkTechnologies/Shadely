"use client";

import { Copy, Download } from "lucide-react";
import { useMemo } from "react";
import {
  exportScales,
  FORMAT_FILES,
  FORMAT_LABELS,
  type ColorSyntax,
  type ExportFormat,
  type NamedScale,
  type V3Module,
} from "@/engine";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useState } from "react";

const SHADCN_NOTE = "Uses OKLCH or hex. Paste into your globals.css; it includes :root, .dark and the @theme inline mapping.";
const SYNTAX_LABELS: Record<ColorSyntax, string> = { oklch: "OKLCH", hex: "Hex", hsl: "HSL", rgb: "RGB", p3: "Display-P3" };

export function ExportPanel({
  scales,
  fullScales,
  format,
  syntax,
  shareUrl,
  onFormat,
  onSyntax,
  onCopy,
}: {
  scales: NamedScale[];
  /** Always includes neutral and status scales; used by the shadcn theme. */
  fullScales: NamedScale[];
  format: ExportFormat;
  syntax: ColorSyntax;
  shareUrl: string;
  onFormat: (f: ExportFormat) => void;
  onSyntax: (s: ColorSyntax) => void;
  onCopy: (text: string, label: string) => void;
}) {
  const [v3Module, setV3Module] = useState<V3Module>("esm");
  const [reset, setReset] = useState(false);

  const code = useMemo(
    () => exportScales(format === "shadcn" ? fullScales : scales, { format, syntax, v3Module, resetDefaults: reset, sourceUrl: shareUrl || undefined }),
    [scales, fullScales, format, syntax, v3Module, reset, shareUrl],
  );

  const download = () => {
    const url = URL.createObjectURL(new Blob([code], { type: "text/plain" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: FORMAT_FILES[format] });
    a.click();
    URL.revokeObjectURL(url);
  };

  const warn =
    format === "shadcn"
      ? SHADCN_NOTE
      : format === "tailwind-v3" && (syntax === "oklch" || syntax === "p3")
      ? "Tailwind v3 does not handle OKLCH/P3 colors reliably with opacity modifiers. Hex is safest."
      : null;

  return (
    <section aria-labelledby="export-h" id="export" className="scroll-mt-4 rounded-card border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <h2 id="export-h" className="text-base font-medium">
          Export
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label className="flex items-center gap-2">
            <span className="text-muted">Color</span>
            <select value={syntax} onChange={(e) => onSyntax(e.target.value as ColorSyntax)} className="h-9 rounded-control border border-control bg-surface px-2">
              {(Object.keys(SYNTAX_LABELS) as ColorSyntax[]).map((k) => (
                <option key={k} value={k}>
                  {SYNTAX_LABELS[k]}
                </option>
              ))}
            </select>
          </label>
          {format === "tailwind-v3" && (
            <label className="flex items-center gap-2">
              <span className="text-muted">File</span>
              <select value={v3Module} onChange={(e) => setV3Module(e.target.value as V3Module)} className="h-9 rounded-control border border-control bg-surface px-2">
                <option value="esm">ESM</option>
                <option value="cjs">CommonJS</option>
                <option value="ts">TypeScript</option>
              </select>
            </label>
          )}
          {format === "tailwind-v4" && (
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={reset} onChange={(e) => setReset(e.target.checked)} className="size-4" />
              <span>Remove default colors</span>
            </label>
          )}
        </div>
      </div>

      <div role="tablist" aria-label="Export format" className="flex gap-1 overflow-x-auto border-b border-border px-3 pt-2">
        {(Object.keys(FORMAT_LABELS) as ExportFormat[]).map((f) => (
          <button
            key={f}
            role="tab"
            type="button"
            aria-selected={f === format}
            onClick={() => onFormat(f)}
            className={cn(
              "-mb-px shrink-0 rounded-t-md border border-b-0 px-3 py-2 text-sm",
              f === format ? "border-border bg-surface-muted font-medium" : "border-transparent text-muted hover:text-foreground",
            )}
          >
            {FORMAT_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="relative bg-surface-muted p-5" role="tabpanel">
        {warn && <p className="mb-3 rounded-control border border-border bg-surface px-3 py-2 text-sm">{warn}</p>}
        <div className="absolute right-4 top-4 flex gap-2">
          <Button onClick={() => onCopy(code, FORMAT_LABELS[format] + " copied")} variant="primary">
            <Copy className="size-4" aria-hidden /> Copy
          </Button>
          <Button onClick={download} aria-label={`Download ${FORMAT_FILES[format]}`}>
            <Download className="size-4" aria-hidden />
          </Button>
        </div>
        <pre tabIndex={0} aria-label="Export code" className="max-h-96 overflow-auto rounded-control pr-28 pt-12 tabular-nums text-xs leading-relaxed sm:pt-0">
          <code>{code}</code>
        </pre>
      </div>
    </section>
  );
}
