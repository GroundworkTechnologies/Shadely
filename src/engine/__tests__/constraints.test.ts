import { describe, expect, it } from "vitest";
import { applyContrastRules, describeRule, isValidRule, RULE_PRESETS, type ContrastRule } from "../constraints";
import { wcagRatio } from "../contrast";
import { hexToOklch, rgb8ToHex } from "../color-space";
import { generateScale } from "../scale";
import { buildScales } from "../palettes";
import { DEFAULT_STATE, decodeState, encodeState } from "../state";

const hexAt = (steps: { stop: number; hex: string }[], stop: number) => steps.find((s) => s.stop === stop)!.hex;
const seeded = (n: number) => {
  let seed = 424242;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32;
  return Array.from({ length: n }, () => rgb8ToHex([Math.floor(rnd() * 256), Math.floor(rnd() * 256), Math.floor(rnd() * 256)]));
};

describe("applyContrastRules", () => {
  const white600: ContrastRule = { fg: "white", bg: 600, min: 4.5 };

  it("leaves a scale alone when every rule already passes", () => {
    const steps = generateScale("#1e3a8a");
    const out = applyContrastRules(steps, [white600]);
    expect(out.results[0]!.status).toBe("pass");
    expect(out.steps.map((s) => s.hex)).toEqual(steps.map((s) => s.hex));
  });

  it("fixes a failing rule by moving the minimum amount", () => {
    const steps = generateScale("#3b82f6");
    const rule: ContrastRule = { fg: "white", bg: 600, min: 7 };
    expect(wcagRatio("#ffffff", hexAt(steps, 600))).toBeLessThan(7);
    const out = applyContrastRules(steps, [rule]);
    expect(out.results[0]!.status).toBe("fixed");
    const after = wcagRatio("#ffffff", hexAt(out.steps, 600));
    expect(after).toBeGreaterThanOrEqual(7);
    // minimal: lands just above the target instead of overshooting
    expect(after).toBeLessThan(7.3);
    expect(out.results[0]!.moved).toBe(600);
  });

  it("never moves the base color or pinned shades", () => {
    const steps = generateScale("#facc15", { anchor: 600, overrides: { 700: "#b08a00" } });
    const out = applyContrastRules(steps, [{ fg: "white", bg: 600, min: 7 }, { fg: "white", bg: 700, min: 7 }]);
    expect(hexAt(out.steps, 600)).toBe("#facc15");
    expect(hexAt(out.steps, 700)).toBe("#b08a00");
    expect(out.results.every((r) => r.status === "unfixable")).toBe(true);
  });

  it("keeps lightness ordered after adjusting", () => {
    for (const base of ["#facc15", "#3b82f6", "#a3e635", "#f43f5e"]) {
      const out = applyContrastRules(generateScale(base), [{ fg: "white", bg: 500, min: 4.5 }, { fg: 900, bg: 100, min: 7 }]);
      for (let i = 1; i < out.steps.length; i++) {
        expect(hexToOklch(out.steps[i]!.hex)!.l, `${base} ${out.steps[i]!.stop}`).toBeLessThanOrEqual(hexToOklch(out.steps[i - 1]!.hex)!.l + 0.001);
      }
    }
  });

  it("keeps hue while adjusting (within quantization)", () => {
    const steps = generateScale("#3b82f6");
    const out = applyContrastRules(steps, [{ fg: 500, bg: 100, min: 7 }]);
    const h0 = hexToOklch(hexAt(steps, 500))!.h;
    const h1 = hexToOklch(hexAt(out.steps, 500))!.h;
    expect(Math.abs(h0 - h1)).toBeLessThan(6);
  });

  it("rules between two stops move the foreground first", () => {
    const steps = generateScale("#3b82f6");
    const out = applyContrastRules(steps, [{ fg: 600, bg: 200, min: 7 }]);
    expect(out.results[0]!.moved).toBe(600);
    expect(hexAt(out.steps, 200)).toBe(hexAt(steps, 200));
  });

  it("reports unfixable, and leaves the shade alone, when the fix would cross the base color", () => {
    const steps = generateScale("#3b82f6"); // base is stop 500
    const out = applyContrastRules(steps, [{ fg: 400, bg: 100, min: 7 }]);
    expect(out.results[0]!.status).toBe("unfixable");
    expect(out.results[0]!.moved).toBeUndefined();
    expect(hexAt(out.steps, 500)).toBe("#3b82f6");
  });

  it("satisfies the white-on-600 AA rule for 300 random bases unless 600 is pinned", () => {
    for (const base of seeded(300)) {
      const steps = generateScale(base);
      const out = applyContrastRules(steps, [white600]);
      const r = out.results[0]!;
      const sixHundred = out.steps.find((s) => s.stop === 600)!;
      if (sixHundred.isAnchor) expect(["pass", "unfixable"]).toContain(r.status);
      else expect(wcagRatio("#ffffff", sixHundred.hex), base).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("every preset is valid and describable", () => {
    for (const p of RULE_PRESETS) for (const r of p.rules) {
      expect(isValidRule(r)).toBe(true);
      expect(describeRule(r)).toContain("≥");
    }
  });

  it("rejects nonsense rules", () => {
    expect(isValidRule({ fg: 500, bg: 500, min: 4.5 })).toBe(false);
    expect(isValidRule({ fg: 500, bg: "white", min: 0.5 })).toBe(false);
    expect(isValidRule({ fg: 500, bg: "white", min: 99 })).toBe(false);
    expect(isValidRule({ fg: 123 as never, bg: "white", min: 4.5 })).toBe(false);
  });
});

describe("rules in palettes and the URL", () => {
  const state = { ...DEFAULT_STATE, base: "#facc15", targets: [{ fg: "white", bg: 600, min: 4.5 }] as ContrastRule[] };
  it("applies to every generated scale and records the outcome", () => {
    const scales = buildScales(state);
    for (const s of scales) {
      expect(s.rules).toHaveLength(1);
      if (s.rules![0]!.status !== "unfixable") expect(wcagRatio("#ffffff", hexAt(s.steps, 600))).toBeGreaterThanOrEqual(4.5);
    }
  });
  it("has no effect and no rules array when there are no targets", () => {
    expect(buildScales({ ...state, targets: [] })[0]!.rules).toBeUndefined();
  });
  it("round-trips through the URL and ignores bad rules", () => {
    const s = { ...state, targets: [{ fg: "white", bg: 600, min: 4.5 }, { fg: 900, bg: 100, min: 7 }, { fg: 800, bg: "black", min: 3.5 }] as ContrastRule[] };
    expect(decodeState(encodeState(s)).targets).toEqual(s.targets);
    expect(decodeState("ct=w~600~4.5,zz~100~7,900~900~4.5,500~w~99,500~w~abc").targets).toEqual([{ fg: "white", bg: 600, min: 4.5 }]);
  });
});
