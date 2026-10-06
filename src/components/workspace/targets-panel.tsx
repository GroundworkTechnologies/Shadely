"use client";

import { Plus, ShieldCheck, Trash2 } from "lucide-react";
import { describeRule, RULE_PRESETS, STOPS, type ContrastRule, type NamedScale, type RuleColor } from "@/engine";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const OPTIONS: { value: string; label: string }[] = [{ value: "white", label: "White" }, { value: "black", label: "Black" }, ...STOPS.map((s) => ({ value: String(s), label: String(s) }))];
const parse = (v: string): RuleColor => (v === "white" || v === "black" ? v : (Number(v) as RuleColor));

const NEW_RULE: ContrastRule = { fg: "white", bg: 600, min: 4.5 };
const STATUS = { pass: "Passes", fixed: "Adjusted", unfixable: "Can't fix" } as const;

function Select({ value, label, onChange }: { value: RuleColor; label: string; onChange: (c: RuleColor) => void }) {
  return (
    <select aria-label={label} value={String(value)} onChange={(e) => onChange(parse(e.target.value))} className="h-9 rounded-control border border-control bg-surface px-1.5 text-sm">
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/**
 * Contrast rules: "this shade on that one must reach N:1". Tintwork moves the fewest shades the
 * smallest distance to satisfy them. The base color and pinned shades never move.
 */
export function TargetsPanel({ targets, brand, onChange }: { targets: ContrastRule[]; brand: NamedScale; onChange: (t: ContrastRule[]) => void }) {
  const set = (i: number, patch: Partial<ContrastRule>) => onChange(targets.map((r, k) => (k === i ? { ...r, ...patch } : r)));
  const adjusted = brand.steps.filter((s) => s.adjusted).length;

  return (
    <details className="rounded-card border border-border bg-surface" open={targets.length > 0}>
      <summary className="flex list-none items-center justify-between px-5 py-4 text-sm font-medium">
        Contrast rules
        <span className="text-xs font-normal text-muted">{targets.length ? `${targets.length} active${adjusted ? `, ${adjusted} shades adjusted` : ""}` : "make shades pass automatically"}</span>
      </summary>
      <div className="grid gap-4 border-t border-border p-5">
        <p className="text-sm text-muted">Set a minimum contrast between two shades. Tintwork nudges the lightness of the fewest shades by the least amount, keeping hue and order.</p>

        <ul className="grid gap-3">
          {targets.map((rule, i) => {
            const result = brand.rules?.[i];
            return (
              <li key={i} className="grid gap-2 rounded-control border border-border p-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Select value={rule.fg} label={`Rule ${i + 1} text shade`} onChange={(fg) => fg !== rule.bg && set(i, { fg })} />
                  <span className="text-muted">on</span>
                  <Select value={rule.bg} label={`Rule ${i + 1} background shade`} onChange={(bg) => bg !== rule.fg && set(i, { bg })} />
                  <span className="text-muted">≥</span>
                  <input
                    type="number"
                    aria-label={`Rule ${i + 1} minimum ratio`}
                    min={1.5}
                    max={21}
                    step={0.5}
                    value={rule.min}
                    onChange={(e) => Number.isFinite(e.target.valueAsNumber) && set(i, { min: Math.min(21, Math.max(1.5, e.target.valueAsNumber)) })}
                    className="h-9 w-20 rounded-control border border-control bg-surface px-2 text-sm tabular-nums"
                  />
                  <span className="text-muted">:1</span>
                  <Button variant="ghost" className="ml-auto size-9 px-0" aria-label={`Remove rule: ${describeRule(rule)}`} onClick={() => onChange(targets.filter((_, k) => k !== i))}>
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </div>
                {result && (
                  <p className={cn("flex items-center gap-1.5 text-xs", result.status === "unfixable" ? "text-danger" : "text-muted")} role="status">
                    <ShieldCheck className="size-3.5" aria-hidden />
                    {STATUS[result.status]}
                    {result.status === "fixed" && result.moved ? `: moved ${result.moved} (${result.before.toFixed(1)} to ${result.after.toFixed(1)}:1)` : ""}
                    {result.status === "pass" ? ` at ${result.after.toFixed(1)}:1` : ""}
                    {result.status === "unfixable" ? `: ${result.after.toFixed(1)}:1. The shades that could move are your base color or pinned shades.` : ""}
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => onChange([...targets, NEW_RULE].slice(0, 12))}>
            <Plus className="size-4" aria-hidden /> Add rule
          </Button>
          <select
            aria-label="Add a preset rule"
            value=""
            onChange={(e) => {
              const p = RULE_PRESETS.find((x) => x.id === e.target.value);
              if (p) onChange([...targets, ...p.rules].slice(0, 12));
            }}
            className="h-9 rounded-control border border-control bg-surface px-2 text-sm"
          >
            <option value="">Add a preset…</option>
            {RULE_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <Button variant="ghost" disabled={!targets.length} onClick={() => onChange([])}>
            Clear
          </Button>
        </div>
      </div>
    </details>
  );
}
