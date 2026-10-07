"use client";

import { Copy, Download, FolderArchive } from "lucide-react";
import { useMemo } from "react";
import { exportScales, exportZip, FORMAT_FILES, FORMAT_LABELS, type ColorSyntax, type ExportFormat, type NamedScale } from "@/engine";
import { Button } from "@/components/ui/button";

const GROUPS: { label: string; formats: ExportFormat[] }[] = [
  { label: "Web", formats: ["tailwind-v4", "tailwind-v3", "css", "css-modern", "scss"] },
  { label: "Design tokens", formats: ["shadcn", "json", "dtcg", "tokens-studio", "style-dictionary"] },
  { label: "Mobile", formats: ["flutter", "android", "compose", "ios"] },
];

/** Formats with a fixed color encoding: the color syntax choice does not apply. */
const FIXED_SYNTAX = new Set<ExportFormat>(["dtcg", "style-dictionary", "css-modern", "flutter", "android", "compose", "ios"]);
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
  onNotify,
}: {
  scales: NamedScale[];
  /** Always includes neutral and status scales; used for semantic tokens. */
  fullScales: NamedScale[];
  format: ExportFormat;
  syntax: ColorSyntax;
  shareUrl: string;
  onFormat: (f: ExportFormat) => void;
  onSyntax: (s: ColorSyntax) => void;
  onCopy: (text: string, label: string) => void;
  onNotify: (message: string) => void;
}) {
  const code = useMemo(
    () => exportScales(scales, { format, syntax, sourceUrl: shareUrl || undefined, full: fullScales }),
    [scales, fullScales, format, syntax, shareUrl],
  );

  const save = (data: BlobPart, type: string, filename: string) => {
    const url = URL.createObjectURL(new Blob([data], { type }));
    Object.assign(document.createElement("a"), { href: url, download: filename }).click();
    URL.revokeObjectURL(url);
  };

  return (
    <section aria-labelledby="export-h" className="rounded-card border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <h2 id="export-h" className="text-base font-medium">
          Export
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label className="sr-only" htmlFor="export-format">
            Format
          </label>
          <select id="export-format" value={format} onChange={(e) => onFormat(e.target.value as ExportFormat)} className="h-9 rounded-control border border-control bg-surface px-2">
            {GROUPS.map((g) => (
              <optgroup key={g.label} label={g.label}>
                {g.formats.map((f) => (
                  <option key={f} value={f}>
                    {FORMAT_LABELS[f]}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {!FIXED_SYNTAX.has(format) && (
            <>
              <label className="sr-only" htmlFor="export-syntax">
                Color syntax
              </label>
              <select id="export-syntax" value={syntax} onChange={(e) => onSyntax(e.target.value as ColorSyntax)} className="h-9 rounded-control border border-control bg-surface px-2">
                {(Object.keys(SYNTAX_LABELS) as ColorSyntax[]).map((k) => (
                  <option key={k} value={k}>
                    {SYNTAX_LABELS[k]}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => onCopy(code, "Copied")}>
            <Copy className="size-4" aria-hidden /> Copy code
          </Button>
          <Button onClick={() => save(code, "text/plain", FORMAT_FILES[format])} aria-label={`Download ${FORMAT_FILES[format]}`}>
            <Download className="size-4" aria-hidden /> Download
          </Button>
          <Button
            onClick={() => {
              save(exportZip(scales, { syntax, sourceUrl: shareUrl || undefined, full: fullScales }) as BlobPart, "application/zip", `shadely-${scales[0]?.name ?? "palette"}.zip`);
              onNotify("ZIP downloaded");
            }}
          >
            <FolderArchive className="size-4" aria-hidden /> Download all formats (ZIP)
          </Button>
        </div>
        <pre tabIndex={0} aria-label="Export code" className="max-h-96 overflow-auto rounded-control bg-surface-muted p-4 text-sm leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </section>
  );
}
