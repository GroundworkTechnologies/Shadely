"use client";

import { bestText, type NamedScale } from "@/engine";

export function ScaleStrip({ scale, onCopy }: { scale: NamedScale; onCopy: (hex: string, label: string) => void }) {
  return (
    <section aria-label={`${scale.name} scale`}>
      <h3 className="mb-1.5 flex items-baseline justify-between text-sm font-medium">
        <span>{scale.name}</span>
        <span className="text-xs font-normal text-muted">{scale.kind}</span>
      </h3>
      <ul className="grid grid-cols-11 overflow-hidden rounded-lg border border-border">
        {scale.steps.map((s) => {
          const fg = bestText(s.hex).color;
          return (
            <li key={s.stop}>
              <button
                type="button"
                onClick={() => onCopy(s.hex, `${scale.name}-${s.stop}`)}
                aria-label={`${scale.name} ${s.stop}, ${s.hex}${s.isAnchor ? ", your base color" : ""}${s.clipped ? ", chroma reduced to fit sRGB" : ""}. Copy hex`}
                title={`${scale.name}-${s.stop} ${s.hex}`}
                style={{ backgroundColor: s.hex, color: fg }}
                className="relative flex h-16 w-full flex-col items-center justify-end rounded-none pb-1.5 text-[10px] font-medium leading-tight outline-offset-[-3px] hover:brightness-95 sm:text-xs"
              >
                {s.isAnchor && <span aria-hidden className="absolute left-1/2 top-2 size-1.5 -translate-x-1/2 rounded-full" style={{ backgroundColor: fg }} />}
                <span>{s.stop}</span>
                <span className="hidden font-mono text-[10px] opacity-80 xl:block">{s.hex.slice(1)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
