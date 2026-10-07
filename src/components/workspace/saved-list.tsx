"use client";

import { Download, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { Button, buttonClass } from "@/components/ui/button";
import { useSavedPalettes, type SavedPalette } from "@/hooks/use-saved-palettes";
import { buildScales, decodeState } from "@/engine";

function Swatches({ query }: { query: string }) {
  const brand = buildScales(decodeState(query))[0]!;
  return (
    <div className="flex overflow-hidden rounded-control border border-border" aria-hidden>
      {brand.steps.map((s) => (
        <span key={s.stop} className="h-8 w-5" style={{ backgroundColor: s.hex }} />
      ))}
    </div>
  );
}

export function SavedList() {
  const { items, ready, remove, rename, replaceAll } = useSavedPalettes();
  const file = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const exportJson = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(items, null, 2)], { type: "application/json" }));
    Object.assign(document.createElement("a"), { href: url, download: "shadely-palettes.json" }).click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (f: File) => {
    try {
      const data: unknown = JSON.parse(await f.text());
      if (!Array.isArray(data)) throw new Error("Expected a list");
      const ok = data.filter((p): p is SavedPalette => p && typeof p.id === "string" && typeof p.name === "string" && typeof p.query === "string" && typeof p.base === "string");
      const ids = new Set(items.map((i) => i.id));
      replaceAll([...items, ...ok.filter((p) => !ids.has(p.id))]);
      setError("");
    } catch {
      setError("That file is not a Shadely palette backup.");
    }
  };

  if (!ready) return <p className="mt-8 text-muted">Loading…</p>;

  return (
    <div className="mt-8">
      <div className="mb-4 flex flex-wrap gap-2">
        <Button onClick={exportJson} disabled={!items.length}>
          <Download className="size-4" aria-hidden /> Export backup
        </Button>
        <Button onClick={() => file.current?.click()}>
          <Upload className="size-4" aria-hidden /> Import backup
        </Button>
        <input ref={file} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
        <Link href="/" className={buttonClass("primary")}>
          New palette
        </Link>
      </div>
      {error && <p role="alert" className="mb-3 text-sm text-danger">{error}</p>}
      {!items.length ? (
        <p className="rounded-control border border-dashed border-border p-8 text-center text-muted">No saved palettes yet. Use “Save palette” in the generator.</p>
      ) : (
        <ul className="grid gap-3">
          {items.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-control border border-border bg-surface p-3">
              <Swatches query={p.query} />
              <input
                aria-label="Palette name"
                defaultValue={p.name}
                onBlur={(e) => e.target.value.trim() && rename(p.id, e.target.value.trim())}
                className="h-9 min-w-0 flex-1 rounded-control border border-control bg-transparent px-2"
              />
              {/* Plain link: a full load re-reads the palette from the URL. */}
              <a href={`/?${p.query}`} className={buttonClass("secondary")}>
                Open
              </a>
              <Button variant="ghost" aria-label={`Delete ${p.name}`} onClick={() => remove(p.id)}>
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
