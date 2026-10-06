import { clamp01, linearSrgbToOklab, oklchToLinear, linearP3ToLinearSrgb, oklabToOklch } from "./color-space";
import type { GamutSpace, Oklch, Rgb } from "./types";

const EPS = 1e-4;
const JND = 0.004; // tighter than CSS Color 4 (0.02): keeps hue drift under ~4°
const EPSILON = 1e-4;

export function inGamut(rgb: Rgb, eps = EPS): boolean {
  return rgb.every((c) => c >= -eps && c <= 1 + eps);
}

function toOklab(rgb: Rgb, space: GamutSpace) {
  return linearSrgbToOklab(space === "srgb" ? rgb : linearP3ToLinearSrgb(rgb));
}

function deltaEOK(a: readonly [number, number, number], b: readonly [number, number, number]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

export interface GamutResult {
  oklch: Oklch;
  /** Linear RGB in the target space, within 0..1. */
  rgb: [number, number, number];
  /** True when chroma had to be reduced noticeably. */
  clipped: boolean;
}

/**
 * CSS Color 4 gamut mapping: reduce chroma at constant L and H, accepting a
 * channel clip once it is within a just-noticeable difference.
 */
export function gamutMap(o: Oklch, space: GamutSpace = "srgb"): GamutResult {
  const finish = (rgb: [number, number, number], clipped: boolean): GamutResult => ({
    oklch: oklabToOklch(toOklab(rgb, space)),
    rgb,
    clipped,
  });
  const clip = (rgb: [number, number, number]): [number, number, number] => [
    clamp01(rgb[0]),
    clamp01(rgb[1]),
    clamp01(rgb[2]),
  ];

  if (o.l >= 1) return finish([1, 1, 1], false);
  if (o.l <= 0) return finish([0, 0, 0], false);

  const direct = oklchToLinear(o, space);
  if (inGamut(direct)) return { oklch: o, rgb: clip(direct), clipped: false };

  let min = 0;
  let max = o.c;
  let minInGamut = true;
  let best = clip(oklchToLinear({ ...o, c: 0 }, space));
  let guard = 0;
  while (max - min > EPSILON && guard++ < 60) {
    const c = (min + max) / 2;
    const cur = oklchToLinear({ ...o, c }, space);
    if (minInGamut && inGamut(cur)) {
      min = c;
      best = clip(cur);
      continue;
    }
    const clipped = clip(cur);
    const e = deltaEOK(toOklab(clipped, space), toOklab(cur, space));
    if (e < JND) {
      if (JND - e < EPSILON) {
        best = clipped;
        break;
      }
      minInGamut = false;
      min = c;
      best = clipped;
    } else {
      max = c;
    }
  }
  const result = finish(best, false);
  result.clipped = o.c - result.oklch.c > 0.002;
  return result;
}

/** Largest in-gamut chroma at a given lightness and hue. */
export function maxChroma(l: number, h: number, space: GamutSpace = "srgb"): number {
  if (l <= 0 || l >= 1) return 0;
  let lo = 0;
  let hi = 0.45;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklchToLinear({ l, c: mid, h }, space), 1e-6)) lo = mid;
    else hi = mid;
  }
  return lo;
}
