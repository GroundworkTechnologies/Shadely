"use client";

import { bestText, type NamedScale } from "@/engine";
import { cn } from "@/lib/cn";

const ROLE: Record<NamedScale["kind"], string> = { brand: "Primary", neutral: "Neutral", status: "Status" };

export function ScaleTiles({
  scales,
  selected,
  onSelect,
  onCopy,
}: {
  scales: NamedScale[];
  selected: string;
  onSelect: (name: string) => void;
  onCopy: (hex: string, label: string) => void;
}) {
  const scale = scales.find((s) => s.name === selected) ?? scales[0]!;
  const anchor = scale.steps.find((s) => s.isAnchor);

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
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-medium">{scale.name}</h2>
          <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-muted">{ROLE[scale.kind]}</span>
        </div>
        <nav aria-label="Scale tools" className="flex gap-1 text-sm">
          {[
            ["#contrast", "Contrast matrix"],
            ["#color-info", "Color info"],
            ["#export", "Export"],
          ].map(([href, label]) => (
            <a key={href} href={href} className="rounded-control px-2.5 py-1.5 text-muted hover:bg-surface-muted hover:text-foreground">
              {label}
            </a>
          ))}
        </nav>
      </div>

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

      <ul className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-11">
        {scale.steps.map((s) => {
          const fg = bestText(s.hex).color;
          return (
            <li key={s.stop}>
              <button
                type="button"
                onClick={() => onCopy(s.hex, `${scale.name}-${s.stop}`)}
                aria-label={`${scale.name} ${s.stop}, ${s.hex}${s.isAnchor ? ", your base color" : ""}${s.clipped ? ", chroma reduced to fit the gamut" : ""}. Copy hex`}
                title={`${scale.name}-${s.stop}  ${s.hex}`}
                style={{ backgroundColor: s.hex, color: fg }}
                className="relative flex h-24 w-full flex-col justify-end rounded-card p-2.5 text-left outline-offset-2 hover:brightness-95"
              >
                {s.isAnchor && <span aria-hidden className="absolute left-2.5 top-2.5 size-2 rounded-full" style={{ backgroundColor: fg }} />}
                {s.clipped && (
                  <span aria-hidden title="Chroma reduced to fit the gamut" className="absolute right-2 top-1.5 text-xs opacity-80">
                    ~
                  </span>
                )}
                <span className="text-sm font-medium leading-tight">{s.stop}</span>
                <span className="tabular-nums text-xs uppercase leading-tight opacity-90">{s.hex.slice(1)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {anchor && scale.kind === "brand" && (
        <p className="mt-3 text-sm text-muted">
          Your color lands on stop <strong className="text-foreground">{anchor.stop}</strong> (the dot), not always 500, so the scale keeps its natural light and dark balance.
        </p>
      )}
    </section>
  );
}
