"use client";

import { useId } from "react";
import { DEFAULT_TUNING, STOPS, type PaletteState, type Tuning } from "@/engine";
import { Button } from "@/components/ui/button";

function Slider({ label, value, min, max, step = 1, unit, onChange }: { label: string; value: number; min: number; max: number; step?: number; unit: string; onChange: (n: number) => void }) {
  const id = useId();
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} className="tabular-nums text-xs text-muted">
          {value}
          {unit}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={`${value}${unit}`}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-6 w-full"
      />
    </div>
  );
}

export function TuningPanel({ tuning, onChange, anchor, onAnchor }: { tuning: Tuning; onChange: (t: Tuning) => void; anchor: PaletteState["anchor"]; onAnchor: (a: PaletteState["anchor"]) => void }) {
  const set = (patch: Partial<Tuning>) => onChange({ ...tuning, ...patch });
  const dirty = JSON.stringify(tuning) !== JSON.stringify(DEFAULT_TUNING) || anchor !== "auto";
  return (
    <details className="group rounded-control border border-border bg-surface" open>
      <summary className="flex list-none items-center justify-between px-5 py-4 text-sm font-medium">
        Fine-tune
        <span className="text-xs font-normal text-muted">{dirty ? "customised" : "defaults"}</span>
      </summary>
      <div className="grid gap-4 border-t border-border p-5">
        <label className="grid gap-1 text-sm">
          <span>Base color lands on</span>
          <select value={String(anchor)} onChange={(e) => onAnchor(e.target.value === "auto" ? "auto" : (Number(e.target.value) as PaletteState["anchor"]))} className="h-9 rounded-control border border-control bg-surface px-2">
            <option value="auto">Auto (nearest stop)</option>
            {STOPS.map((s) => (
              <option key={s} value={s}>
                Stop {s}
              </option>
            ))}
          </select>
        </label>
        <Slider label="Chroma" value={tuning.chroma} min={0} max={200} step={5} unit="%" onChange={(chroma) => set({ chroma })} />
        <Slider label="Hue shift (darker stops)" value={tuning.hue} min={-60} max={60} unit="°" onChange={(hue) => set({ hue })} />
        <Slider label="Lightest stop (50)" value={tuning.top} min={900} max={1000} step={5} unit="‰" onChange={(top) => set({ top })} />
        <Slider label="Darkest stop (950)" value={tuning.bottom} min={0} max={450} step={5} unit="‰" onChange={(bottom) => set({ bottom })} />
        <Button variant="ghost" disabled={!dirty} onClick={() => {
            onChange(DEFAULT_TUNING);
            onAnchor("auto");
          }} className="justify-self-start">
          Reset
        </Button>
      </div>
    </details>
  );
}
