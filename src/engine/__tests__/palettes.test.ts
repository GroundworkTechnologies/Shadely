import { describe, expect, it } from "vitest";
import { buildScales, HARMONY_OFFSETS } from "../palettes";
import { DEFAULT_STATE, decodeState, encodeState, NEUTRAL_FAMILIES, type PaletteState } from "../state";
import { hexToOklch } from "../color-space";

const state: PaletteState = { ...DEFAULT_STATE, base: "#3b82f6" };
const hueGap = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

describe("harmony scales", () => {
  it("adds one accent scale per offset with the right hue", () => {
    const base = hexToOklch(state.base)!;
    for (const [mode, offsets] of Object.entries(HARMONY_OFFSETS)) {
      const scales = buildScales({ ...state, harmony: mode as never });
      const accents = scales.filter((s) => s.kind === "accent");
      expect(accents, mode).toHaveLength(offsets.length);
      accents.forEach((a, i) => {
        const mid = a.steps.find((x) => x.stop === 500)!.oklch;
        expect(hueGap(mid.h, base.h + offsets[i]!), `${mode} ${a.name}`).toBeLessThan(12);
      });
    }
  });
  it("names scales secondary, accent, tertiary and keeps brand first", () => {
    const names = buildScales({ ...state, harmony: "square" }).map((s) => s.name);
    expect(names.slice(0, 4)).toEqual(["brand", "secondary", "accent", "tertiary"]);
  });
  it("is off by default", () => {
    expect(buildScales(state).some((s) => s.kind === "accent")).toBe(false);
  });
});

describe("neutral options", () => {
  const chroma = (s: PaletteState) => buildScales(s).find((x) => x.kind === "neutral")!.steps[5]!.oklch.c;
  it("every Tailwind neutral family builds", () => {
    for (const family of NEUTRAL_FAMILIES) expect(buildScales({ ...state, neutral: family }).some((s) => s.kind === "neutral")).toBe(true);
  });
  it("tint slider scales the tint, pure has none", () => {
    expect(chroma({ ...state, neutralTint: 200 })).toBeGreaterThan(chroma({ ...state, neutralTint: 50 }));
    expect(chroma({ ...state, neutral: "pure" })).toBeLessThan(0.002);
    expect(chroma({ ...state, neutralTint: 0 })).toBeLessThan(0.003);
  });
});

describe("state codec: new fields", () => {
  it("round-trips anchor, overrides, harmony, neutral family and tint", () => {
    const s: PaletteState = {
      ...state,
      anchor: 400,
      overrides: { 300: "#aabbcc", 800: "#112233" },
      harmony: "triadic",
      neutral: "slate",
      neutralTint: 140,
    };
    expect(decodeState(encodeState(s))).toEqual(s);
  });
  it("ignores bad values", () => {
    const s = decodeState("a=123&lk=300:zzzzzz,999:aabbcc,200:AABBCC&hm=zz&n=nope&nt=abc");
    expect(s.anchor).toBe("auto");
    expect(s.overrides).toEqual({ 200: "#aabbcc" });
    expect(s.harmony).toBe("off");
    expect(s.neutral).toBe("tinted");
    expect(s.neutralTint).toBe(100);
  });
  it("applies anchor and overrides to the brand scale", () => {
    const brand = buildScales({ ...state, anchor: 700, overrides: { 200: "#c9d7f3" } })[0]!;
    expect(brand.steps.find((x) => x.isAnchor)!.stop).toBe(700);
    expect(brand.steps.find((x) => x.stop === 200)!.hex).toBe("#c9d7f3");
  });
});
