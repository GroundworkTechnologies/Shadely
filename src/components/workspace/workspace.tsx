"use client";

import { Check, Link2, Redo2, Save, Undo2 } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Preview, type PreviewTabId } from "@/components/preview/preview";
import { Button } from "@/components/ui/button";
import { buildScales, colorName, encodeState, gamutMap, isValidName, oklchToHex, type PaletteState, type VisionMode } from "@/engine";
import { useCopy } from "@/hooks/use-copy";
import { useHistory } from "@/hooks/use-history";
import { useSavedPalettes } from "@/hooks/use-saved-palettes";
import { previewScales } from "@/lib/preview-theme";
import { ColorInput } from "./color-input";
import { OptionsPanel } from "./options-panel";
import { ScaleTiles } from "./scale-tiles";
import { VisionFilters } from "./vision";

// Contrast and export stay hidden until asked for, and load only then.
const ContrastPanel = dynamic(() => import("./contrast-panel").then((m) => m.ContrastPanel));
const ExportPanel = dynamic(() => import("./export-panel").then((m) => m.ExportPanel));
type PanelId = "contrast" | "export";

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
  const [panel, setPanel] = useState<PanelId | null>(null);
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
    setPanel("export");
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
    <div className="page-container lg:h-full lg:overflow-hidden">
      <VisionFilters />
      <div className="grid grid-cols-[minmax(0,1fr)] lg:h-full lg:grid-cols-12">
        <div className="grid min-h-0 grid-cols-[minmax(0,1fr)] content-start gap-5 border-border py-5 lg:col-span-4 lg:overflow-y-auto lg:border-r lg:pr-6 xl:col-span-3">
          <div>
            <h1 className="text-xl font-semibold">Tailwind CSS Color Generator</h1>
            <p className="mt-3 text-base text-muted">Turn any color into a perfect <Link href="/tailwind-colors" className="underline underline-offset-2 hover:text-foreground">Tailwind palette</Link>, then preview it on real components and designs.</p>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
            <ColorInput value={state.base} onChange={(base) => patch({ base })} onShuffle={shuffle} />
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Palette name</span>
              <input value={state.name} onChange={(e) => isValidName(e.target.value) && patch({ name: e.target.value })} spellCheck={false} className="h-12 rounded-xl border border-border bg-surface px-3" />
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

        <div className="grid min-h-0 min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-4 py-5 lg:col-span-8 lg:grid-rows-[auto_minmax(0,1fr)] lg:overflow-y-auto lg:pl-6 xl:col-span-9">
          <ScaleTiles scales={scales} selected={current.name} onSelect={setSelected} onCopy={copy} vision={vision} onOpen={setPanel} />
          <Preview scales={pscales} name={state.name} theme={state.theme} onTheme={(theme) => patch({ theme })} onExportShadcn={exportShadcn} tab={tab} onTab={setTab} vision={vision} onVision={setVision} />
        </div>
      </div>

      <Modal open={panel === "contrast"} title="Contrast" onClose={() => setPanel(null)}>
        <ContrastPanel scale={current} />
      </Modal>
      <Modal open={panel === "export"} title="Export" onClose={() => setPanel(null)}>
        <ExportPanel scales={scales} fullScales={pscales} format={state.format} syntax={state.syntax} shareUrl={shareUrl} onFormat={(format) => patch({ format })} onSyntax={(syntax) => patch({ syntax })} onCopy={copy} onNotify={notify} />
      </Modal>

      <div role="status" aria-live="polite" className={message ? "fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-control bg-foreground px-4 py-2 text-sm text-background shadow-float" : "sr-only-live"}>
        {message}
      </div>
    </div>
  );
}
