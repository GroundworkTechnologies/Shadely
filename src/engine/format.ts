import {
  linearToSrgb,
  linearToRgb8,
  oklchToLinearP3,
  oklchToLinearSrgb,
  rgb8ToHex,
  hexToRgb8,
  clamp01,
} from "./color-space";
import type { Oklch } from "./types";

export type ColorSyntax = "oklch" | "hex" | "hsl" | "rgb" | "p3";

/** Trim trailing zeros: 0.2100 -> 0.21 */
function trim(n: number, dp: number): string {
  const s = n.toFixed(dp);
  return s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "") : s;
}

export function formatOklch(o: Oklch): string {
  const h = o.c < 1e-4 ? 0 : o.h;
  return `oklch(${trim(o.l * 100, 1)}% ${trim(o.c, 3)} ${trim(h, 2)})`;
}

export function formatHex(o: Oklch): string {
  return rgb8ToHex(linearToRgb8(oklchToLinearSrgb(o)));
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const [r8, g8, b8] = hexToRgb8(hex) ?? [0, 0, 0];
  const [r, g, b] = [r8 / 255, g8 / 255, b8 / 255];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

export function formatHsl(hex: string): string {
  const { h, s, l } = hexToHsl(hex);
  return `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%)`;
}

export function formatRgb(hex: string): string {
  const [r, g, b] = hexToRgb8(hex) ?? [0, 0, 0];
  return `rgb(${r} ${g} ${b})`;
}

export function formatP3(o: Oklch): string {
  const [r, g, b] = oklchToLinearP3(o).map((c) => trim(clamp01(linearToSrgb(c)), 4));
  return `color(display-p3 ${r} ${g} ${b})`;
}

/** Space-separated channels for `rgb(var(--x) / <alpha-value>)` patterns. */
export function rgbChannels(hex: string): string {
  const [r, g, b] = hexToRgb8(hex) ?? [0, 0, 0];
  return `${r} ${g} ${b}`;
}
