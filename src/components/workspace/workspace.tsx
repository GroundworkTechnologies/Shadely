"use client";

import { Check, Command as CommandIcon, Link2, Redo2, Save, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PREVIEW_TABS, Preview, type PreviewTabId } from "@/components/preview/preview";
import { Button } from "@/components/ui/button";
import {
  buildScales,
  NEUTRAL_FAMILIES,
  encodeState,
  FORMAT_LABELS,
  type ExportFormat,
  gamutMap,
  colorName,
  isValidName,
  type PaletteState,
} from "@/engine";
import { useCopy } from "@/hooks/use-copy";
import { useHistory } from "@/hooks/use-history";
import { useSavedPalettes } from "@/hooks/use-saved-palettes";
import { previewScales } from "@/lib/preview-theme";
import { ColorInput } from "./color-input";
import { CommandPalette, type Command } from "./command-palette";
import { ContrastPanel } from "./contrast-panel";
import { ExportPanel } from "./export-panel";
import { ColorInfoPanel } from "./color-info-panel";
import { ScaleTiles } from "./scale-tiles";
import { ShadeEditor } from "./shade-editor";
import { TuningPanel } from "./tuning-panel";
import { oklchToHex } from "@/engine";

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A", "SUMMARY"].includes(t.tagName));

function randomHex(): string {
  const o = { l: 0.5 + Math.random() * 0.25, c: 0.08 + Math.random() * 0.14, h: Math.random() * 360 };
  return oklchToHex(gamutMap(o).oklch);
}

export function Workspace({ initial }: { initial: PaletteState }) {
  const { state, set, undo, redo, canUndo, canRedo } = useHistory(initial);
  const [shareUrl, setShareUrl] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [tab, setTab] = useState<PreviewTabId>("cards");
  const { copy, notify, message } = useCopy();
  const saved = useSavedPalettes();
  const router = useRouter();

  const patch = useCallback((p: Partial<PaletteState>) => set((s) => ({ ...s, ...p })), [set]);
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
  const [selected, setSelected] = useState(initial.name);
  const current = scales.find((x) => x.name === selected) ?? scales[0]!;
  const limited = scales[0]!.steps.some((x) => x.clipped);
  const suggested = colorName(state.base).slug;
  const [justSaved, setJustSaved] = useState(false);

  const jump = useCallback((id: string) => requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" })), []);
  const exportShadcn = useCallback(() => {
    patch({ format: "shadcn" });
    jump("export");
  }, [patch, jump]);
  const savePalette = useCallback(() => {
    saved.add({ name: `${colorName(state.base).family} ${state.base}`, query: encodeState(state), base: state.base });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  }, [saved, state]);

  // Keyboard shortcuts. Plain keys are ignored while typing in a field or focused on a control.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const typing = isTyping(e.target);
      const inField = e.target instanceof HTMLElement && (e.target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName));
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      if (mod && !inField && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && !inField && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if (mod || e.altKey || typing || paletteOpen) return;
      if (e.code === "Space") {
        e.preventDefault();
        shuffle();
      } else if (e.key === "d" || e.key === "D") {
        patch({ theme: state.theme === "dark" ? "light" : "dark" });
      } else if (e.key === "e" || e.key === "E") {
        jump("export");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shuffle, undo, redo, patch, jump, state.theme, paletteOpen]);

  const commands = useMemo<Command[]>(() => {
    const list: Command[] = [
      { id: "random", group: "Color", label: "Random base color", hint: "Space", run: shuffle },
      { id: "undo", group: "Edit", label: "Undo", hint: "⌘Z", run: undo },
      { id: "redo", group: "Edit", label: "Redo", hint: "⇧⌘Z", run: redo },
      { id: "share", group: "Share", label: "Copy share link", run: () => copy(window.location.href, "Link copied") },
      { id: "save", group: "Share", label: "Save palette to this browser", run: savePalette },
      { id: "theme", group: "Preview", label: `Switch preview to ${state.theme === "dark" ? "light" : "dark"}`, hint: "D", run: () => patch({ theme: state.theme === "dark" ? "light" : "dark" }) },
      { id: "goto-export", group: "Go to", label: "Export", hint: "E", run: () => jump("export") },
      { id: "goto-contrast", group: "Go to", label: "Contrast matrix", run: () => jump("contrast") },
      { id: "goto-info", group: "Go to", label: "Color info", run: () => jump("color-info") },
      { id: "page-saved", group: "Page", label: "Saved palettes", run: () => router.push("/palettes") },
      { id: "page-tw", group: "Page", label: "Tailwind default colors", run: () => router.push("/tailwind-colors") },
      { id: "page-about", group: "Page", label: "About", run: () => router.push("/about") },
    ];
    for (const t of PREVIEW_TABS) list.push({ id: `tab-${t.id}`, group: "Preview", label: `${t.label} page`, run: () => setTab(t.id) });
    for (const f of Object.keys(FORMAT_LABELS) as ExportFormat[]) {
      list.push({ id: `fmt-${f}`, group: "Export as", label: FORMAT_LABELS[f], run: () => { patch({ format: f }); jump("export"); } });
    }
    for (const h of ["off", "analogous", "complementary", "split", "triadic", "tetradic", "square"] as const) {
      list.push({ id: `hm-${h}`, group: "Harmony", label: h === "off" ? "No harmony scales" : h.charAt(0).toUpperCase() + h.slice(1), run: () => patch({ harmony: h }) });
    }
    return list;
  }, [shuffle, undo, redo, copy, savePalette, state.theme, patch, jump, router]);

  return (
    <div className="page-container py-8">
      <div className="mb-6 max-w-3xl">
        <h1 className="text-3xl font-normal sm:text-4xl">Tailwind color palette generator</h1>
        <p className="mt-2 text-muted">
          One brand color in, an accessible 50–950 scale out. Built in OKLCH, checked for contrast, previewed on real UI, exported for Tailwind v4, v3 and shadcn/ui.
        </p>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="grid grid-cols-[minmax(0,1fr)] content-start gap-4">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 rounded-card border border-border bg-surface p-5">
            <ColorInput value={state.base} onChange={(base) => patch({ base })} onShuffle={shuffle} />
            <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 text-sm">
              <label className="grid min-w-0 gap-1">
                <span className="font-medium">Palette name</span>
                <input
                  value={state.name}
                  onChange={(e) => isValidName(e.target.value) && patch({ name: e.target.value })}
                  aria-describedby="name-hint"
                  spellCheck={false}
                  className="h-9 w-full min-w-0 rounded-control border border-control bg-surface px-2 tabular-nums"
                />
              </label>
              <label className="grid min-w-0 gap-1">
                <span className="font-medium">Neutral scale</span>
                <select value={state.neutral} onChange={(e) => patch({ neutral: e.target.value as PaletteState["neutral"] })} className="h-9 w-full min-w-0 rounded-control border border-control bg-surface px-2">
                  <option value="tinted">Tinted (brand hue)</option>
                  <option value="pure">Pure gray</option>
                  <optgroup label="Tailwind families">
                    {NEUTRAL_FAMILIES.map((f) => (
                      <option key={f} value={f}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </option>
                    ))}
                  </optgroup>
                  <option value="off">Off</option>
                </select>
              </label>
              <p id="name-hint" className="col-span-2 -mt-1 text-xs text-muted">
                Lowercase letters, digits and dashes.
                {suggested !== state.name && (
                  <>
                    {" "}
                    Suggested: <strong className="font-medium text-foreground">{suggested}</strong>{" "}
                    <button type="button" onClick={() => patch({ name: suggested })} className="rounded-control px-1 font-medium text-foreground underline underline-offset-2">
                      Use
                    </button>
                  </>
                )}
              </p>
              <label className="col-span-2 grid min-w-0 gap-1">
                <span className="font-medium">Harmony scales</span>
                <select value={state.harmony} onChange={(e) => patch({ harmony: e.target.value as PaletteState["harmony"] })} className="h-9 w-full min-w-0 rounded-control border border-control bg-surface px-2">
                  <option value="off">None</option>
                  <option value="analogous">Analogous (+30°)</option>
                  <option value="complementary">Complementary (+180°)</option>
                  <option value="split">Split complementary</option>
                  <option value="triadic">Triadic</option>
                  <option value="tetradic">Tetradic</option>
                  <option value="square">Square</option>
                </select>
              </label>
              {state.neutral !== "off" && state.neutral !== "pure" && (
                <label className="col-span-2 grid gap-1">
                  <span className="flex justify-between font-medium">
                    Neutral tint <output className="font-normal tabular-nums text-muted">{state.neutralTint}%</output>
                  </span>
                  <input type="range" min={0} max={200} step={10} value={state.neutralTint} onChange={(e) => patch({ neutralTint: Number(e.target.value) })} className="h-6 w-full" />
                </label>
              )}
              <label className="col-span-2 flex items-center gap-2">
                <input type="checkbox" checked={state.status} onChange={(e) => patch({ status: e.target.checked })} className="size-4" />
                Include status scales (success, warning, danger, info)
              </label>
            </div>
            {limited && <p className="text-xs text-muted">Some shades were limited to fit the sRGB gamut (marked ~).</p>}
          </div>

          <TuningPanel tuning={state.tuning} onChange={(tuning) => patch({ tuning })} anchor={state.anchor} onAnchor={(anchor) => patch({ anchor })} />

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
              <Button variant="ghost" className="size-9 px-0" onClick={() => setPaletteOpen(true)} aria-label="Open command palette" title="Command palette (Ctrl/Cmd+K)">
                <CommandIcon className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-6">
          <ScaleTiles scales={scales} selected={current.name} onSelect={setSelected} onCopy={copy} />
          {current.kind === "brand" && <ShadeEditor scale={current} state={state} patch={patch} />}
          <Preview scales={pscales} name={state.name} theme={state.theme} onTheme={(theme) => patch({ theme })} onExportShadcn={exportShadcn} tab={tab} onTab={setTab} />
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
          onNotify={notify}
        />
      </div>

      <CommandPalette commands={commands} open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      <div role="status" aria-live="polite" className={message ? "fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-control bg-foreground px-4 py-2 text-sm text-background shadow-float" : "sr-only-live"}>
        {message}
      </div>
    </div>
  );
}
