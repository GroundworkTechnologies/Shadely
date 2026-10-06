"use client";

import { bestText, colorName, type NamedScale, type VisionMode } from "@/engine";
import { cn } from "@/lib/cn";
import { visionStyle } from "./vision";

const ROLE: Record<NamedScale["kind"], string> = { brand: "Primary", accent: "Accent", neutral: "Neutral", status: "Status" };

export function ScaleTiles({
  scales,
  selected,
  onSelect,
  onCopy,
  vision = "normal",
}: {
  scales: NamedScale[];
  selected: string;
  onSelect: (name: string) => void;
  onCopy: (hex: string, label: string) => void;
  vision?: VisionMode;
}) {
  const scale = scales.find((s) => s.name === selected) ?? scales[0]!;
  const named = colorName((scale.steps.find((s) => s.isAnchor) ?? scale.steps[5]!).hex);

  const onKey = (e: React.KeyboardEvent) => {
    const i = scales.findIndex((s) => s.name === scale.name);
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const target = scales[(next + scales.length) % scales.length]!;
    onSelect(target.name);
    requestAnimationFrame(() => document.getElementById(`stab-${target.name}`)?.focus());
  };

  return (
    <section aria-label="Color scales" className="rounded-card border border-border bg-surface p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-medium">{named.family}</h2>
          <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-muted">{ROLE[scale.kind]}</span>
        </div>
        <nav aria-label="Jump to" className="flex gap-1 text-sm">
          {[
            ["#contrast", "Contrast"],
            ["#export", "Export"],
          ].map(([href, label]) => (
            <a key={href} href={href} className="rounded-control px-2.5 py-1.5 text-muted hover:bg-surface-muted hover:text-foreground">
              {label}
            </a>
          ))}
        </nav>
      </div>

      {scales.length > 1 && (
        <div role="tablist" aria-label="Scale" onKeyDown={onKey} className="mb-3 flex gap-1 overflow-x-auto">
          {scales.map((s) => (
            <button
              key={s.name}
              id={`stab-${s.name}`}
              role="tab"
              type="button"
              aria-selected={s.name === scale.name}
              tabIndex={s.name === scale.name ? 0 : -1}
              onClick={() => onSelect(s.name)}
              className={cn("flex shrink-0 items-center gap-2 rounded-control px-3 py-1.5 text-sm", s.name === scale.name ? "bg-surface-muted font-medium text-foreground" : "text-muted hover:text-foreground")}
            >
              <span aria-hidden className="size-3 rounded-full border border-border" style={{ backgroundColor: s.steps[5]!.hex }} />
              {s.name}
            </button>
          ))}
        </div>
      )}

      <ul style={visionStyle(vision)} className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-11">
        {scale.steps.map((s) => {
          const fg = bestText(s.hex).color;
          return (
            <li key={s.stop}>
              <button
                type="button"
                onClick={() => onCopy(s.hex, `${scale.name}-${s.stop}`)}
                aria-label={`${named.family} ${s.stop}, ${scale.name}-${s.stop}, ${s.hex}${s.isAnchor ? ", your base color" : ""}. Copy hex`}
                title={`${scale.name}-${s.stop} · ${s.hex}`}
                style={{ backgroundColor: s.hex, color: fg }}
                className="relative flex h-24 w-full flex-col justify-end rounded-card p-2.5 text-left outline-offset-2 hover:brightness-95"
              >
                {s.isAnchor && <span aria-hidden className="absolute left-2.5 top-2.5 size-2 rounded-full" style={{ backgroundColor: fg }} />}
                <span className="text-sm font-medium leading-tight">{s.stop}</span>
                <span className="text-xs uppercase leading-tight tabular-nums">{s.hex.slice(1)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
