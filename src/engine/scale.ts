import { hexToOklch, oklchToHex, hexToRgb8, rgb8ToHex } from "./color-space";
import { CHROMA_FLOOR, GAMUT_FRACTION, L_REF } from "./curves";
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
  /**
   * Hex colors pinned to specific stops. Pinned stops are kept exactly; the other
   * stops re-flow around them (lightness, chroma share and hue are interpolated).
   * An override on the anchor stop is ignored: edit the base color instead.
   */
  overrides?: Partial<Record<Stop, string>>;
}

export interface ScaleStep {
  stop: Stop;
  oklch: Oklch;
  hex: string;
  /** True when requested chroma exceeded the gamut and was reduced. */
  clipped: boolean;
  isAnchor: boolean;
  /** True when this stop was pinned by the user. */
  isOverride: boolean;
  /** True when a contrast rule moved this shade away from its generated value. */
  adjusted?: boolean;
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

interface Control {
  idx: number;
  l: number;
  hue: number;
  /** Fraction of the available gamut used at this stop, relative to GAMUT_FRACTION. */
  share: number;
  /** Set for user-pinned stops. */
  hex?: string;
}

function lightnessTargets(controls: Control[], range: readonly [number, number]): number[] {
  const last = STOPS.length - 1;
  const points = new Map<number, number>(controls.map((c) => [c.idx, c.l]));
  const first = controls[0]!;
  const final = controls[controls.length - 1]!;
  if (!points.has(0)) points.set(0, Math.max(range[0], first.l + 0.02));
  if (!points.has(last)) points.set(last, Math.max(0, Math.min(range[1], final.l - 0.02)));
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

function lerpHue(a: number, b: number, t: number): number {
  const d = ((b - a + 540) % 360) - 180;
  return norm(a + d * t);
}

/**
 * Generate an 11-step 50–950 scale from one base color.
 * Pure and deterministic. The base color is pinned exactly at its anchor stop,
 * and any `overrides` are pinned exactly at theirs.
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
  const shareOf = (c: Oklch, stop: Stop) => {
    const max = maxChroma(c.l, c.h, space);
    return max > 1e-4 ? c.c / (max * GAMUT_FRACTION[stop]) : 0;
  };

  // Control points: the anchor plus every valid user override.
  const controls: Control[] = [{ idx: anchorIdx, l: origin.l, hue: origin.h, share: shareOf(origin, STOPS[anchorIdx]!) }];
  for (const [key, value] of Object.entries(opts.overrides ?? {})) {
    const idx = (STOPS as readonly number[]).indexOf(Number(key));
    const rgb = value ? hexToRgb8(value) : null;
    if (idx < 0 || idx === anchorIdx || !rgb) continue;
    const hex = rgb8ToHex(rgb);
    const c = hexToOklch(hex)!;
    controls.push({ idx, l: c.l, hue: c.h, share: shareOf(c, STOPS[idx]!), hex });
  }
  controls.sort((x, y) => x.idx - y.idx);
  const targets = lightnessTargets(controls, range);

  return STOPS.map((stop, i): ScaleStep => {
    const control = controls.find((c) => c.idx === i);
    const isAnchor = i === anchorIdx;

    if (control?.hex) {
      const oklch = hexToOklch(control.hex)!;
      return { stop, oklch, hex: control.hex, clipped: false, isAnchor: false, isOverride: true };
    }

    let hue: number;
    let share: number;
    const prev = [...controls].reverse().find((c) => c.idx < i);
    const next = controls.find((c) => c.idx > i);
    if (isAnchor) {
      hue = origin.h;
      share = controls.find((c) => c.idx === i)!.share;
    } else if (prev && next) {
      const t = (i - prev.idx) / (next.idx - prev.idx);
      share = prev.share + (next.share - prev.share) * t;
      hue = lerpHue(prev.hue, next.hue, t);
    } else {
      const edge = (prev ?? next)!;
      share = edge.share;
      hue = edge.hue;
    }
    if (!isAnchor) hue = norm(hue + hueShift * Math.max(-1, Math.min(1, (i - anchorIdx) / 5)));

    const l = targets[i]!;
    const cmax = maxChroma(l, hue, space);
    const floor = (CHROMA_FLOOR[stop] ?? 0) * Math.min(1, origin.c / 0.15) * chromaScale;
    const c = Math.min(cmax, Math.max(floor, share * GAMUT_FRACTION[stop] * cmax * chromaScale));
    const requested: Oklch = isAnchor ? origin : { l, c, h: hue };

    const srgb = gamutMap(requested, "srgb");
    let hex = oklchToHex(srgb.oklch);
    if (isAnchor && baseHex) hex = baseHex;

    if (space === "srgb") {
      const final = isAnchor && baseHex ? origin : (hexToOklch(hex) ?? srgb.oklch);
      return { stop, oklch: final, hex, clipped: srgb.clipped, isAnchor, isOverride: false };
    }
    const p3 = gamutMap(requested, "p3");
    // hex stays the sRGB fallback; oklch carries the wider-gamut value.
    return { stop, oklch: p3.oklch, hex, clipped: p3.clipped, isAnchor, isOverride: false };
  });
}
