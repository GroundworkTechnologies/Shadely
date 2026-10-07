"use client";

import { Check, Link2, Redo2, Save, Undo2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Preview, type PreviewTabId } from "@/components/preview/preview";
import { Button } from "@/components/ui/button";
import { buildScales, colorName, encodeState, gamutMap, isValidName, oklchToHex, type PaletteState, type VisionMode } from "@/engine";
import { useCopy } from "@/hooks/use-copy";
import { useHistory } from "@/hooks/use-history";
import { useSavedPalettes } from "@/hooks/use-saved-palettes";
import { previewScales } from "@/lib/preview-theme";
import { ColorInput } from "./color-input";
import { LazySection } from "./lazy-section";
import { OptionsPanel } from "./options-panel";
import { ScaleTiles } from "./scale-tiles";
import { VisionFilters } from "./vision";

// Below-the-fold panels load when they near the viewport.
const ContrastPanel = dynamic(() => import("./contrast-panel").then((m) => m.ContrastPanel));
const ExportPanel = dynamic(() => import("./export-panel").then((m) => m.ExportPanel));

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A", "SUMMARY"].includes(t.tagName));
const inField = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));

function randomHex(): string {
  const o = { l: 0.5 + Math.random() * 0.25, c: 0.08 + Math.random() * 0.14, h: Math.random() * 360 };
  return oklchToHex(gamutMap(o).oklch);
}

export function Workspace({ initial }: { initial: PaletteState }) {
  const { state, set, undo, redo, canUndo, canRedo } = useHistory(initial);
  const [shareUrl, setShareUrl] = useState("");
  const [tab, setTab] = useState<PreviewTabId>("cards");
  const [vision, setVision] = useState<VisionMode>("normal");
  const [selected, setSelected] = useState(initial.name);
  const [justSaved, setJustSaved] = useState(false);
  const { copy, notify, message } = useCopy();
  const saved = useSavedPalettes();

  const patch = useCallback((p: Partial<PaletteState>) => set((s) => ({ ...s, ...p })), [set]);
  const scales = useMemo(() => buildScales(state), [state]);
  const pscales = useMemo(() => previewScales(state), [state]);
  const current = scales.find((x) => x.name === selected) ?? scales[0]!;

  // Keep the URL in sync so every state is a shareable link.
  useEffect(() => {
    const id = setTimeout(() => {
      window.history.replaceState(null, "", `?${encodeState(state)}`);
      setShareUrl(window.location.href);
    }, 200);
    return () => clearTimeout(id);
  }, [state]);

  const shuffle = useCallback(() => patch({ base: randomHex() }), [patch]);

  const savePalette = () => {
    saved.add({ name: `${colorName(state.base).family} ${state.base}`, query: encodeState(state), base: state.base });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  };

  const exportShadcn = useCallback(() => {
    patch({ format: "shadcn" });
    requestAnimationFrame(() => document.getElementById("export")?.scrollIntoView({ block: "start" }));
  }, [patch]);

  // Space = random color, Ctrl/Cmd+Z = undo, Shift+Ctrl/Cmd+Z or Ctrl+Y = redo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      if (mod && !inField(e.target) && (key === "z" || key === "y")) {
        e.preventDefault();
        if (key === "y" || e.shiftKey) redo();
        else undo();
      } else if (!mod && !e.altKey && e.code === "Space" && !isTyping(e.target)) {
        e.preventDefault();
        shuffle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shuffle, undo, redo]);

  return (
    <div className="page-container py-8">
      <VisionFilters />
      <div className="mb-6 max-w-2xl">
        <h1 className="text-3xl font-normal sm:text-4xl">Tailwind color palette generator</h1>
        <p className="mt-2 text-muted">Turn one brand color into a full Tailwind color palette, from 50 to 950, with contrast checked and ready to export. Built for developers and designers using Tailwind. Free, no sign-up.</p>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="grid grid-cols-[minmax(0,1fr)] content-start gap-4">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 rounded-card border border-border bg-surface p-5">
            <ColorInput value={state.base} onChange={(base) => patch({ base })} onShuffle={shuffle} />
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Palette name</span>
              <input
                value={state.name}
                onChange={(e) => isValidName(e.target.value) && patch({ name: e.target.value })}
                spellCheck={false}
                className="h-9 rounded-control border border-control bg-surface px-2"
              />
            </label>
          </div>

          <OptionsPanel state={state} patch={patch} />

          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => copy(window.location.href, "Link copied")}>
              <Link2 className="size-4" aria-hidden /> Copy share link
            </Button>
            <Button onClick={savePalette}>
              {justSaved ? <Check className="size-4" aria-hidden /> : <Save className="size-4" aria-hidden />} {justSaved ? "Saved" : "Save palette"}
            </Button>
            <div className="ml-auto flex gap-1">
              <Button variant="ghost" className="size-9 px-0" onClick={undo} disabled={!canUndo} aria-label="Undo" title="Undo (Ctrl/Cmd+Z)">
                <Undo2 className="size-4" aria-hidden />
              </Button>
              <Button variant="ghost" className="size-9 px-0" onClick={redo} disabled={!canRedo} aria-label="Redo" title="Redo (Shift+Ctrl/Cmd+Z)">
                <Redo2 className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-6">
          <ScaleTiles scales={scales} selected={current.name} onSelect={setSelected} onCopy={copy} vision={vision} />
          <Preview scales={pscales} name={state.name} theme={state.theme} onTheme={(theme) => patch({ theme })} onExportShadcn={exportShadcn} tab={tab} onTab={setTab} vision={vision} onVision={setVision} />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-6">
        <LazySection id="contrast" minHeight={520}>
          <ContrastPanel scale={current} />
        </LazySection>
        <LazySection id="export" minHeight={420}>
          <ExportPanel scales={scales} fullScales={pscales} format={state.format} syntax={state.syntax} shareUrl={shareUrl} onFormat={(format) => patch({ format })} onSyntax={(syntax) => patch({ syntax })} onCopy={copy} onNotify={notify} />
        </LazySection>
      </div>

      <div role="status" aria-live="polite" className={message ? "fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-control bg-foreground px-4 py-2 text-sm text-background shadow-float" : "sr-only-live"}>
        {message}
      </div>
    </div>
  );
}
