"use client";

import { Check, Link2, Save } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Preview } from "@/components/preview/preview";
import { Button } from "@/components/ui/button";
import {
  buildScales,
  encodeState,
  gamutMap,
  isValidName,
  type PaletteState,
} from "@/engine";
import { useCopy } from "@/hooks/use-copy";
import { useSavedPalettes } from "@/hooks/use-saved-palettes";
import { previewScales } from "@/lib/preview-theme";
import { ColorInput } from "./color-input";
import { ContrastPanel } from "./contrast-panel";
import { ExportPanel } from "./export-panel";
import { ColorInfoPanel } from "./color-info-panel";
import { ScaleTiles } from "./scale-tiles";
import { TuningPanel } from "./tuning-panel";
import { oklchToHex } from "@/engine";

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A", "SUMMARY"].includes(t.tagName));

function randomHex(): string {
  const o = { l: 0.5 + Math.random() * 0.25, c: 0.08 + Math.random() * 0.14, h: Math.random() * 360 };
  return oklchToHex(gamutMap(o).oklch);
}

export function Workspace({ initial }: { initial: PaletteState }) {
  const [state, setState] = useState(initial);
  const [shareUrl, setShareUrl] = useState("");
  const { copy, message } = useCopy();
  const saved = useSavedPalettes();

  const patch = useCallback((p: Partial<PaletteState>) => setState((s) => ({ ...s, ...p })), []);
  const scales = useMemo(() => buildScales(state), [state]);
  const pscales = useMemo(() => previewScales(state), [state]);

  // Keep the URL in sync so every state is a shareable link.
  useEffect(() => {
    const id = setTimeout(() => {
      window.history.replaceState(null, "", `?${encodeState(state)}`);
      setShareUrl(window.location.href);
    }, 200);
    return () => clearTimeout(id);
  }, [state]);

  const shuffle = useCallback(() => patch({ base: randomHex() }), [patch]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
      e.preventDefault();
      shuffle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shuffle]);

  const [selected, setSelected] = useState(initial.name);
  const current = scales.find((x) => x.name === selected) ?? scales[0]!;
  const limited = scales[0]!.steps.some((x) => x.clipped);
  const [justSaved, setJustSaved] = useState(false);

  const exportShadcn = useCallback(() => {
    patch({ format: "shadcn" });
    requestAnimationFrame(() => document.getElementById("export")?.scrollIntoView({ block: "start" }));
  }, [patch]);

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8">
      <div className="mb-6 max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Tailwind color palette generator</h1>
        <p className="mt-2 text-muted">
          One brand color in, an accessible 50–950 scale out. Built in OKLCH, checked for contrast, previewed on real UI, exported for Tailwind v4, v3 and shadcn/ui.
        </p>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="grid grid-cols-[minmax(0,1fr)] content-start gap-4">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 rounded-2xl border border-border bg-surface p-4">
            <ColorInput value={state.base} onChange={(base) => patch({ base })} onShuffle={shuffle} />
            <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 text-sm">
              <label className="grid min-w-0 gap-1">
                <span className="font-medium">Palette name</span>
                <input
                  value={state.name}
                  onChange={(e) => isValidName(e.target.value) && patch({ name: e.target.value })}
                  aria-describedby="name-hint"
                  spellCheck={false}
                  className="h-9 w-full min-w-0 rounded-md border border-border bg-surface px-2 font-mono"
                />
              </label>
              <label className="grid min-w-0 gap-1">
                <span className="font-medium">Neutral scale</span>
                <select value={state.neutral} onChange={(e) => patch({ neutral: e.target.value as PaletteState["neutral"] })} className="h-9 w-full min-w-0 rounded-md border border-border bg-surface px-2">
                  <option value="tinted">Tinted</option>
                  <option value="gray">Pure gray</option>
                  <option value="off">Off</option>
                </select>
              </label>
              <p id="name-hint" className="col-span-2 -mt-1 text-xs text-muted">
                Lowercase letters, digits and dashes.
              </p>
              <label className="col-span-2 flex items-center gap-2">
                <input type="checkbox" checked={state.status} onChange={(e) => patch({ status: e.target.checked })} className="size-4" />
                Include status scales (success, warning, danger, info)
              </label>
            </div>
            {limited && <p className="text-xs text-muted">Some shades were limited to fit the sRGB gamut (marked ~).</p>}
          </div>

          <TuningPanel tuning={state.tuning} onChange={(tuning) => patch({ tuning })} />

          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => copy(window.location.href, "Link copied")}>
              <Link2 className="size-4" aria-hidden /> Copy share link
            </Button>
            <Button
              onClick={() => {
                saved.add({ name: `${state.name} ${state.base}`, query: encodeState(state), base: state.base });
                setJustSaved(true);
                setTimeout(() => setJustSaved(false), 1800);
              }}
            >
              {justSaved ? <Check className="size-4" aria-hidden /> : <Save className="size-4" aria-hidden />} {justSaved ? "Saved" : "Save palette"}
            </Button>
          </div>
        </div>

        <div className="grid min-w-0 content-start gap-6">
          <ScaleTiles scales={scales} selected={current.name} onSelect={setSelected} onCopy={copy} />
          <Preview scales={pscales} name={state.name} theme={state.theme} onTheme={(theme) => patch({ theme })} onExportShadcn={exportShadcn} />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-6">
        <ContrastPanel scale={current} />
        <ColorInfoPanel scale={current} onCopy={copy} />
        <ExportPanel
          scales={scales}
          fullScales={pscales}
          format={state.format}
          syntax={state.syntax}
          shareUrl={shareUrl}
          onFormat={(format) => patch({ format })}
          onSyntax={(syntax) => patch({ syntax })}
          onCopy={copy}
        />
      </div>

      <div role="status" aria-live="polite" className={message ? "fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-md bg-foreground px-4 py-2 text-sm text-background shadow-lg" : "sr-only-live"}>
        {message}
      </div>
    </div>
  );
}
