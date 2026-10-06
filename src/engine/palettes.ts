import { hexToOklch } from "./color-space";
import { FAMILY_ANCHORS } from "./naming-data";
import { applyContrastRules, type RuleResult } from "./constraints";
import { generateScale, type ScaleStep } from "./scale";
import type { HarmonyMode, PaletteState } from "./state";

export interface NamedScale {
  name: string;
  kind: "brand" | "accent" | "neutral" | "status";
  steps: ScaleStep[];
  /** Outcome of the contrast rules applied to this scale, if any. */
  rules?: RuleResult[];
}

/** Hue offsets (degrees) from the brand hue, in the order secondary, accent, tertiary. */
export const HARMONY_OFFSETS: Record<Exclude<HarmonyMode, "off">, number[]> = {
  analogous: [30],
  complementary: [180],
  split: [150, 210],
  triadic: [120, 240],
  tetradic: [60, 180, 240],
  square: [90, 180, 270],
};
export const ACCENT_NAMES = ["secondary", "accent", "tertiary"] as const;

export const STATUS_HUES = { success: 150, warning: 80, danger: 25, info: 245 } as const;

/** Build every scale the state asks for: brand, optional neutral, optional status set. */
export function buildScales(state: PaletteState): NamedScale[] {
  const { tuning } = state;
  const opts = {
    lightnessRange: [tuning.top / 1000, tuning.bottom / 1000] as const,
    chromaScale: tuning.chroma / 100,
    hueShift: tuning.hue,
  };
  const brandOpts = { ...opts, anchor: state.anchor, overrides: state.overrides };
  const out: NamedScale[] = [{ name: state.name, kind: "brand", steps: generateScale(state.base, brandOpts) }];
  const base = hexToOklch(state.base) ?? { l: 0.6, c: 0.1, h: 0 };

  if (state.harmony !== "off") {
    HARMONY_OFFSETS[state.harmony].forEach((offset, i) => {
      out.push({
        name: ACCENT_NAMES[i]!,
        kind: "accent",
        steps: generateScale({ l: base.l, c: base.c, h: (base.h + offset) % 360 }, { ...opts, hueShift: 0 }),
      });
    });
  }

  if (state.neutral !== "off") {
    const k = state.neutralTint / 100;
    let tint = { c: Math.min(base.c * 0.08 * k, 0.04), h: base.h };
    if (state.neutral === "pure") tint = { c: 0, h: base.h };
    else if (state.neutral !== "tinted") {
      const fam = FAMILY_ANCHORS.find(([n]) => n === state.neutral);
      if (fam) tint = { c: Math.min(fam[2] * k, 0.06), h: fam[3] };
    }
    out.push({
      name: "neutral",
      kind: "neutral",
      steps: generateScale({ l: 0.62, c: tint.c, h: tint.h }, { ...opts, chromaScale: 1, hueShift: 0, lightnessRange: [0.985, 0.14] }),
    });
  }
  if (state.status) {
    const c = Math.min(0.2, Math.max(0.12, base.c));
    for (const [name, h] of Object.entries(STATUS_HUES)) {
      out.push({ name, kind: "status", steps: generateScale({ l: 0.62, c, h }, { lightnessRange: [tuning.top / 1000, tuning.bottom / 1000] }) });
    }
  }
  if (!state.targets.length) return out;
  return out.map((scale) => {
    const fixed = applyContrastRules(scale.steps, state.targets);
    return { ...scale, steps: fixed.steps, rules: fixed.results };
  });
}
