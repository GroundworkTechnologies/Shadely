import { hexToOklch, oklchToHex } from "./color-space";
import { wcagRatio } from "./contrast";
import { gamutMap, maxChroma } from "./gamut";
import type { ScaleStep } from "./scale";
import { STOPS, type Oklch, type Stop } from "./types";

/** One side of a contrast rule: a stop of the scale, or plain white or black. */
export type RuleColor = Stop | "white" | "black";

/** "fg text on bg must reach `min`:1" (WCAG 2.2 contrast ratio). */
export interface ContrastRule {
  fg: RuleColor;
  bg: RuleColor;
  min: number;
}

export interface RuleResult {
  rule: ContrastRule;
  /** pass: already met. fixed: a shade moved to meet it. unfixable: the shades that could move are pinned. */
  status: "pass" | "fixed" | "unfixable";
  /** The stop that was moved, when status is "fixed". */
  moved?: Stop;
  before: number;
  after: number;
}

export const MIN_RATIO = 1.5;
export const MAX_RATIO = 21;

const L_MIN = 0.03;
const L_MAX = 0.99;

const isStop = (c: RuleColor): c is Stop => typeof c === "number";

export function isValidRule(r: ContrastRule): boolean {
  const ok = (c: RuleColor) => c === "white" || c === "black" || (STOPS as readonly number[]).includes(c as number);
  return ok(r.fg) && ok(r.bg) && r.fg !== r.bg && Number.isFinite(r.min) && r.min >= MIN_RATIO && r.min <= MAX_RATIO;
}

export function describeRule(r: ContrastRule): string {
  const name = (c: RuleColor) => (isStop(c) ? String(c) : c);
  return `${name(r.fg)} on ${name(r.bg)} ≥ ${r.min}:1`;
}

/** The one-click "pass AA" rule set the UI offers. */
export const AA_RULES: ContrastRule[] = [
  { fg: "white", bg: 600, min: 4.5 },
  { fg: 900, bg: 100, min: 4.5 },
];

/** Common starting points. */
export const RULE_PRESETS: { id: string; label: string; rules: ContrastRule[] }[] = [
  { id: "aa-600", label: "White text on 600 passes AA", rules: [{ fg: "white", bg: 600, min: 4.5 }] },
  { id: "aa-tints", label: "900 text on 100 passes AA", rules: [{ fg: 900, bg: 100, min: 4.5 }] },
  { id: "aaa-body", label: "800 text on 50 passes AAA", rules: [{ fg: 800, bg: 50, min: 7 }] },
  {
    id: "ui-states",
    label: "UI states: 500 reaches 3:1 on white, 700 on 100 reaches 4.5:1",
    rules: [
      { fg: 500, bg: "white", min: 3 },
      { fg: 700, bg: 100, min: 4.5 },
    ],
  },
];

function withColor(step: ScaleStep, hex: string): ScaleStep {
  const oklch = hexToOklch(hex) ?? step.oklch;
  return { ...step, hex, oklch, clipped: false, adjusted: true };
}

const GAP = 0.004;

/**
 * How far a stop may move without crossing the nearest pinned neighbors (the base color or
 * pinned shades never move, so lightness order must hold relative to them).
 */
function lightnessBounds(steps: ScaleStep[], i: number): { min: number; max: number } {
  let min = L_MIN;
  let max = L_MAX;
  for (let j = i + 1; j < steps.length; j++) {
    if (steps[j]!.isAnchor || steps[j]!.isOverride) {
      min = Math.max(min, hexToOklch(steps[j]!.hex)!.l + GAP * (j - i));
      break;
    }
  }
  for (let j = i - 1; j >= 0; j--) {
    if (steps[j]!.isAnchor || steps[j]!.isOverride) {
      max = Math.min(max, hexToOklch(steps[j]!.hex)!.l - GAP * (i - j));
      break;
    }
  }
  return { min, max };
}

/** Move a stop's lightness the minimum distance (bisection) so `test(hex)` passes. Returns null if it cannot. */
function nudge(step: ScaleStep, toward: "lighter" | "darker", bounds: { min: number; max: number }, test: (hex: string) => boolean): string | null {
  const cur = hexToOklch(step.hex)!;
  const make = (l: number): string => {
    const cmax = maxChroma(l, cur.h);
    const o: Oklch = { l, c: Math.min(cur.c, cmax), h: cur.h };
    return oklchToHex(gamutMap(o).oklch);
  };
  const limit = toward === "lighter" ? bounds.max : bounds.min;
  if ((toward === "lighter" && limit <= cur.l) || (toward === "darker" && limit >= cur.l)) return null;
  if (!test(make(limit))) return null;
  let pass = limit;
  let fail = cur.l; // the current value is known to fail
  for (let i = 0; i < 22; i++) {
    const mid = (pass + fail) / 2;
    if (test(make(mid))) pass = mid;
    else fail = mid;
  }
  return make(pass);
}

/** Keep lightness ordered after moves: pinned and anchor stops never move, others give way. */
function restoreOrder(steps: ScaleStep[]): ScaleStep[] {
  const out = steps.map((s) => ({ ...s }));
  const movable = (s: ScaleStep) => !s.isAnchor && !s.isOverride;
  const shift = (i: number, l: number) => {
    const cur = hexToOklch(out[i]!.hex)!;
    const cmax = maxChroma(l, cur.h);
    const hex = oklchToHex(gamutMap({ l, c: Math.min(cur.c, cmax), h: cur.h }).oklch);
    out[i] = withColor(out[i]!, hex);
  };
  for (let i = 1; i < out.length; i++) {
    const prev = hexToOklch(out[i - 1]!.hex)!.l;
    const cur = hexToOklch(out[i]!.hex)!.l;
    if (cur > prev - GAP && movable(out[i]!)) shift(i, Math.max(L_MIN, prev - GAP));
  }
  for (let i = out.length - 2; i >= 0; i--) {
    const next = hexToOklch(out[i + 1]!.hex)!.l;
    const cur = hexToOklch(out[i]!.hex)!.l;
    if (cur < next + GAP && movable(out[i]!)) shift(i, Math.min(L_MAX, next + GAP));
  }
  return out;
}

/**
 * Make a scale satisfy contrast rules with the smallest possible change.
 * For each failing rule the foreground stop moves (or the background stop when the foreground
 * is white, black or pinned). The base color and pinned shades never move.
 */
export function applyContrastRules(steps: ScaleStep[], rules: readonly ContrastRule[]): { steps: ScaleStep[]; results: RuleResult[] } {
  let cur = steps.map((s) => ({ ...s }));
  const hexOf = (c: RuleColor, list: ScaleStep[]) => (c === "white" ? "#ffffff" : c === "black" ? "#000000" : list.find((s) => s.stop === c)!.hex);
  const valid = rules.filter(isValidRule);
  const before = valid.map((r) => wcagRatio(hexOf(r.fg, cur), hexOf(r.bg, cur)));
  const moved: (Stop | undefined)[] = valid.map(() => undefined);

  valid.forEach((rule, k) => {
    if (wcagRatio(hexOf(rule.fg, cur), hexOf(rule.bg, cur)) >= rule.min) return;
    const canMove = (c: RuleColor) => isStop(c) && !cur.find((s) => s.stop === c)!.isAnchor && !cur.find((s) => s.stop === c)!.isOverride;
    const mover = canMove(rule.fg) ? rule.fg : canMove(rule.bg) ? rule.bg : null;
    if (mover === null || !isStop(mover)) return;
    const other = mover === rule.fg ? rule.bg : rule.fg;
    const i = cur.findIndex((s) => s.stop === mover);
    const otherHex = hexOf(other, cur);
    const otherL = hexToOklch(otherHex)!.l;
    const moverL = hexToOklch(cur[i]!.hex)!.l;
    const direction = other === "white" ? "darker" : other === "black" ? "lighter" : moverL > otherL ? "lighter" : "darker";
    const test = (hex: string) => (mover === rule.fg ? wcagRatio(hex, otherHex) : wcagRatio(otherHex, hex)) >= rule.min;
    const hex = nudge(cur[i]!, direction, lightnessBounds(cur, i), test);
    if (hex) {
      cur[i] = withColor(cur[i]!, hex);
      moved[k] = mover;
    }
  });

  cur = restoreOrder(cur);

  const results = valid.map((rule, k): RuleResult => {
    const after = wcagRatio(hexOf(rule.fg, cur), hexOf(rule.bg, cur));
    const status = after >= rule.min ? (before[k]! >= rule.min ? "pass" : "fixed") : "unfixable";
    return { rule, status, moved: status === "fixed" ? moved[k] : undefined, before: before[k]!, after };
  });
  return { steps: cur, results };
}
