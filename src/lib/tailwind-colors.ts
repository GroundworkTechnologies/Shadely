import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { gamutMap, oklchToHex, parseColor, STOPS } from "@/engine";

export interface TwFamily {
  name: string;
  steps: { stop: number; oklch: string; hex: string }[];
}

/** Read Tailwind's own default palette from the installed package so it never goes stale. */
export function tailwindFamilies(): TwFamily[] {
  const css = readFileSync(path.join(process.cwd(), "node_modules/tailwindcss/theme.css"), "utf8");
  const map = new Map<string, TwFamily["steps"]>();
  for (const m of css.matchAll(/--color-([a-z]+)-(\d+):\s*(oklch\([^)]+\));/g)) {
    const [, name, stop, value] = m as unknown as [string, string, string, string];
    const o = parseColor(value);
    if (!o) continue;
    const list = map.get(name) ?? [];
    list.push({ stop: Number(stop), oklch: value, hex: oklchToHex(gamutMap(o).oklch) });
    map.set(name, list);
  }
  return [...map.entries()]
    .map(([name, steps]) => ({ name, steps: steps.sort((a, b) => a.stop - b.stop) }))
    .filter((f) => f.steps.length === STOPS.length);
}
