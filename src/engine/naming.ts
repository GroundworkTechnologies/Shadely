import { hexToOklch, hexToRgb8, linearSrgbToOklab, oklchToHex, rgb8ToLinear } from "./color-space";
import { FAMILY_ANCHORS, NAMED_COLORS } from "./naming-data";
import type { Oklch } from "./types";

export interface ColorName {
  /** Tailwind-style family, e.g. "Indigo". */
  family: string;
  /** Lowercase kebab slug of the family, usable as a palette name. */
  slug: string;
  /** Closest CSS named color, e.g. "Slate Blue". */
  specific: string;
}

const NEUTRAL_FAMILIES = new Set(["slate", "gray", "zinc", "stone", "taupe", "mauve", "mist", "olive"]);
const CHROMA_THRESHOLD = 0.045;

const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const hueDistance = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

const NAMED_LAB = NAMED_COLORS.map(([name, hex]) => {
  const rgb = hexToRgb8(`#${hex}`)!;
  return { name, lab: linearSrgbToOklab(rgb8ToLinear(rgb)) };
});

function nearestNamed(hex: string): string {
  const rgb = hexToRgb8(hex);
  if (!rgb) return "Unknown";
  const [L, a, b] = linearSrgbToOklab(rgb8ToLinear(rgb));
  let best = NAMED_LAB[0]!;
  let bestD = Infinity;
  for (const n of NAMED_LAB) {
    const d = (n.lab[0] - L) ** 2 + (n.lab[1] - a) ** 2 + (n.lab[2] - b) ** 2;
    if (d < bestD) {
      bestD = d;
      best = n;
    }
  }
  return best.name;
}

function nearestFamily(o: Oklch): string {
  if (o.l > 0.985 && o.c < 0.012) return "white";
  if (o.l < 0.1) return "black";
  if (o.c < CHROMA_THRESHOLD) {
    // Low chroma: pick the neutral family whose tint direction is closest.
    const a = o.c * Math.cos((o.h * Math.PI) / 180);
    const b = o.c * Math.sin((o.h * Math.PI) / 180);
    let best = "gray";
    let bestD = Infinity;
    for (const [name, , c, h] of FAMILY_ANCHORS) {
      if (!NEUTRAL_FAMILIES.has(name)) continue;
      const d = (c * Math.cos((h * Math.PI) / 180) - a) ** 2 + (c * Math.sin((h * Math.PI) / 180) - b) ** 2;
      if (d < bestD) {
        bestD = d;
        best = name;
      }
    }
    return o.c < 0.004 ? "neutral" : best;
  }
  let best = "blue";
  let bestD = Infinity;
  for (const [name, , , h] of FAMILY_ANCHORS) {
    if (NEUTRAL_FAMILIES.has(name)) continue;
    const d = hueDistance(o.h, h);
    if (d < bestD) {
      bestD = d;
      best = name;
    }
  }
  return best;
}

/** Human-readable name for a color: a Tailwind-style family plus the nearest CSS color. */
export function colorName(input: string | Oklch): ColorName {
  const hex = typeof input === "string" ? input : null;
  const o = typeof input === "string" ? hexToOklch(input) : input;
  if (!o) return { family: "Unknown", slug: "unknown", specific: "Unknown" };
  const slug = nearestFamily(o);
  const specific = hex ? nearestNamed(hex) : nearestNamed(oklchToHex(o));
  return { family: title(slug), slug, specific };
}
