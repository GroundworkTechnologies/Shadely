import { hexToOklch } from "./color-space";
import { generateScale, type ScaleStep } from "./scale";
import type { PaletteState } from "./state";

export interface NamedScale {
  name: string;
  kind: "brand" | "neutral" | "status";
  steps: ScaleStep[];
}

export const STATUS_HUES = { success: 150, warning: 80, danger: 25, info: 245 } as const;

/** Build every scale the state asks for: brand, optional neutral, optional status set. */
export function buildScales(state: PaletteState): NamedScale[] {
  const { tuning } = state;
  const opts = {
    lightnessRange: [tuning.top / 1000, tuning.bottom / 1000] as const,
    chromaScale: tuning.chroma / 100,
    hueShift: tuning.hue,
  };
  const out: NamedScale[] = [{ name: state.name, kind: "brand", steps: generateScale(state.base, opts) }];
  const base = hexToOklch(state.base) ?? { l: 0.6, c: 0.1, h: 0 };

  if (state.neutral !== "off") {
    const c = state.neutral === "gray" ? 0 : Math.min(base.c * 0.08, 0.025);
    out.push({
      name: "neutral",
      kind: "neutral",
      steps: generateScale({ l: 0.62, c, h: base.h }, { ...opts, chromaScale: 1, hueShift: 0, lightnessRange: [0.985, 0.14] }),
    });
  }
  if (state.status) {
    const c = Math.min(0.2, Math.max(0.12, base.c));
    for (const [name, h] of Object.entries(STATUS_HUES)) {
      out.push({ name, kind: "status", steps: generateScale({ l: 0.62, c, h }, { lightnessRange: [tuning.top / 1000, tuning.bottom / 1000] }) });
    }
  }
  return out;
}
