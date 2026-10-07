import { parseColor } from "./parse";
import { oklchToHex } from "./color-space";

const COLOR = String.raw`(#[0-9a-fA-F]{3,8}\b|(?:rgb|hsl|oklch)a?\([^)]*\))`;

/**
 * Pull a base color out of pasted text: a Tailwind v4 `@theme` block, a v3 config,
 * CSS variables, or a list of shades. Prefers the 500 shade, then 600, then the middle one.
 * Returns the color as #rrggbb, or null.
 */
export function extractBaseColor(text: string): string | null {
  const shades = new Map<number, string>();
  const patterns = [
    new RegExp(String.raw`--[\w-]*?-(\d{2,3})\s*:\s*${COLOR}`, "g"), // --color-brand-500: #…
    new RegExp(String.raw`['"]?\b(\d{2,3})['"]?\s*:\s*['"]${COLOR}['"]`, "g"), // 500: '#…'
  ];
  for (const re of patterns)
    for (const m of text.matchAll(re)) {
      const stop = Number(m[1]);
      const o = parseColor(m[2]!);
      if (o && stop >= 50 && stop <= 950 && !shades.has(stop)) shades.set(stop, oklchToHex(o));
    }
  for (const want of [500, 600, 400]) if (shades.has(want)) return shades.get(want)!;
  if (shades.size) {
    const keys = [...shades.keys()].sort((a, b) => a - b);
    return shades.get(keys[Math.floor(keys.length / 2)]!)!;
  }
  const one = text.match(new RegExp(COLOR));
  const o = one ? parseColor(one[1]!) : null;
  return o ? oklchToHex(o) : null;
}
