"use client";

import { Lock, LockOpen, RotateCcw } from "lucide-react";
import { useState } from "react";
import { normalizeHex, STOPS, type NamedScale, type PaletteState, type Stop } from "@/engine";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

function HexField({ hex, label, disabled, onCommit }: { hex: string; label: string; disabled?: boolean; onCommit: (hex: string) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  return (
    <input
      aria-label={label}
      aria-invalid={invalid}
      spellCheck={false}
      disabled={disabled}
      value={draft ?? hex}
      onChange={(e) => {
        setDraft(e.target.value);
        const ok = normalizeHex(e.target.value);
        setInvalid(!ok && e.target.value.trim() !== "");
        if (ok && ok !== hex) onCommit(ok);
      }}
      onBlur={() => {
        setDraft(null);
        setInvalid(false);
      }}
      className="h-9 w-28 rounded-control border border-control bg-surface px-2 text-sm tabular-nums aria-invalid:border-danger disabled:opacity-60"
    />
  );
}

/** Lock, edit or reset individual shades of the brand scale. The rest of the scale re-flows around them. */
export function ShadeEditor({ scale, state, patch }: { scale: NamedScale; state: PaletteState; patch: (p: Partial<PaletteState>) => void }) {
  const overrides = state.overrides;
  const count = Object.keys(overrides).length;

  const setOverride = (stop: Stop, hex: string | null) => {
    const next = { ...overrides };
    if (hex) next[stop] = hex;
    else delete next[stop];
    patch({ overrides: next });
  };

  return (
    <details className="rounded-card border border-border bg-surface">
      <summary className="flex list-none items-center justify-between px-5 py-4 text-sm font-medium">
        Edit shades
        <span className="text-xs font-normal text-muted">{count ? `${count} pinned` : "lock or type any shade"}</span>
      </summary>
      <div className="border-t border-border p-5">
        <p className="mb-4 text-sm text-muted">
          Pin a shade to keep it exactly as is. The other shades re-flow around pinned ones. Editing the base shade changes the base color.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {STOPS.map((stop) => {
            const step = scale.steps.find((s) => s.stop === stop)!;
            const pinned = Boolean(overrides[stop]);
            return (
              <li key={stop} className={cn("flex items-center gap-3 rounded-control border px-3 py-2", pinned ? "border-control" : "border-border")}>
                <span aria-hidden className="size-7 shrink-0 rounded-md border border-border" style={{ backgroundColor: step.hex }} />
                <span className="w-9 text-sm font-medium tabular-nums">{stop}</span>
                <HexField
                  hex={step.hex}
                  label={`${scale.name} ${stop} hex`}
                  onCommit={(hex) => (step.isAnchor ? patch({ base: hex }) : setOverride(stop, hex))}
                />
                {step.isAnchor ? (
                  <span className="ml-auto text-xs text-muted">base</span>
                ) : (
                  <Button
                    variant="ghost"
                    className="ml-auto size-9 px-0"
                    aria-pressed={pinned}
                    aria-label={pinned ? `Unpin ${scale.name} ${stop}` : `Pin ${scale.name} ${stop} at ${step.hex}`}
                    title={pinned ? "Unpin: let the scale generate this shade" : "Pin this shade"}
                    onClick={() => setOverride(stop, pinned ? null : step.hex)}
                  >
                    {pinned ? <Lock className="size-4" aria-hidden /> : <LockOpen className="size-4" aria-hidden />}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
        <Button className="mt-4" disabled={!count} onClick={() => patch({ overrides: {} })}>
          <RotateCcw className="size-4" aria-hidden /> Unpin all
        </Button>
      </div>
    </details>
  );
}
