"use client";

import Link from "next/link";
import { useState } from "react";
import { bestText } from "@/engine";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useCopy } from "@/hooks/use-copy";

export interface ExplorerFamily {
  name: string;
  steps: { stop: number; hex: string; oklch: string; hsl: string; lcWhite: number; lcBlack: number }[];
}

const label = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function TailwindExplorer({ families }: { families: ExplorerFamily[] }) {
  const { copy, message } = useCopy();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const stops = families[0]?.steps.map((s) => s.stop) ?? [];

  return (
    <div className="grid gap-12">
      <section aria-label="All colors" className="overflow-x-auto">
        <div className="grid min-w-[720px] grid-cols-12 items-center gap-2">
          <span />
          {stops.map((s) => (
            <span key={s} className="text-center text-sm text-muted tabular-nums">
              {s}
            </span>
          ))}
          {families.map((f) => (
            <div key={f.name} className="contents">
              <a href={`#${f.name}`} className="text-base font-medium hover:underline">
                {label(f.name)}
              </a>
              {f.steps.map((s) => (
                <button
                  key={s.stop}
                  type="button"
                  onClick={() => copy(s.oklch, `${f.name}-${s.stop}`)}
                  aria-label={`${f.name} ${s.stop}, ${s.hex}. Copy OKLCH value`}
                  title={`${f.name}-${s.stop}  ${s.oklch}  ${s.hex}`}
                  style={{ backgroundColor: s.hex }}
                  className="h-12 rounded-lg hover:scale-105 hover:shadow-float"
                />
              ))}
            </div>
          ))}
        </div>
      </section>

      {families.map((f) => {
        const all = !!open[f.name];
        return (
          <section key={f.name} id={f.name} aria-label={f.name} className="scroll-mt-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-medium">{label(f.name)}</h2>
              <div className="flex flex-wrap items-center gap-3">
                <Link href={`/?b=${f.steps[5]!.hex.slice(1)}`} className="text-base text-muted hover:text-foreground">
                  Start a palette
                </Link>
                <Button onClick={() => setOpen((o) => ({ ...o, [f.name]: !all }))} aria-expanded={all}>
                  {all ? "Hide details" : "Show all details"}
                </Button>
              </div>
            </div>

            <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-11">
              {f.steps.map((s) => {
                const fg = bestText(s.hex).color;
                return (
                  <li key={s.stop}>
                    <button
                      type="button"
                      onClick={() => copy(s.hex, `${f.name}-${s.stop}`)}
                      aria-label={`${f.name} ${s.stop}, ${s.hex}. Copy hex`}
                      style={{ backgroundColor: s.hex, color: fg }}
                      className="flex h-[100px] w-full flex-col justify-end rounded-xl p-3 text-left hover:brightness-95"
                    >
                      <span className="text-[13px] font-semibold leading-tight">{s.stop}</span>
                      <span className="text-[13px] uppercase leading-tight tabular-nums">{s.hex.slice(1)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {all && (
              <div className="mt-5 overflow-x-auto rounded-xl border border-border">
                <table className="w-full min-w-[640px] text-left text-sm tabular-nums">
                  <thead className="bg-surface-muted text-muted">
                    <tr>
                      <th className="px-4 py-2.5">#</th>
                      <th className="px-4 py-2.5">APCA Lc (white / black)</th>
                      <th className="px-4 py-2.5">OKLCH</th>
                      <th className="px-4 py-2.5">Hex</th>
                      <th className="px-4 py-2.5">HSL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {f.steps.map((s, i) => (
                      <tr key={s.stop} className={cn(i > 0 && "border-t border-border")}>
                        <td className="px-4 py-2.5">
                          <span className="flex items-center gap-2">
                            <span aria-hidden className="size-4 rounded-full border border-border" style={{ backgroundColor: s.hex }} />
                            {s.stop}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          {Math.abs(s.lcWhite)} / {Math.abs(s.lcBlack)}
                        </td>
                        {([s.oklch, s.hex, s.hsl] as const).map((v) => (
                          <td key={v} className="px-4 py-2.5">
                            <button type="button" onClick={() => copy(v, "Copied")} className="rounded-md hover:bg-surface-hover" title="Copy">
                              {v}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}

      <div role="status" aria-live="polite" className={message ? "fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-sm text-background shadow-float" : "sr-only-live"}>
        {message}
      </div>
    </div>
  );
}
