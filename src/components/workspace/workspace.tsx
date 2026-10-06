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
import { ScaleStrip } from "./scale-strip";
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

  const brand = scales[0]!;
  const anchor = brand.steps.find((s) => s.isAnchor)!;
  const limited = brand.steps.some((s) => s.clipped);
  const [justSaved, setJustSaved] = useState(false);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <div className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Tailwind color palette generator</h1>
        <p className="mt-2 text-muted">
          One brand color in, an accessible 50–950 scale out. Built in OKLCH, checked for contrast, previewed on real UI, exported for Tailwind v4 and v3.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
        <div className="grid content-start gap-4">
          <div className="grid gap-4 rounded-lg border border-border bg-surface p-4">
            <ColorInput value={state.base} onChange={(base) => patch({ base })} onShuffle={shuffle} />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <label className="grid gap-1">
                <span className="font-medium">Palette name</span>
                <input
                  value={state.name}
                  onChange={(e) => isValidName(e.target.value) && patch({ name: e.target.value })}
                  aria-describedby="name-hint"
                  spellCheck={false}
                  className="h-9 rounded-md border border-border bg-surface px-2 font-mono"
                />
              </label>
              <label className="grid gap-1">
                <span className="font-medium">Neutral scale</span>
                <select value={state.neutral} onChange={(e) => patch({ neutral: e.target.value as PaletteState["neutral"] })} className="h-9 rounded-md border border-border bg-surface px-2">
                  <option value="tinted">Tinted</option>
                  <option value="gray">Pure gray</option>
                  <option value="off">Off</option>
                </select>
              </label>
              <p id="name-hint" className="col-span-2 -mt-1 text-xs text-muted">
                Lowercase letters, digits and dashes.
              </p>
              <label className="col-span-2 flex items-center gap-2">
                <input type="checkbox" checked={state.status} onChange={(e) => patch({ status: e.target.checked })} className="size-4 accent-[var(--color-accent-600)]" />
                Include status scales (success, warning, danger, info)
              </label>
            </div>
          </div>

          <div className="grid gap-4 rounded-lg border border-border bg-surface p-4">
            <p className="text-sm text-muted">
              Your color lands on stop <strong className="text-foreground">{anchor.stop}</strong>, not always 500, so the scale keeps its natural light and dark balance.
              {limited && " Some shades were limited to fit the sRGB gamut."}
            </p>
            {scales.map((s) => (
              <ScaleStrip key={s.name} scale={s} onCopy={copy} />
            ))}
          </div>

          <TuningPanel tuning={state.tuning} onChange={(tuning) => patch({ tuning })} />

          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              onClick={() => copy(window.location.href, "Link copied")}
            >
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

        <Preview scales={pscales} theme={state.theme} onTheme={(theme) => patch({ theme })} />
      </div>

      <div className="mt-8 grid gap-6">
        <ContrastPanel scales={scales} />
        <ExportPanel
          scales={scales}
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
