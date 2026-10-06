"use client";

import { useId } from "react";
import { AA_RULES, DEFAULT_TUNING, NEUTRAL_FAMILIES, type PaletteState } from "@/engine";
import { Button } from "@/components/ui/button";

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <label className="grid min-w-0 gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-full min-w-0 rounded-control border border-control bg-surface px-2">
        {children}
      </select>
    </label>
  );
}

function Slider({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (n: number) => void }) {
  const id = useId();
  return (
    <div className="grid gap-1 text-sm">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="font-medium">
          {label}
        </label>
        <output htmlFor={id} className="tabular-nums text-muted">
          {value}
          {unit}
        </output>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} aria-valuetext={`${value}${unit}`} onChange={(e) => onChange(Number(e.target.value))} className="h-6 w-full" />
    </div>
  );
}

/** Everything beyond the base color lives here, collapsed by default. */
export function OptionsPanel({ state, patch }: { state: PaletteState; patch: (p: Partial<PaletteState>) => void }) {
  const t = state.tuning;
  const dirty = JSON.stringify(t) !== JSON.stringify(DEFAULT_TUNING);
  return (
    <details className="rounded-card border border-border bg-surface">
      <summary className="flex list-none items-center justify-between px-5 py-4 text-sm font-medium">
        Options
        <span className="text-xs font-normal text-muted">scales, contrast, tuning</span>
      </summary>
      <div className="grid gap-4 border-t border-border p-5">
        <Select label="Neutral scale" value={state.neutral} onChange={(v) => patch({ neutral: v as PaletteState["neutral"] })}>
          <option value="tinted">Tinted (brand hue)</option>
          <option value="pure">Pure gray</option>
          <optgroup label="Tailwind families">
            {NEUTRAL_FAMILIES.map((f) => (
              <option key={f} value={f}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </option>
            ))}
          </optgroup>
          <option value="off">None</option>
        </Select>
        <Select label="Extra scales from the brand hue" value={state.harmony} onChange={(v) => patch({ harmony: v as PaletteState["harmony"] })}>
          <option value="off">None</option>
          <option value="analogous">Analogous</option>
          <option value="complementary">Complementary</option>
          <option value="split">Split complementary</option>
          <option value="triadic">Triadic</option>
          <option value="tetradic">Tetradic</option>
          <option value="square">Square</option>
        </Select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={state.status} onChange={(e) => patch({ status: e.target.checked })} className="size-4" />
          Status scales (success, warning, danger, info)
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={state.targets.length > 0} onChange={(e) => patch({ targets: e.target.checked ? AA_RULES : [] })} className="mt-0.5 size-4" />
          <span>
            Make shades pass AA contrast
            <span className="block text-xs text-muted">White on 600 and 900 on 100 reach 4.5:1. The base color never changes.</span>
          </span>
        </label>
        <Slider label="Chroma" value={t.chroma} min={0} max={200} step={5} unit="%" onChange={(chroma) => patch({ tuning: { ...t, chroma } })} />
        <Slider label="Lightest shade (50)" value={t.top} min={900} max={1000} step={5} unit="‰" onChange={(top) => patch({ tuning: { ...t, top } })} />
        <Slider label="Darkest shade (950)" value={t.bottom} min={0} max={450} step={5} unit="‰" onChange={(bottom) => patch({ tuning: { ...t, bottom } })} />
        <Button variant="ghost" disabled={!dirty} onClick={() => patch({ tuning: DEFAULT_TUNING })} className="justify-self-start">
          Reset tuning
        </Button>
      </div>
    </details>
  );
}
