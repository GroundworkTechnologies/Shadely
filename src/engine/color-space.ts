import type { Oklch, Rgb } from "./types";

const RAD = Math.PI / 180;

export function srgbToLinear(c: number): number {
  const a = Math.abs(c);
  const v = a <= 0.04045 ? a / 12.92 : ((a + 0.055) / 1.055) ** 2.4;
  return c < 0 ? -v : v;
}

export function linearToSrgb(c: number): number {
  const a = Math.abs(c);
  const v = a <= 0.0031308 ? a * 12.92 : 1.055 * a ** (1 / 2.4) - 0.055;
  return c < 0 ? -v : v;
}

export function linearSrgbToOklab([r, g, b]: Rgb): [number, number, number] {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

export function oklabToLinearSrgb([L, a, b]: readonly [number, number, number]): [number, number, number] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

export function oklabToOklch([L, a, b]: readonly [number, number, number]): Oklch {
  const c = Math.hypot(a, b);
  let h = Math.atan2(b, a) / RAD;
  if (h < 0) h += 360;
  return { l: L, c, h: c < 1e-4 ? 0 : h };
}

export function oklchToOklab({ l, c, h }: Oklch): [number, number, number] {
  return [l, c * Math.cos(h * RAD), c * Math.sin(h * RAD)];
}

export function linearSrgbToOklch(rgb: Rgb): Oklch {
  return oklabToOklch(linearSrgbToOklab(rgb));
}

export function oklchToLinearSrgb(o: Oklch): [number, number, number] {
  return oklabToLinearSrgb(oklchToOklab(o));
}

// Linear sRGB <-> linear Display-P3 (D65), CSS Color 4 matrices.
export function linearSrgbToLinearP3([r, g, b]: Rgb): [number, number, number] {
  return [
    0.8224621 * r + 0.1775380 * g,
    0.0331941 * r + 0.9668058 * g,
    0.0170827 * r + 0.0723974 * g + 0.9105199 * b,
  ];
}

export function linearP3ToLinearSrgb([r, g, b]: Rgb): [number, number, number] {
  return [
    1.2249401 * r - 0.2249404 * g,
    -0.0420569 * r + 1.0420571 * g,
    -0.0196376 * r - 0.0786361 * g + 1.0982735 * b,
  ];
}

export function oklchToLinearP3(o: Oklch): [number, number, number] {
  return linearSrgbToLinearP3(oklchToLinearSrgb(o));
}

/** Convert OKLCH to linear RGB of the given gamut space (may be out of range). */
export function oklchToLinear(o: Oklch, space: "srgb" | "p3"): [number, number, number] {
  return space === "srgb" ? oklchToLinearSrgb(o) : oklchToLinearP3(o);
}

export function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

export function rgb8ToLinear([r, g, b]: readonly [number, number, number]): [number, number, number] {
  return [srgbToLinear(r / 255), srgbToLinear(g / 255), srgbToLinear(b / 255)];
}

export function linearToRgb8(rgb: Rgb): [number, number, number] {
  const f = (c: number) => Math.round(clamp01(linearToSrgb(c)) * 255);
  return [f(rgb[0]), f(rgb[1]), f(rgb[2])];
}

export function rgb8ToHex([r, g, b]: readonly [number, number, number]): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

export function hexToRgb8(hex: string): [number, number, number] | null {
  let h = hex.trim().replace(/^#/, "").toLowerCase();
  if (/^[0-9a-f]{3}$/.test(h)) h = h.replace(/./g, (c) => c + c);
  if (!/^[0-9a-f]{6}$/.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function hexToOklch(hex: string): Oklch | null {
  const rgb = hexToRgb8(hex);
  return rgb ? linearSrgbToOklch(rgb8ToLinear(rgb)) : null;
}

/** Clamp to sRGB and return hex. Callers should gamut-map first for good results. */
export function oklchToHex(o: Oklch): string {
  return rgb8ToHex(linearToRgb8(oklchToLinearSrgb(o)));
}
