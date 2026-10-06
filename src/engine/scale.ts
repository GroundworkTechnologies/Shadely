import { hexToOklch, oklchToHex, hexToRgb8, rgb8ToHex } from "./color-space";
import { GAMUT_FRACTION, L_REF } from "./curves";
import { gamutMap, maxChroma } from "./gamut";
import { parseColor } from "./parse";
import { STOPS, type GamutSpace, type Oklch, type Stop } from "./types";

export interface ScaleOptions {
  /** Which stop the base color lands on. 'auto' = nearest by lightness. */
  anchor?: "auto" | Stop;
  /** Target lightness for stops 50 and 950. */
  lightnessRange?: readonly [number, number];
  /** Multiplier for chroma at all non-anchor stops. */
  chromaScale?: number;
  /** Degrees of hue added per half-scale toward darker stops. */
  hueShift?: number;
  gamut?: GamutSpace;
}

export interface ScaleStep {
  stop: Stop;
  oklch: Oklch;
  hex: string;
  /** True when requested chroma exceeded the gamut and was reduced. */
  clipped: boolean;
  isAnchor: boolean;
}

export const DEFAULT_LIGHTNESS_RANGE = [0.975, 0.27] as const;

const norm = (h: number) => ((h % 360) + 360) % 360;

export function pickAnchor(l: number): number {
  let best = 5;
  let bestD = Infinity;
  STOPS.forEach((s, i) => {
    const d = Math.abs(L_REF[s] - l);
    if (d < bestD - 1e-9 || (Math.abs(d - bestD) <= 1e-9 && Math.abs(i - 5) < Math.abs(best - 5))) {
      best = i;
      bestD = d;
    }
  });
  return best;
}

function lightnessTargets(anchorIdx: number, l0: number, range: readonly [number, number]): number[] {
  const last = STOPS.length - 1;
  const top = anchorIdx === 0 ? l0 : Math.max(range[0], l0 + 0.02);
  const bottom = anchorIdx === last ? l0 : Math.max(0, Math.min(range[1], l0 - 0.02));
  const points = new Map<number, number>([
    [0, top],
    [anchorIdx, l0],
    [last, bottom],
  ]);
  const idxs = [...points.keys()].sort((a, b) => a - b);
  const out: number[] = new Array(STOPS.length).fill(0);
  for (let k = 0; k < idxs.length - 1; k++) {
    const p = idxs[k]!;
    const q = idxs[k + 1]!;
    const lp = points.get(p)!;
    const lq = points.get(q)!;
    const rp = L_REF[STOPS[p]!];
    const rq = L_REF[STOPS[q]!];
    for (let i = p; i <= q; i++) {
      const t = (L_REF[STOPS[i]!] - rp) / (rq - rp);
      out[i] = lp + (lq - lp) * t;
    }
  }
  return out;
}

/**
 * Generate an 11-step 50–950 scale from one base color.
 * Pure and deterministic. The base color is pinned exactly at its anchor stop.
 */
export function generateScale(base: string | Oklch, opts: ScaleOptions = {}): ScaleStep[] {
  const space = opts.gamut ?? "srgb";
  const range = opts.lightnessRange ?? DEFAULT_LIGHTNESS_RANGE;
  const chromaScale = opts.chromaScale ?? 1;
  const hueShift = opts.hueShift ?? 0;

  let baseHex: string | null = null;
  let o: Oklch;
  if (typeof base === "string") {
    const parsed = parseColor(base);
    if (!parsed) throw new Error(`Invalid color: ${base}`);
    o = parsed;
    const rgb = hexToRgb8(base);
    if (rgb) baseHex = rgb8ToHex(rgb);
  } else {
    o = base;
  }
  const origin = baseHex ? (hexToOklch(baseHex) ?? o) : o;

  const anchorIdx = opts.anchor && opts.anchor !== "auto" ? STOPS.indexOf(opts.anchor) : pickAnchor(origin.l);
  const anchorStop = STOPS[anchorIdx]!;
  const targets = lightnessTargets(anchorIdx, origin.l, range);

  // Fraction of the available gamut the base color uses at its own stop;
  // other stops use the same share, shaped by GAMUT_FRACTION.
  const baseMax = maxChroma(origin.l, origin.h, space);
  const share = baseMax > 1e-4 ? origin.c / (baseMax * GAMUT_FRACTION[anchorStop]) : 0;

  return STOPS.map((stop, i): ScaleStep => {
    const isAnchor = i === anchorIdx;
    const hue = norm(origin.h + hueShift * Math.max(-1, Math.min(1, (i - anchorIdx) / 5)));
    const l = targets[i]!;
    const c = Math.min(maxChroma(l, hue, space), share * GAMUT_FRACTION[stop] * maxChroma(l, hue, space) * chromaScale);
    const requested: Oklch = isAnchor ? origin : { l, c, h: hue };

    const srgb = gamutMap(requested, "srgb");
    let hex = oklchToHex(srgb.oklch);
    if (isAnchor && baseHex) hex = baseHex;

    if (space === "srgb") {
      const final = isAnchor && baseHex ? origin : (hexToOklch(hex) ?? srgb.oklch);
      return { stop, oklch: final, hex, clipped: srgb.clipped, isAnchor };
    }
    const p3 = gamutMap(requested, "p3");
    // hex stays the sRGB fallback; oklch carries the wider-gamut value.
    return { stop, oklch: p3.oklch, hex, clipped: p3.clipped, isAnchor };
  });
}
